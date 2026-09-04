import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    type: { type: String, enum: ['Government', 'Private', 'NGO', 'Corporate'], default: 'Private' },
    accreditation: { type: String }, // e.g., "NSDC", "AICTE"
    createdAt: { type: Date, default: Date.now }
});

// Index for geographical grouping queries
instituteSchema.index({ districtId: 1 });

const TrainingInstitute = mongoose.model('TrainingInstitute', instituteSchema);

export default TrainingInstitute;
