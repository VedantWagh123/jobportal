import CourseSkill from "../models/CourseSkill.js";
import Course from "../models/Course.js";
import Skill from "../models/Skill.js";

export const createCourseSkill = async (req, res) => {
    try {
        const { courseId, skillId, moduleName, proficiencyTaught } = req.body;
        
        if (!courseId || !skillId || !proficiencyTaught) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(400).json({ success: false, message: "Invalid course reference" });

        const skill = await Skill.findById(skillId);
        if (!skill) return res.status(400).json({ success: false, message: "Invalid skill reference" });

        const existing = await CourseSkill.findOne({ courseId, skillId });
        if (existing) {
            return res.status(400).json({ success: false, message: "Skill already mapped to this course" });
        }

        const courseSkill = await CourseSkill.create({ courseId, skillId, moduleName, proficiencyTaught });
        res.status(201).json({ success: true, courseSkill });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Skill already mapped to this course" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCourseSkills = async (req, res) => {
    try {
        const filter = {};
        if (req.query.courseId) filter.courseId = req.query.courseId;
        if (req.query.skillId) filter.skillId = req.query.skillId;

        const courseSkills = await CourseSkill.find(filter).populate('courseId', 'name').populate('skillId', 'name category');
        res.json({ success: true, courseSkills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCourseSkill = async (req, res) => {
    try {
        const { moduleName, proficiencyTaught } = req.body;
        const courseSkill = await CourseSkill.findByIdAndUpdate(req.params.id, {
            moduleName, proficiencyTaught
        }, { new: true });
        
        if (!courseSkill) return res.status(404).json({ success: false, message: "CourseSkill not found" });

        res.json({ success: true, courseSkill });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCourseSkill = async (req, res) => {
    try {
        const courseSkill = await CourseSkill.findByIdAndDelete(req.params.id);
        if (!courseSkill) return res.status(404).json({ success: false, message: "CourseSkill not found" });

        res.json({ success: true, message: "CourseSkill mapping deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
