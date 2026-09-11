import Enrollment from "../models/Enrollment.js";
import TrainingBatch from "../models/TrainingBatch.js";
import Company from "../models/Company.js";
import User from "../models/User.js";

export const createEnrollment = async (req, res) => {
    try {
        const { userId, batchId, status, placementStatus, placementCompanyId, employerFeedbackScore } = req.body;
        
        if (!userId || !batchId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const batch = await TrainingBatch.findById(batchId);
        if (!batch) return res.status(400).json({ success: false, message: "Invalid batch reference" });

        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ success: false, message: "Invalid user reference" });

        if (placementCompanyId) {
            const company = await Company.findById(placementCompanyId);
            if (!company) return res.status(400).json({ success: false, message: "Invalid company reference" });
        }

        const existing = await Enrollment.findOne({ userId, batchId });
        if (existing) {
            return res.status(400).json({ success: false, message: "Candidate already enrolled in this batch" });
        }

        const enrollment = await Enrollment.create({ 
            userId, batchId, instituteId: batch.instituteId, status, placementStatus, placementCompanyId, employerFeedbackScore 
        });
        res.status(201).json({ success: true, enrollment });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Candidate already enrolled in this batch" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getEnrollments = async (req, res) => {
    try {
        const filter = {};
        if (req.query.batchId) filter.batchId = req.query.batchId;
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.placementStatus) filter.placementStatus = req.query.placementStatus;

        // User is populated dynamically or fetched individually since userId is a string reference.
        // For now we populate batchId and placementCompanyId
        const enrollments = await Enrollment.find(filter)
            .populate({ path: 'batchId', select: 'batchName courseId instituteId' })
            .populate('placementCompanyId', 'name');

        res.json({ success: true, enrollments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getEnrollmentById = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id)
            .populate('batchId')
            .populate('placementCompanyId', 'name');
            
        if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
        res.json({ success: true, enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Invalid ID or error' });
    }
};

export const updateEnrollment = async (req, res) => {
    try {
        const { status, placementStatus, placementCompanyId, employerFeedbackScore } = req.body;
        
        if (placementCompanyId) {
            const company = await Company.findById(placementCompanyId);
            if (!company) return res.status(400).json({ success: false, message: "Invalid company reference" });
        }

        const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, {
            status, placementStatus, placementCompanyId, employerFeedbackScore
        }, { new: true });
        
        if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });

        res.json({ success: true, enrollment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAdminUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('name email _id');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAdminCompanies = async (req, res) => {
    try {
        const companies = await Company.find({}).select('name _id');
        res.json({ success: true, companies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
