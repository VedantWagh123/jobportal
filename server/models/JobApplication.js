import mongoose from "mongoose";

// ATS Pipeline stages:
// Applied → Screening → Test_Cleared → GD_Cleared → Interview_Scheduled → Interview_Completed → Hired / Rejected
const ATS_STAGES = ['Applied', 'Screening', 'Test_Cleared', 'GD_Cleared', 'Interview_Scheduled', 'Interview_Completed', 'Hired', 'Rejected'];

const JobApplicationSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, enum: ATS_STAGES, default: 'Applied' },
    previousStatus: { type: String, default: null }, // Tracks last stage for feedback trigger logic
    feedbackSubmitted: { type: Boolean, default: false }, // Prevents duplicate feedback
    date: { type: Number, required: true }
});

const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);

export { ATS_STAGES };
export default JobApplication;