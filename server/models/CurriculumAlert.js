import mongoose from "mongoose";

const curriculumAlertSchema = new mongoose.Schema({
    skill: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    message: { type: String, required: true },
    recommendedAction: { type: String },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' }, // Optional: If the gap is specific to a district
    status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

const CurriculumAlert = mongoose.model('CurriculumAlert', curriculumAlertSchema);

export default CurriculumAlert;
