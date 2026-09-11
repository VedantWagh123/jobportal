import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true }, // Matches Clerk String ID from User model
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingInstitute', required: true }, // Direct reference to avoid N+1 queries
    status: { 
        type: String, 
        enum: ['Enrolled', 'Completed', 'Dropped'], 
        default: 'Enrolled' 
    },
    placementStatus: { 
        type: String, 
        enum: ['Pending', 'Interviewing', 'Placed', 'Not Placed'], 
        default: 'Pending' 
    },
    placementCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    employerFeedbackScore: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for fast lookup
enrollmentSchema.index({ userId: 1 });
enrollmentSchema.index({ batchId: 1 });
enrollmentSchema.index({ instituteId: 1 }); // Important for placement analytics
enrollmentSchema.index({ userId: 1, batchId: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
