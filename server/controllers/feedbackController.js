import EmployerFeedback from "../models/EmployerFeedback.js";
import JobApplication from "../models/JobApplication.js";
import JobSkill from "../models/JobSkill.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Batch from "../models/Batch.js";

// Get required skills for a job — used by frontend to populate the feedback form
export const getJobSkillsForFeedback = async (req, res) => {
    try {
        const { jobId } = req.params;
        const jobSkills = await JobSkill.find({ jobId }).populate('skillId', 'name');
        const skills = jobSkills.filter(js => js.skillId).map(js => js.skillId.name);
        res.json({ success: true, skills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Submit per-skill feedback (mandatory when moving to Hired or Rejected)
export const submitFeedback = async (req, res) => {
    try {
        const { applicationId, finalStatus, skillRatings, overallComment } = req.body;
        const companyId = req.company._id;

        if (!applicationId || !finalStatus || !skillRatings || skillRatings.length === 0) {
            return res.status(400).json({ success: false, message: "applicationId, finalStatus, and skillRatings are required." });
        }

        // Get the application to verify ownership & fetch candidateId / jobId
        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }
        if (application.companyId.toString() !== companyId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }
        if (application.feedbackSubmitted) {
            return res.status(400).json({ success: false, message: "Feedback already submitted for this application." });
        }

        // Save feedback
        await EmployerFeedback.create({
            applicationId,
            companyId,
            jobId: application.jobId,
            candidateId: application.userId,
            finalStatus,
            skillRatings,
            overallComment: overallComment || ''
        });

        // Mark the application as feedback submitted and set final status
        application.previousStatus = application.status;
        application.status = finalStatus;
        application.feedbackSubmitted = true;
        await application.save();

        res.json({ success: true, message: "Feedback submitted and application status updated." });
    } catch (error) {
        console.error("Submit Feedback Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get aggregate quality scores for institutes (used by State Admin / Institute dashboard)
export const getInstituteScores = async (req, res) => {
    try {
        // Per-skill weakness aggregation across all feedback
        const weakSkills = await EmployerFeedback.aggregate([
            { $unwind: "$skillRatings" },
            {
                $group: {
                    _id: "$skillRatings.skillName",
                    weakCount: {
                        $sum: { $cond: [{ $in: ["$skillRatings.rating", ["Weak", "Missing"]] }, 1, 0] }
                    },
                    totalCount: { $sum: 1 }
                }
            },
            { $sort: { weakCount: -1 } },
            { $limit: 10 }
        ]);

        const hireRate = await EmployerFeedback.aggregate([
            {
                $group: {
                    _id: null,
                    hired: { $sum: { $cond: [{ $eq: ["$finalStatus", "Hired"] }, 1, 0] } },
                    total: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            weakSkills,
            hireRate: hireRate[0] || { hired: 0, total: 0 }
        });
    } catch (error) {
        console.error("Get Institute Scores Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// INSTITUTE PORTAL: See placement results for their students
// ============================================================
export const getInstitutePlacementResults = async (req, res) => {
    try {
        const instituteId = req.institute._id;

        // Find all batches for this institute first
        const batches = await Batch.find({ instituteId }).select('_id');
        const batchIds = batches.map(b => b._id);

        // Find all enrollments for these batches
        const enrollments = await Enrollment.find({ batchId: { $in: batchIds } })
            .populate({ path: 'userId', select: 'name image email' })
            .populate({ 
                path: 'batchId', 
                select: 'batchCode courseId',
                populate: { path: 'courseId', select: 'name' }
            });

        // For each enrolled student, find if there's employer feedback
        const results = await Promise.all(enrollments.map(async (enr) => {
            const candidateId = enr.userId?._id?.toString() || enr.userId;

            const feedback = await EmployerFeedback.findOne({ candidateId })
                .populate({ path: 'jobId', select: 'title' })
                .sort({ submittedAt: -1 });

            return {
                studentName: enr.userId?.name || 'Unknown',
                studentImage: enr.userId?.image || null,
                courseName: enr.batchId?.courseId?.name || 'Unknown Course',
                batchCode: enr.batchId?.batchCode || 'N/A',
                placementStatus: feedback ? feedback.finalStatus : 'Not Interviewed',
                jobTitle: feedback?.jobId?.title || null,
                skillRatings: feedback?.skillRatings || [],
                overallComment: feedback?.overallComment || '',
                feedbackDate: feedback?.submittedAt || null
            };
        }));

        // Summary stats
        const hired = results.filter(r => r.placementStatus === 'Hired').length;
        const rejected = results.filter(r => r.placementStatus === 'Rejected').length;
        const pending = results.filter(r => r.placementStatus === 'Not Interviewed').length;

        res.json({ success: true, results, summary: { hired, rejected, pending, total: results.length } });
    } catch (error) {
        console.error("getInstitutePlacementResults Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// STATE ADMIN PORTAL: Aggregated placement insight for govt
// ============================================================
export const getStatePlacementInsights = async (req, res) => {
    try {
        // 1. Overall hire rate
        const hireStats = await EmployerFeedback.aggregate([
            {
                $group: {
                    _id: null,
                    hired: { $sum: { $cond: [{ $eq: ["$finalStatus", "Hired"] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ["$finalStatus", "Rejected"] }, 1, 0] } },
                    total: { $sum: 1 }
                }
            }
        ]);

        // 2. Top weak skills (most frequently rated Weak or Missing across all feedbacks)
        const weakSkills = await EmployerFeedback.aggregate([
            { $unwind: "$skillRatings" },
            { $match: { "skillRatings.rating": { $in: ["Weak", "Missing"] } } },
            { $group: { _id: "$skillRatings.skillName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        // 3. Top strong skills
        const strongSkills = await EmployerFeedback.aggregate([
            { $unwind: "$skillRatings" },
            { $match: { "skillRatings.rating": "Strong" } },
            { $group: { _id: "$skillRatings.skillName", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 4. Recent feedbacks (last 10)
        const recentFeedbacks = await EmployerFeedback.find()
            .sort({ submittedAt: -1 })
            .limit(10)
            .populate({ path: 'jobId', select: 'title location' })
            .populate({ path: 'companyId', select: 'name image' });

        res.json({
            success: true,
            hireStats: hireStats[0] || { hired: 0, rejected: 0, total: 0 },
            weakSkills,
            strongSkills,
            recentFeedbacks
        });
    } catch (error) {
        console.error("getStatePlacementInsights Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
