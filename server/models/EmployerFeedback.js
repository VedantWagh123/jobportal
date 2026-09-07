import mongoose from "mongoose";

// EmployerFeedback — stores per-skill ratings from HR after Interview_Completed stage
// Feedback is MANDATORY for both Hired and Rejected final stages.
const employerFeedbackSchema = new mongoose.Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication', required: true, unique: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: String, ref: 'User', required: true },
    finalStatus: { type: String, enum: ['Hired', 'Rejected'], required: true },
    // Per-skill ratings: each job skill gets rated Strong / Weak / Missing
    skillRatings: [
        {
            skillName: { type: String, required: true },
            rating: { type: String, enum: ['Strong', 'Weak', 'Missing'], required: true }
        }
    ],
    overallComment: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now }
});

const EmployerFeedback = mongoose.model('EmployerFeedback', employerFeedbackSchema);
export default EmployerFeedback;

