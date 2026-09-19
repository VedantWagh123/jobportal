import Company from "../models/Company.js";
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import fs from 'fs';
import Job from "../models/Job.js";
import District from "../models/District.js";
import JobApplication from "../models/JobApplication.js";
import UserNotification from '../models/UserNotification.js';
import User from "../models/User.js";
import { generateResponse } from "../services/geminiAiService.js";
import { runAIAnalysis } from "../services/geminiAiService.js";
import { parseJobDescription } from "../services/aiService.js";
import Notification from "../models/Notification.js";
import SuperAdminNotification from "../models/SuperAdminNotification.js";
import Skill from "../models/Skill.js";
import JobSkill from "../models/JobSkill.js";
import { clearCache } from "../utils/cache.js";
import { aiQueue } from "../config/queue.js";
import { getIO } from "../config/socket.js";

// Register a new company
export const registerCompany = async (req, res) => {

    const { name, email, password, description, location, website, contactDetails, industry, companySize, foundedYear, keyResponsibilities, linkedinUrl } = req.body

    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
        return res.json({ success: false, message: "Missing Details" })
    }

    try {

        const companyExists = await Company.findOne({ email })

        if (companyExists) {
            return res.json({ success: false, message: 'Company already registered' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        let imageUrl = '';
        try {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path)
            imageUrl = imageUpload.secure_url;
            fs.unlink(imageFile.path, (err) => {
                if (err) console.error("Failed to delete local file:", err);
            });
        } catch (error) {
            console.warn("Cloudinary upload failed, using local file instead.", error.message);
            imageUrl = `http://localhost:5000/uploads/${imageFile.filename}`;
        }

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUrl,
            status: 'Pending',
            description: description || '',
            location: location || '',
            website: website || '',
            contactDetails: contactDetails || '',
            industry: industry || '',
            companySize: companySize || '',
            foundedYear: foundedYear || null,
            keyResponsibilities: keyResponsibilities || '',
            linkedinUrl: linkedinUrl || ''
        })

        // Notify Super Admin
        await SuperAdminNotification.create({
            type: 'New_Employer',
            title: 'New Employer Registration',
            message: `${name} has registered and is pending approval.`,
            link: '/admin/employers'
        });

        // Emit real-time WebSockets event to Super Admin
        try {
            const io = getIO();
            io.to('super_admin_room').emit('admin_notification', { 
                message: `New employer registered: ${name}`, 
                type: 'employer' 
            });
        } catch (err) {
            console.error("Socket error:", err.message);
        }

        res.json({
            success: true,
            message: 'Registration submitted successfully! Your account is pending admin approval.'
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Login Company
export const loginCompany = async (req, res) => {

    const { email, password } = req.body

    try {

        const company = await Company.findOne({ email })

        if (!company) {
            return res.json({ success: false, message: 'Invalid email or password' })
        }

        if (company.status === 'Banned') {
            return res.json({ success: false, message: 'Your account has been banned. Please contact support.' })
        }

        if (company.status === 'Pending') {
            return res.json({ success: false, message: 'Your account is pending admin approval.' })
        }

        if (await bcrypt.compare(password, company.password)) {

            const { accessToken, refreshToken } = generateToken(company._id);
            
            company.refreshTokens = company.refreshTokens || [];
            company.refreshTokens.push(refreshToken);
            await company.save();

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                success: true,
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: accessToken
            })

        }
        else {
            res.json({ success: false, message: 'Invalid email or password' })
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }

}

// Get Company Data
export const getCompanyData = async (req, res) => {

    try {

        const company = req.company

        res.json({ success: true, company })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }

}

// Helper to save manual skills into ontology and JobSkill
const syncJobSkills = async (jobId, skillsArray) => {
    if (!skillsArray || !Array.isArray(skillsArray)) return;
    
    // Clear existing skills if updating
    await JobSkill.deleteMany({ jobId });
    
    for (const skillName of skillsArray) {
        if (!skillName || typeof skillName !== 'string') continue;
        const normalized = skillName.trim();
        if (!normalized) continue;
        
        let skillDoc = await Skill.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${normalized}$`, "i") } },
                { aliases: { $regex: new RegExp(`^${normalized}$`, "i") } }
            ]
        });
        
        if (!skillDoc) {
            skillDoc = await Skill.create({
                name: normalized.charAt(0).toUpperCase() + normalized.slice(1),
                category: "Technical Skill"
            });
        } else if (skillDoc.category === "Uncategorized" || !skillDoc.category) {
            skillDoc.category = "Technical Skill";
            await skillDoc.save();
        }
        
        await JobSkill.create({
            jobId,
            skillId: skillDoc._id,
            proficiency: 'Unspecified',
            isCore: true,
            extractedViaAI: false
        });
    }
};

// Post New Job
export const postJob = async (req, res) => {

    const { title, description, responsibilities, requirements, location, salary, level, category, vacancies, skills, jobType } = req.body

    const companyId = req.company._id

    try {
        let districtId = null;
        if (location) {
            const dist = await District.findOne({ name: { $regex: new RegExp(`^${location.trim()}$`, 'i') } });
            if (dist) districtId = dist._id;
        }

        const newJob = new Job({
            title,
            description,
            responsibilities: responsibilities || '',
            requirements: requirements || '',
            location,
            districtId,
            salary,
            companyId,
            date: Date.now(),
            level,
            category,
            jobType: jobType || 'Full Time',
            vacancies: vacancies || 1,
            skills: skills || []
        })

        await newJob.save()
        
        // Sync manual skills to JobSkill ontology
        if (skills && skills.length > 0) {
            await syncJobSkills(newJob._id, skills);
        }

        // Trigger AI Parsing asynchronously via Redis Queue
        try {
            await aiQueue.add('parse-job', {
                jobId: newJob._id,
                title: newJob.title,
                description: newJob.description
            });
        } catch (queueErr) {
            console.error("[Queue Error] Failed to add job to ai-parsing-queue:", queueErr.message);
        }

        runAIAnalysis().catch(err => console.error("Background AI failed:", err));

        // Invalidate caches
        clearCache('/api/jobs');
        clearCache('/api/state-admin');

        // Emit real-time WebSockets event
        try {
            const io = getIO();
            io.emit('new_job', { title: newJob.title, companyId: newJob.companyId });
            io.emit('notification', { message: `A new job "${newJob.title}" was just posted!`, type: 'job' });
            io.emit('dashboard_stale');

            // Create persistent notifications for users
            const users = await User.find({}).select('_id');
            const notifications = users.map(u => ({
                userId: u._id,
                type: 'System',
                title: 'New Job Posted',
                message: `A new job "${newJob.title}" was just posted!`,
                link: `/apply-job/${newJob._id}`
            }));
            if (notifications.length > 0) {
                await UserNotification.insertMany(notifications);
            }
        } catch (err) {
            console.error("Socket/Notification error:", err.message);
        }

        res.json({ success: true, newJob })

    } catch (error) {

        res.status(500).json({ success: false, message: error.message })

    }


}

// Edit Existing Job
export const editJob = async (req, res) => {
    try {
        const companyId = req.company._id;
        const jobId = req.params.id;
        const { title, description, responsibilities, requirements, location, salary, level, category, vacancies, skills, jobType } = req.body;

        const job = await Job.findOne({ _id: jobId, companyId });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        let districtId = job.districtId;
        if (location && location !== job.location) {
            const dist = await District.findOne({ name: { $regex: new RegExp(`^${location.trim()}$`, 'i') } });
            if (dist) districtId = dist._id;
        }

        job.title = title || job.title;
        job.description = description || job.description;
        if (responsibilities !== undefined) job.responsibilities = responsibilities;
        if (requirements !== undefined) job.requirements = requirements;
        job.location = location || job.location;
        job.districtId = districtId;
        job.salary = salary || job.salary;
        job.level = level || job.level;
        job.category = category || job.category;
        job.jobType = jobType || job.jobType;
        job.vacancies = vacancies || job.vacancies;
        if (skills !== undefined) job.skills = skills;

        await job.save();
        
        if (skills !== undefined && Array.isArray(skills)) {
            await syncJobSkills(job._id, skills);
        }

        clearCache('/api/jobs');
        clearCache('/api/state-admin');
        try {
            getIO().emit('dashboard_stale');
        } catch (err) {}
        
        res.json({ success: true, message: 'Job updated successfully', job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Company Job Applicants
export const getCompanyJobApplicants = async (req, res) => {
    try {

        const companyId = req.company._id

        // Find job applications for the user and populate related data
        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name image resume skills email phone address city college')
            .populate('jobId', 'title location category level salary skills')
            .exec()

        return res.json({ success: true, applications })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get Company Posted Jobs
export const getCompanyPostedJobs = async (req, res) => {
    try {

        const companyId = req.company._id

        const jobs = await Job.find({ companyId })

        // Optimize fetching applicants count using aggregation
        const applicantsCount = await JobApplication.aggregate([
            { $match: { companyId: req.company._id } },
            { $group: { _id: "$jobId", count: { $sum: 1 } } }
        ]);

        const countsMap = applicantsCount.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr.count;
            return acc;
        }, {});

        const jobsData = jobs.map(job => ({
            ...job.toObject(),
            applicants: countsMap[job._id.toString()] || 0
        }));

        res.json({ success: true, jobsData })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Change Job Application Status (ATS Pipeline)
export const ChangeJobApplicationsStatus = async (req, res) => {
    try {
        const { id, status } = req.body;

        // Fetch existing application to capture previousStatus
        const application = await JobApplication.findById(id);
        if (!application) {
            return res.json({ success: false, message: 'Application not found' });
        }

        application.previousStatus = application.status;
        application.status = status;
        await application.save();

        const userIdStr = application.userId.toString();
        const notificationMessage = `Your job application status has been updated to: ${status}`;

        // Create User Notification
        await UserNotification.create({
            userId: userIdStr,
            type: 'Job_Status',
            title: 'Application Status Update',
            message: notificationMessage,
            link: '/applications'
        });

        // Emit real-time WebSockets event to the candidate
        try {
            const io = getIO();
            io.emit('candidate_notification', { 
                userId: userIdStr, 
                message: notificationMessage, 
                type: 'job' 
            });
        } catch (err) {
            console.error("Socket error:", err.message);
        }

        res.json({ success: true, message: 'Status Changed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Company Notifications
export const getCompanyNotifications = async (req, res) => {
    try {
        const companyId = req.company._id;
        const notifications = await Notification.find({ companyId }).sort({ date: -1 }).limit(50);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark Notifications as Read
export const markCompanyNotificationsRead = async (req, res) => {
    try {
        const companyId = req.company._id;
        await Notification.updateMany({ companyId, isRead: false }, { $set: { isRead: true } });
        res.json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change Job Visiblity
export const changeVisiblity = async (req, res) => {
    try {

        const { id } = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if (companyId.toString() === job.companyId.toString()) {
            job.visible = !job.visible
        }

        await job.save()

        // Invalidate public jobs cache since visibility changed
        clearCache('/api/jobs');
        clearCache('/api/state-admin');
        try {
            getIO().emit('dashboard_stale');
        } catch (err) {}

        res.json({ success: true, job })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const extractJobSkills = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.json({ success: true, skills: [] });

        // Strip HTML tags for AI
        const plainText = description.replace(/<[^>]*>?/gm, '');
        
        const prompt = `You are an AI assistant for a technical job portal. 
Read the following job description and extract a list of specific technical skills, tools, frameworks, programming languages, and databases required for the job.
DO NOT extract soft skills (e.g. communication, teamwork) or random words.
Return ONLY a comma-separated list of skills, with no other text.
Examples: "React, Node.js, AWS", or "Python, MongoDB, Docker".

Job Description:
${plainText}`;

        const aiResponse = await generateResponse(prompt, "");
        
        if (!aiResponse || aiResponse.trim() === "") {
            // Graceful Fallback if AI fails completely
            console.warn("[extractJobSkills] AI failed to extract skills. Returning empty array.");
            return res.json({ success: true, skills: [] });
        }

        // Clean up the response
        const skillsArray = aiResponse
            .split(',')
            .map(s => s.trim().replace(/['"]/g, ''))
            .filter(s => s.length > 0 && s.length < 50);

        res.json({ success: true, skills: skillsArray });
    } catch (error) {
        console.error("EXTRACT JOB SKILLS ERROR:", error);
        // Fallback gracefully rather than returning 500 if possible, but keeping 500 for critical errors
        res.status(500).json({ success: false, message: 'Failed to extract skills', skills: [] });
    }
};

// Get Company Notifications
export const getNotifications = async (req, res) => {
    try {
        const companyId = req.company._id;
        const notifications = await Notification.find({ companyId }).sort({ date: -1 }).limit(50);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark Notification as Read
export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.body;
        const companyId = req.company._id;
        
        if (id) {
            await Notification.findOneAndUpdate({ _id: id, companyId }, { isRead: true });
        } else {
            // Mark all as read
            await Notification.updateMany({ companyId, isRead: false }, { isRead: true });
        }
        
        res.json({ success: true, message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Company Profile
export const updateCompanyProfile = async (req, res) => {
    try {
        const companyId = req.company._id;
        const { name, description, location, website, contactDetails, industry, companySize, foundedYear, keyResponsibilities, linkedinUrl } = req.body;
        const imageFile = req.file;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        if (name) company.name = name;
        if (description !== undefined) company.description = description;
        if (location !== undefined) company.location = location;
        if (website !== undefined) company.website = website;
        if (contactDetails !== undefined) company.contactDetails = contactDetails;
        if (industry !== undefined) company.industry = industry;
        if (companySize !== undefined) company.companySize = companySize;
        if (foundedYear !== undefined) company.foundedYear = foundedYear;
        if (keyResponsibilities !== undefined) company.keyResponsibilities = keyResponsibilities;
        if (linkedinUrl !== undefined) company.linkedinUrl = linkedinUrl;

        if (imageFile) {
            try {
                if (company.image && company.image.includes('cloudinary.com')) {
                    const publicId = company.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId).catch(e => console.warn("Could not delete old image", e.message));
                }
                const imageUpload = await cloudinary.uploader.upload(imageFile.path);
                company.image = imageUpload.secure_url;
                fs.unlink(imageFile.path, (err) => {
                    if (err) console.error("Failed to delete local file:", err);
                });
            } catch (error) {
                console.warn("Cloudinary upload failed, using local file instead.", error.message);
                company.image = `http://localhost:5000/uploads/${imageFile.filename}`;
            }
        }

        await company.save();

        res.json({ 
            success: true, 
            message: "Profile updated successfully", 
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image,
                description: company.description,
                location: company.location,
                website: company.website,
                contactDetails: company.contactDetails,
                industry: company.industry,
                companySize: company.companySize,
                foundedYear: company.foundedYear,
                keyResponsibilities: company.keyResponsibilities,
                linkedinUrl: company.linkedinUrl
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const refreshCompanyToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) return res.status(401).json({ success: false, message: 'Unauthorized - No Refresh Token' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const company = await Company.findById(decoded.id);

        if (!company || !company.refreshTokens.includes(refreshToken)) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Invalid Refresh Token' });
        }

        const accessToken = jwt.sign({ id: company._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ success: true, token: accessToken });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized - Token Expired or Invalid' });
    }
};