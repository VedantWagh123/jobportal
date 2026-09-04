import mongoose from "mongoose";

const jobSkillSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    proficiency: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Unspecified'], default: 'Unspecified' },
    isCore: { type: Boolean, default: true }, // Whether it's a primary requirement or a 'nice-to-have'
    extractedViaAI: { type: Boolean, default: true }, // To distinguish manual entry vs AI extraction
    createdAt: { type: Date, default: Date.now }
});

// Ensure a job doesn't have duplicate skill entries
jobSkillSchema.index({ jobId: 1, skillId: 1 }, { unique: true });

const JobSkill = mongoose.model('JobSkill', jobSkillSchema);

export default JobSkill;
