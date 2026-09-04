import Course from "../models/Course.js";
import TrainingInstitute from "../models/TrainingInstitute.js";
import Role from "../models/Role.js";

export const createCourse = async (req, res) => {
    try {
        const { instituteId, name, description, targetRole, durationMonths, isActive } = req.body;
        
        if (!instituteId || !name || !durationMonths) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const institute = await TrainingInstitute.findById(instituteId);
        if (!institute) return res.status(400).json({ success: false, message: "Invalid institute reference" });

        if (targetRole) {
            const role = await Role.findById(targetRole);
            if (!role) return res.status(400).json({ success: false, message: "Invalid role reference" });
        }

        const course = await Course.create({ instituteId, name, description, targetRole, durationMonths, isActive });
        res.status(201).json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCourses = async (req, res) => {
    try {
        const filter = {};
        if (req.query.instituteId) filter.instituteId = req.query.instituteId;
        if (req.query.targetRole) filter.targetRole = req.query.targetRole;
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

        const courses = await Course.find(filter).populate('instituteId', 'name').populate('targetRole', 'name');
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('instituteId').populate('targetRole');
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });
        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Invalid ID or error' });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const { name, description, targetRole, durationMonths, isActive } = req.body;
        
        if (targetRole) {
            const role = await Role.findById(targetRole);
            if (!role) return res.status(400).json({ success: false, message: "Invalid role reference" });
        }

        const course = await Course.findByIdAndUpdate(req.params.id, {
            name, description, targetRole, durationMonths, isActive
        }, { new: true });
        
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
