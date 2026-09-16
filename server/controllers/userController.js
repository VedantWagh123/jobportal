import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import CurriculumAlert from '../models/CurriculumAlert.js';
import SkillGapService from '../services/skillGapService.js';
import Enrollment from '../models/Enrollment.js';
import Batch from '../models/Batch.js';
import Notification from '../models/Notification.js';
import { v2 as cloudinary } from "cloudinary"
import fs from 'fs';
import Course from '../models/Course.js';
import CourseSkill from '../models/CourseSkill.js';
import CourseReview from '../models/CourseReview.js';
import UserNotification from '../models/UserNotification.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
import { extractSkillsFromResume } from '../services/geminiAiService.js';

// Get User Data
export const getUserData = async (req, res) => {
    try {
        // req.dbUser is pre-populated by requireUser middleware
        const user = req.dbUser;
        res.json({ success: true, user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Sync User Data (Fallback for local dev if webhooks fail)
export const syncUser = async (req, res) => {
    const { name, email, image } = req.body;
    const userId = req.auth?.userId;
    
    if (!userId) {
        return res.json({ success: false, message: 'Clerk authentication failed or token missing.' });
    }

    try {
        let user = await User.findById(userId);
        if (!user) {
            // Check if user exists by email (Clerk recreation case)
            let existingUser = await User.findOne({ email });
            if (existingUser) {
                // Clone the user to the new userId
                const userData = existingUser.toObject();
                userData._id = userId; // Set new Clerk ID
                
                user = await User.create(userData);
                
                // Update references in all related collections
                await JobApplication.updateMany({ userId: existingUser._id }, { userId: userId });
                await Enrollment.updateMany({ userId: existingUser._id }, { userId: userId });
                await UserNotification.updateMany({ userId: existingUser._id }, { userId: userId });
                await CourseReview.updateMany({ userId: existingUser._id }, { userId: userId });
                
                // Delete the old user
                await User.findByIdAndDelete(existingUser._id);
            } else {
                user = await User.create({ _id: userId, name, email, image, resume: '' });
            }
        } else {
            // User already exists — preserve ALL app-managed profile fields.
            // Only sync Clerk-managed identity fields (name, email).
            // NEVER overwrite image: user may have uploaded a custom Cloudinary photo.
            // NEVER touch resume, phone, address, city, college, skills — those are
            // candidate profile data and must only be changed by explicit profile updates.
            user.name = name;
            user.email = email;

            // Only update image if user still has Clerk's CDN URL (no custom photo yet)
            const hasCustomImage = user.image &&
                !user.image.includes('clerk.com') &&
                !user.image.includes('img.clerk') &&
                !user.image.includes('gravatar.com');
            if (!hasCustomImage && image) {
                user.image = image;
            }

            await user.save();
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


// Apply For Job
export const applyForJob = async (req, res) => {

    const { jobId } = req.body
    const userId = req.dbUser._id // from requireUser middleware

    try {

        const isAlreadyApplied = await JobApplication.findOne({ jobId, userId })

        if (isAlreadyApplied) {
            return res.json({ success: false, message: 'Already Applied' })
        }

        const jobData = await Job.findById(jobId)

        if (!jobData) {
            return res.json({ success: false, message: 'Job Not Found' })
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        })
        
        const user = req.dbUser; // already available

        await Notification.create({
            companyId: jobData.companyId,
            type: 'New_Application',
            title: 'New Job Application',
            message: `${user ? user.name : 'A candidate'} applied for ${jobData.title}`,
            link: '/dashboard/view-applications'
        })

        res.json({ success: true, message: 'Applied Successfully' })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Toggle Saved Job
export const toggleSavedJob = async (req, res) => {
    try {
        const userId = req.dbUser._id;
        const { jobId } = req.body;
        
        const user = req.dbUser;
        const jobIndex = user.savedJobs.indexOf(jobId);
        
        if (jobIndex > -1) {
            user.savedJobs.splice(jobIndex, 1);
        } else {
            user.savedJobs.push(jobId);
        }
        
        await user.save();
        res.json({ success: true, savedJobs: user.savedJobs, message: jobIndex > -1 ? 'Job removed from saved list' : 'Job saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get User Applied Applications Data
export const getUserJobApplications = async (req, res) => {

    try {

        const userId = req.dbUser._id // from requireUser middleware
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const applications = await JobApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('jobId', 'title description location category level salary')
            .skip((page - 1) * limit)
            .limit(limit)
            .exec()

        return res.json({ success: true, applications: applications || [] })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }

}

// Update User Resume
export const updateUserResume = async (req, res) => {
    try {

        const userId = req.auth?.userId;
        const resumeFile = req.file;
        const userData = req.dbUser; // from requireUser middleware

        if (resumeFile) {
            try {
                let extractedText = "";
                const dataBuffer = fs.readFileSync(resumeFile.path);
                
                if (resumeFile.mimetype === 'application/pdf' || resumeFile.originalname.toLowerCase().endsWith('.pdf')) {
                    const pdfData = await pdfParse(dataBuffer);
                    if (pdfData && pdfData.text) extractedText = pdfData.text;
                } else if (resumeFile.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || resumeFile.originalname.toLowerCase().endsWith('.docx')) {
                    const docxData = await mammoth.extractRawText({ buffer: dataBuffer });
                    if (docxData && docxData.value) extractedText = docxData.value;
                }
                
                if (extractedText) {
                    const extractedSkills = await extractSkillsFromResume(extractedText);
                    if (extractedSkills.length > 0) {
                        const existingSkills = userData.skills || [];
                        userData.skills = [...new Set([...existingSkills, ...extractedSkills])];
                    }
                }
            } catch (err) {
                console.error("Failed to parse resume for skills:", err.message);
            }

            try {
                // Clean up old resume from Cloudinary if it exists
                if (userData.resume && userData.resume.includes('cloudinary.com')) {
                    const oldPublicId = userData.resume.split('/').slice(-1)[0];
                    if (oldPublicId) {
                        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw' }).catch(err => console.warn("Failed to delete old resume:", err.message));
                    }
                }

                const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, { resource_type: 'raw' })
                userData.resume = resumeUpload.secure_url
                fs.unlink(resumeFile.path, (err) => {
                    if (err) console.error("Failed to delete local file:", err);
                });
            } catch (error) {
                console.warn("Cloudinary resume upload failed, using local file.", error.message);
                userData.resume = `http://localhost:5000/uploads/${resumeFile.filename}`;
            }
        }

        await userData.save()

        return res.json({ success: true, message: 'Resume Updated' })

    } catch (error) {

        res.status(500).json({ success: false, message: error.message })

    }
}

// Complete User Profile (Multi-step form details + File uploads)
export const completeUserProfile = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        const { phone, address, city, college } = req.body;
        
        const userData = req.dbUser; // from requireUser middleware

        // Update fields if provided
        if (phone) userData.phone = phone;
        if (address) userData.address = address;
        if (city) userData.city = city;
        if (college) userData.college = college;
        if (req.body.skills) {
            try {
                const parsedSkills = JSON.parse(req.body.skills);
                if (Array.isArray(parsedSkills)) {
                    userData.skills = parsedSkills;
                }
            } catch (e) {
                console.warn("Could not parse skills JSON");
            }
        }

        // Handle File Uploads (resume and image) via req.files
        if (req.files) {
            // Upload Resume
            if (req.files.resume && req.files.resume[0]) {
                const resumeFile = req.files.resume[0];
                try {
                    // Clean up old resume from Cloudinary if it exists
                    if (userData.resume && userData.resume.includes('cloudinary.com')) {
                        const oldPublicId = userData.resume.split('/').slice(-1)[0];
                        if (oldPublicId) {
                            await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw' }).catch(err => console.warn("Failed to delete old resume:", err.message));
                        }
                    }

                    const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, { resource_type: 'raw' });
                    userData.resume = resumeUpload.secure_url;
                    fs.unlink(resumeFile.path, (err) => {
                        if (err) console.error("Failed to delete local file:", err);
                    });
                } catch (error) {
                    console.warn("Cloudinary resume upload failed, using local file.", error.message);
                    userData.resume = `http://localhost:5000/uploads/${resumeFile.filename}`;
                }
            }
            // Upload Image
            if (req.files.image && req.files.image[0]) {
                const imageFile = req.files.image[0];
                try {
                    if (userData.image && userData.image.includes('cloudinary.com')) {
                        const publicId = userData.image.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(publicId).catch(e => console.warn("Could not delete old image", e.message));
                    }
                    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
                    userData.image = imageUpload.secure_url;
                    fs.unlink(imageFile.path, (err) => {
                        if (err) console.error("Failed to delete local file:", err);
                    });
                } catch (error) {
                    console.warn("Cloudinary image upload failed, using local file.", error.message);
                    userData.image = `http://localhost:5000/uploads/${imageFile.filename}`;
                }
            }
        }

        await userData.save();
        return res.json({ success: true, message: 'Profile updated successfully', user: userData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update User Skills
export const updateUserSkills = async (req, res) => {
    try {
        const { skills } = req.body;

        if (!Array.isArray(skills)) {
            return res.status(400).json({ success: false, message: 'Skills must be an array of strings' });
        }

        const user = req.dbUser; // from requireUser middleware
        user.skills = skills.map(s => String(s).trim()).filter(s => s);
        await user.save();

        res.json({ success: true, message: 'Skills updated successfully', skills: user.skills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Target Jobs for Dropdown
export const getTargetJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;

        // Fetch only basic details of active jobs
        const jobs = await Job.find({ visible: true })
            .select('title location companyId')
            .populate('companyId', 'name image')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Career Analysis (Skill Gap)
export const getCareerAnalysis = async (req, res) => {
    try {
        const { jobId } = req.params;

        const user = req.dbUser; // from requireUser middleware
        const candidateSkills = user.skills || [];

        const analysis = await SkillGapService.getCareerAnalysis(candidateSkills, jobId);

        res.json({ success: true, analysis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Market Recommendations (Home Page)
export const getMarketRecommendations = async (req, res) => {
    try {
        const user = req.dbUser; // from requireUser middleware
        const candidateSkills = user.skills || [];
        const normalizedCandSkills = await SkillGapService.normalizeCandidateSkills(candidateSkills);
        const candSkillIds = new Set(normalizedCandSkills.map(s => s._id.toString()));

        // 1. Fetch active market shortage alerts (Critical / High)
        const activeAlerts = await CurriculumAlert.find({ 
            status: 'Active',
            severity: { $in: ['Critical', 'High', 'Medium'] }
        });

        // 2. Identify missing skills for the candidate
        // Assuming alert.skill is the raw string, we need to map it to a missing skill object
        const missingSkillNames = new Set();
        for (const alert of activeAlerts) {
            // Very simple check: if candidate doesn't have this string in their raw skills
            const hasSkill = candidateSkills.some(cs => cs.toLowerCase().includes(alert.skill.toLowerCase()) || alert.skill.toLowerCase().includes(cs.toLowerCase()));
            if (!hasSkill) {
                missingSkillNames.add(alert.skill);
            }
        }

        if (missingSkillNames.size === 0) {
            return res.json({ success: true, recommendations: [], message: "You already possess the highly demanded skills in the market!" });
        }

        // Convert raw string names back to pseudo skill objects for the service
        const missingSkillsFakeObjs = await SkillGapService.normalizeCandidateSkills(Array.from(missingSkillNames));
        
        // Remove skills the candidate already has (verified by IDs)
        const trueMissingSkills = missingSkillsFakeObjs.filter(s => !candSkillIds.has(s._id.toString())).map(s => ({ id: s._id.toString(), name: s.name }));

        // 3. Find matching courses
        let recommendations = [];
        if (trueMissingSkills.length > 0) {
            recommendations = await SkillGapService.getRecommendationsForMissingSkills(trueMissingSkills);
        }

        // Group recommendations with the alerts that caused them
        const finalRecommendations = recommendations.map(rec => {
            // Find which missing skill string caused this
            const matchingAlerts = activeAlerts.filter(a => rec.coveredSkills.some(cs => cs.toLowerCase().includes(a.skill.toLowerCase()) || a.skill.toLowerCase().includes(cs.toLowerCase())));
            return {
                ...rec,
                urgencyMessage: matchingAlerts.length > 0 ? matchingAlerts[0].message : 'High market demand for these skills.'
            }
        }).slice(0, 4); // Only top 4 recommendations

        // Check if user is already enrolled in any of these batches
        const userEnrollments = await Enrollment.find({ userId }).select('batchId');
        const enrolledBatchIds = new Set(userEnrollments.map(e => e.batchId.toString()));

        const recommendationsWithEnrollmentStatus = finalRecommendations.map(rec => ({
            ...rec,
            isEnrolled: rec.batchId ? enrolledBatchIds.has(rec.batchId.toString()) : false
        }));

        res.json({ success: true, recommendations: recommendationsWithEnrollmentStatus, missingSkills: trueMissingSkills.map(s => s.name) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Enroll in a training batch
export const enrollInBatch = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { batchId } = req.body;

        if (!batchId) {
            return res.status(400).json({ success: false, message: 'Batch ID is required' });
        }

        // Check if batch exists
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        // Check capacity
        if (batch.enrolledCount >= batch.capacity) {
            return res.status(400).json({ success: false, message: 'Batch is full' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ userId, batchId });
        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this batch' });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            userId,
            batchId,
            instituteId: batch.instituteId
        });

        // Increment enrolled count
        batch.enrolledCount += 1;
        await batch.save();

        res.status(201).json({ success: true, message: 'Successfully enrolled!', enrollment });
    } catch (error) {
        console.error("ENROLLMENT ERROR:", error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const extractResumeSkillsAPI = async (req, res) => {
    try {
        const resumeFile = req.file;
        if (!resumeFile) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const dataBuffer = fs.readFileSync(resumeFile.path);
        let extractedText = "";
        
        if (resumeFile.mimetype === 'application/pdf' || resumeFile.originalname.toLowerCase().endsWith('.pdf')) {
            const pdfData = await pdfParse(dataBuffer);
            if (pdfData && pdfData.text) extractedText = pdfData.text;
        } else if (resumeFile.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || resumeFile.originalname.toLowerCase().endsWith('.docx')) {
            const docxData = await mammoth.extractRawText({ buffer: dataBuffer });
            if (docxData && docxData.value) extractedText = docxData.value;
        } else {
            // Unlink early if not supported
            fs.unlink(resumeFile.path, () => {});
            return res.status(400).json({ success: false, message: 'Unsupported file type. Please upload a PDF or DOCX file.' });
        }
        
        let extractedSkills = [];
        if (extractedText) {
            extractedSkills = await extractSkillsFromResume(extractedText);
        }

        // Delete temp file
        fs.unlink(resumeFile.path, (err) => {
            if (err) console.error("Failed to delete local temp file:", err);
        });

        res.json({ success: true, skills: extractedSkills });
    } catch (error) {
        console.error("API EXTRACT SKILLS ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Browse All Public Courses
export const getAllPublicCourses = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        let userSkills = new Set();
        let enrolledCourseIds = new Set();
        
        if (userId) {
            const user = await User.findOne({ _id: userId });
            if (user && user.skills) {
                userSkills = new Set(user.skills.map(s => s.toLowerCase()));
            }
            
            const enrollments = await Enrollment.find({ userId }).populate('batchId');
            enrollments.forEach(e => {
                if (e.batchId && e.batchId.courseId) {
                    enrolledCourseIds.add(e.batchId.courseId.toString());
                }
            });
        }

        const courses = await Course.find({ isActive: true })
            .populate({
                path: 'instituteId',
                populate: { path: 'districtId' }
            });

        const allCourseIds = courses.map(c => c._id);
        const courseSkillsMap = await CourseSkill.find({ courseId: { $in: allCourseIds } }).populate('skillId');
        
        const batches = await Batch.find({ courseId: { $in: allCourseIds }, status: { $in: ['Planning', 'Active'] } });

        const mappedCourses = courses.map(course => {
            const cid = course._id.toString();
            const skills = courseSkillsMap.filter(cs => cs.courseId.toString() === cid).map(cs => cs.skillId.name);
            const cBatches = batches.filter(b => b.courseId.toString() === cid);
            
            let activeBatchId = null;
            let totalStudents = 0;
            if (cBatches.length > 0) {
                activeBatchId = cBatches[0]._id;
                totalStudents = cBatches.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0);
            }

            const isEnrolled = enrolledCourseIds.has(cid);
            
            let category = 'Others';
            const skillsLower = skills.map(s => s.toLowerCase());
            if (skillsLower.some(s => s.includes('ai') || s.includes('machine learning') || s.includes('llm') || s.includes('generative'))) {
                category = 'AI & ML';
            } else if (skillsLower.some(s => s.includes('data') || s.includes('analytics') || s.includes('sql') || s.includes('powerbi'))) {
                category = 'Data & Analytics';
            } else if (skillsLower.some(s => s.includes('design') || s.includes('ui') || s.includes('ux'))) {
                category = 'Design';
            } else if (skillsLower.some(s => s.includes('business') || s.includes('management') || s.includes('marketing'))) {
                category = 'Business';
            } else if (skillsLower.some(s => s.includes('react') || s.includes('node') || s.includes('java') || s.includes('python'))) {
                category = 'Tech & Development';
            }

            return {
                courseId: cid,
                courseName: course.name,
                courseDescription: course.description || '',
                courseImage: course.image || '',
                courseCurriculum: course.curriculum || [],
                durationMonths: course.durationMonths || 0,
                location: course.location || '',
                instituteId: course.instituteId?._id,
                instituteName: course.instituteId?.name || 'Unknown Institute',
                districtName: course.instituteId?.districtId?.name || 'Online',
                instituteQualityScore: course.instituteId?.qualityScore || 0,
                instituteTotalRatings: course.instituteId?.totalRatings || 0,
                courseRating: course.courseRating || 0,
                totalCourseRatings: course.totalCourseRatings || 0,
                coveredSkills: skills,
                category: category,
                batchAvailable: cBatches.length > 0,
                batchId: activeBatchId,
                totalStudents: totalStudents,
                isEnrolled: isEnrolled,
                createdAt: course.createdAt
            };
        });

        let filteredCourses = mappedCourses;
        if (userSkills.size > 0) {
            filteredCourses = mappedCourses.filter(course => {
                if (course.isEnrolled) return true;
                const courseSkillsLower = course.coveredSkills.map(s => s.toLowerCase());
                const hasOverlap = courseSkillsLower.some(s => userSkills.has(s));
                return !hasOverlap;
            });
        }

        filteredCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ success: true, courses: filteredCourses });
    } catch (error) {
        console.error('Error fetching all public courses:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const notifications = await UserNotification.find({ userId }).sort({ date: -1 }).limit(50);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markUserNotificationsRead = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        await UserNotification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
        res.json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitCourseReview = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { courseId, rating, review, notificationId } = req.body;
        if (!courseId || !rating) return res.status(400).json({ success: false, message: 'Course ID and rating are required' });

        await CourseReview.create({ userId, courseId, rating, review });

        const course = await Course.findById(courseId);
        if (course) {
            const currentRating = course.courseRating || 0;
            const currentTotal = course.totalCourseRatings || 0;
            const newRating = ((currentRating * currentTotal) + rating) / (currentTotal + 1);
            course.courseRating = Number(newRating.toFixed(1));
            course.totalCourseRatings = currentTotal + 1;
            await course.save();
        }

        if (notificationId) await UserNotification.findByIdAndDelete(notificationId);
        res.json({ success: true, message: 'Course review submitted successfully' });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'You have already reviewed this course' });
        res.status(500).json({ success: false, message: error.message });
    }
};
