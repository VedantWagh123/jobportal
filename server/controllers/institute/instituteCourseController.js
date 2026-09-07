import Course from '../../models/Course.js';
import Batch from '../../models/Batch.js';
import CurriculumAlert from '../../models/CurriculumAlert.js';
import Enrollment from '../../models/Enrollment.js';
import TrainingInstitute from '../../models/TrainingInstitute.js';
import Skill from '../../models/Skill.js';
import CourseSkill from '../../models/CourseSkill.js';
import { generateResponse } from '../../services/geminiAiService.js';

// --- COURSES ---
export const getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instituteId: req.institute._id }).sort({ createdAt: -1 });
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { name, description, durationMonths, skills, location } = req.body;
        const course = await Course.create({
            instituteId: req.institute._id,
            name,
            description,
            durationMonths,
            location: location || 'Online'
        });

        if (skills && Array.isArray(skills)) {
            for (const skillName of skills) {
                const cleanName = skillName.trim();
                if (!cleanName) continue;
                
                // Find or Create Skill
                // We use regex for case-insensitive search
                let skill = await Skill.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
                if (!skill) {
                    skill = await Skill.create({ name: cleanName });
                }

                await CourseSkill.create({
                    courseId: course._id,
                    skillId: skill._id,
                    proficiencyTaught: 'Intermediate' // default
                });
            }
        }

        res.status(201).json({ success: true, course });
    } catch (error) {
        console.error("COURSE CREATE ERROR:", error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const extractCourseSkills = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.json({ success: true, skills: [] });

        const prompt = `You are an AI assistant for a technical education platform. 
Read the following course description and extract a list of specific technical skills, tools, and frameworks that will be taught.
Return ONLY a comma-separated list of skills, with no other text.
Examples: "Python, Scikit-learn, Machine Learning", or "React, Node.js, MongoDB".

Course Description:
${description}`;

        const aiResponse = await generateResponse(prompt);
        // Clean up the response
        const skillsArray = aiResponse
            .split(',')
            .map(s => s.trim().replace(/['"]/g, ''))
            .filter(s => s.length > 0 && s.length < 50);

        res.json({ success: true, skills: skillsArray });
    } catch (error) {
        console.error("EXTRACT SKILLS ERROR:", error);
        res.status(500).json({ success: false, message: 'Failed to extract skills' });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        await Course.findOneAndDelete({ _id: req.params.id, instituteId: req.institute._id });
        res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- BATCHES ---
export const getMyBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ instituteId: req.institute._id })
            .populate('courseId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, batches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createBatch = async (req, res) => {
    try {
        const { courseId, batchCode, capacity, startDate, endDate } = req.body;
        
        // Ensure course belongs to this institute
        const course = await Course.findOne({ _id: courseId, instituteId: req.institute._id });
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const batch = await Batch.create({
            instituteId: req.institute._id,
            courseId,
            batchCode,
            capacity,
            startDate,
            endDate,
            status: 'Planning'
        });
        
        // Populate course name for the response
        await batch.populate('courseId', 'name');
        
        res.status(201).json({ success: true, batch });
    } catch (error) {
        console.error("BATCH CREATE ERROR:", error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const getBatchEnrollments = async (req, res) => {
    try {
        const { batchId } = req.params;
        
        // Ensure the batch belongs to this institute
        const batch = await Batch.findOne({ _id: batchId, instituteId: req.institute._id });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found or access denied' });
        }

        const enrollments = await Enrollment.find({ batchId })
            .populate('userId', 'name email image')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, enrollments });
    } catch (error) {
        console.error("GET BATCH ENROLLMENTS ERROR:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getInstituteAlerts = async (req, res) => {
    try {
        const instituteId = req.institute._id;
        const institute = await TrainingInstitute.findById(instituteId);
        
        // 1. Fetch Real Metrics
        const activeCourses = await Course.countDocuments({ instituteId });
        
        // Count total students enrolled in this institute's batches
        const batches = await Batch.find({ instituteId }, '_id');
        const batchIds = batches.map(b => b._id);
        const totalStudents = await Enrollment.countDocuments({ batchId: { $in: batchIds } });

        // 2. Fetch AI Alerts filtered by District (or global)
        const activeAlerts = await CurriculumAlert.find({ 
            status: 'Active',
            $or: [
                { districtId: institute.districtId },
                { districtId: null }, // Global alerts
                { districtId: { $exists: false } }
            ]
        })
        .sort({ severity: -1, createdAt: -1 })
        .limit(3);
            
        res.json({ 
            success: true, 
            alerts: activeAlerts,
            metrics: {
                activeCourses,
                totalStudents,
                totalBatches: batches.length
            }
        });
    } catch (error) {
        console.error("GET ALERTS ERROR:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateBatchStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const batch = await Batch.findOneAndUpdate(
            { _id: req.params.id, instituteId: req.institute._id },
            { status },
            { new: true }
        ).populate('courseId', 'name');
        
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateBatch = async (req, res) => {
    try {
        const { courseId, batchCode, capacity, startDate, endDate } = req.body;
        const batch = await Batch.findOne({ _id: req.params.id, instituteId: req.institute._id });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        if (courseId) batch.courseId = courseId;
        if (batchCode) batch.batchCode = batchCode;
        if (capacity) batch.capacity = capacity;
        if (startDate) batch.startDate = startDate;
        if (endDate) batch.endDate = endDate;
        
        await batch.save();
        await batch.populate('courseId', 'name');
        
        res.json({ success: true, message: 'Batch updated', batch });
    } catch (error) {
        console.error("BATCH UPDATE ERROR:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
