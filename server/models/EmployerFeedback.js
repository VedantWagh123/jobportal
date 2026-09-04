import mongoose from "mongoose";

const employerFeedbackSchema = new mongoose.Schema({
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingInstitute', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: false },
    skillMatchScore: { type: Number, required: true, min: 1, max: 5 }, // 1 to 5 stars
    comments: { type: String, default: "" },
    status: { type: String, enum: ['Pending', 'Submitted'], default: 'Submitted' },
    createdAt: { type: Date, default: Date.now }
});

// Ensure an employer can only rate a candidate's specific course once
employerFeedbackSchema.index({ employerId: 1, candidateId: 1, courseId: 1 }, { unique: true });

const EmployerFeedback = mongoose.model('EmployerFeedback', employerFeedbackSchema);

export default EmployerFeedback;
