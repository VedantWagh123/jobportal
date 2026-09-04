import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary } from "cloudinary"

// Get User Data
export const getUserData = async (req, res) => {

    const userId = req.auth.userId

    try {

        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Sync User Data (Fallback for local dev if webhooks fail)
export const syncUser = async (req, res) => {
    const { name, email, image } = req.body;
    const userId = req.auth.userId;
    try {
        let user = await User.findById(userId);
        if (!user) {
            user = await User.create({ _id: userId, name, email, image, resume: '' });
        } else {
            user.name = name;
            user.email = email;
            user.image = image;
            await user.save();
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// Apply For Job
export const applyForJob = async (req, res) => {

    const { jobId } = req.body

    const userId = req.auth.userId

    try {

        const isAlreadyApplied = await JobApplication.find({ jobId, userId })

        if (isAlreadyApplied.length > 0) {
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

        res.json({ success: true, message: 'Applied Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get User Applied Applications Data
export const getUserJobApplications = async (req, res) => {

    try {

        const userId = req.auth.userId

        const applications = await JobApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('jobId', 'title description location category level salary')
            .exec()

        if (!applications) {
            return res.json({ success: false, message: 'No job applications found for this user.' })
        }

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Resume
export const updateUserResume = async (req, res) => {
    try {

        const userId = req.auth.userId

        const resumeFile = req.file

        const userData = await User.findById(userId)

        if (resumeFile) {
            try {
                const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
                userData.resume = resumeUpload.secure_url
            } catch (error) {
                console.warn("Cloudinary resume upload failed, using local file.", error.message);
                userData.resume = `http://localhost:5000/uploads/${resumeFile.filename}`;
            }
        }

        await userData.save()

        return res.json({ success: true, message: 'Resume Updated' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Update User Skills
export const updateUserSkills = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { skills } = req.body; // Expecting an array of strings

        if (!Array.isArray(skills)) {
            return res.status(400).json({ success: false, message: 'Skills must be an array of strings' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.skills = skills.map(s => String(s).trim()).filter(s => s); // Basic sanitization
        await user.save();

        res.json({ success: true, message: 'Skills updated successfully', skills: user.skills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Target Jobs for Dropdown
export const getTargetJobs = async (req, res) => {
    try {
        // Fetch only basic details of active jobs
        const jobs = await Job.find({ visible: true })
            .select('title location companyId')
            .populate('companyId', 'name image')
            .sort({ date: -1 });

        res.json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get Career Analysis (Skill Gap)
import SkillGapService from '../services/skillGapService.js';

export const getCareerAnalysis = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.auth.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const candidateSkills = user.skills || [];

        const analysis = await SkillGapService.getCareerAnalysis(candidateSkills, jobId);

        res.json({ success: true, analysis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}