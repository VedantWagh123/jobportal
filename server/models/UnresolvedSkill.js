import mongoose from "mongoose";

const unresolvedSkillSchema = new mongoose.Schema({
    rawName: { type: String, required: true },
    normalizedName: { type: String, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    confidence: { type: Number },
    source: { type: String, default: 'job_intelligence' },
    status: { type: String, enum: ['pending', 'reviewed', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// Ensure a single job doesn't create duplicate unresolved skills for the exact same term
unresolvedSkillSchema.index({ jobId: 1, normalizedName: 1 }, { unique: true });

const UnresolvedSkill = mongoose.model('UnresolvedSkill', unresolvedSkillSchema);

export default UnresolvedSkill;
