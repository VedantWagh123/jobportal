import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingInstitute', required: true },
    batchName: { type: String, required: true },
    capacity: { type: Number, required: true }, // How many students can be trained
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Planned', 'Ongoing', 'Completed', 'Cancelled'], default: 'Planned' },
    createdAt: { type: Date, default: Date.now }
});

batchSchema.index({ status: 1 });
batchSchema.index({ endDate: 1 });

const TrainingBatch = mongoose.model('TrainingBatch', batchSchema);

export default TrainingBatch;
