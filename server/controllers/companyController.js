import Company from "../models/Company.js";
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import fs from 'fs';
import Job from "../models/Job.js";
import District from "../models/District.js";
import JobApplication from "../models/JobApplication.js";
import { generateResponse } from "../services/geminiAiService.js";
import { runAIAnalysis } from "../services/geminiAiService.js";
import { parseJobDescription } from "../services/aiService.js";
import Notification from "../models/Notification.js";

// Register a new company
export const registerCompany = async (req, res) => {

    const { name, email, password } = req.body

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
            image: imageUrl
        })

        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id)
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
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

            res.json({
                success: true,
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id)
            })

        }
        else {
            res.json({ success: false, message: 'Invalid email or password' })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get Company Data
export const getCompanyData = async (req, res) => {

    try {

        const company = req.company

        res.json({ success: true, company })

    } catch (error) {
        res.json({
            success: false, message: error.message
        })
    }

}

// Post New Job
export const postJob = async (req, res) => {

    const { title, description, location, salary, level, category, vacancies, skills } = req.body

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
            location,
            districtId,
            salary,
            companyId,
            date: Date.now(),
            level,
            category,
            vacancies: vacancies || 1,
            skills: skills || []
        })

        await newJob.save()

        // Trigger AI Parsing asynchronously (don't await it so we don't block the response)
        parseJobDescription(newJob._id, newJob.title, newJob.description);
        runAIAnalysis().catch(err => console.error("Background AI failed:", err));

        res.json({ success: true, newJob })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }


}

// Get Company Job Applicants
export const getCompanyJobApplicants = async (req, res) => {
    try {

        const companyId = req.company._id

        // Find job applications for the user and populate related data
        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name image resume skills')
            .populate('jobId', 'title location category level salary skills')
            .exec()

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Company Posted Jobs
export const getCompanyPostedJobs = async (req, res) => {
    try {

        const companyId = req.company._id

        const jobs = await Job.find({ companyId })

        // Adding No. of applicants info in data
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({ jobId: job._id });
            return { ...job.toObject(), applicants: applicants.length }
        }))

        res.json({ success: true, jobsData })

    } catch (error) {
        res.json({ success: false, message: error.message })
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

        res.json({ success: true, message: 'Status Changed' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


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

        res.json({ success: true, job })

    } catch (error) {
        res.json({ success: false, message: error.message })
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