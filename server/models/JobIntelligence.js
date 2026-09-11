import mongoose from "mongoose";

const jobIntelligenceSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, unique: true },
    extractedRole: { type: String },
    inferredExperience: { type: String }, // e.g. "2-4 years"
    extractedSkills: [{ type: String }], // raw extracted skill strings
    processedAt: { type: Date, default: Date.now }
});

const JobIntelligence = mongoose.model('JobIntelligence', jobIntelligenceSchema);

export default JobIntelligence;
