import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingInstitute', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
    batchCode: { type: String, required: true },
    capacity: { type: Number, required: true }, // e.g., 50 students
    enrolledCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Planning', 'Active', 'Completed', 'Cancelled'], default: 'Planning' },
    createdAt: { type: Date, default: Date.now }
});

batchSchema.index({ instituteId: 1, courseId: 1 });

const Batch = mongoose.model('Batch', batchSchema);

export default Batch;
