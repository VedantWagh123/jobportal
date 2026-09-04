import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingInstitute', required: true },
    name: { type: String, required: true },
    description: { type: String },
    targetRole: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    durationMonths: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

courseSchema.index({ instituteId: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;
