import mongoose from "mongoose";

const courseSkillSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    moduleName: { type: String },
    proficiencyTaught: { 
        type: String, 
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate skill mappings for the same course
courseSkillSchema.index({ courseId: 1, skillId: 1 }, { unique: true });

const CourseSkill = mongoose.model('CourseSkill', courseSkillSchema);

export default CourseSkill;
