import EmployerFeedback from "../models/EmployerFeedback.js";
import JobApplication from "../models/JobApplication.js";
import JobSkill from "../models/JobSkill.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Batch from "../models/Batch.js";
import TrainingInstitute from "../models/TrainingInstitute.js";
import UserNotification from "../models/UserNotification.js";
import { getIO } from "../config/socket.js";

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

        // -------------------------------------------------------------
        // ADVANCED FEATURE: Update Institute Quality Score
        // -------------------------------------------------------------
        try {
            // Find candidate's latest enrollment to trace their training institute
            const latestEnrollment = await Enrollment.findOne({ userId: application.userId })
                .sort({ createdAt: -1 })
                .populate('batchId');

            if (latestEnrollment && latestEnrollment.batchId && latestEnrollment.batchId.instituteId) {
                const instituteId = latestEnrollment.batchId.instituteId;
                const institute = await TrainingInstitute.findById(instituteId);

                if (institute) {
                    // Calculate Score out of 5
                    // Base Score: Hired = 4.0, Rejected = 2.0
                    let feedbackScore = finalStatus === 'Hired' ? 4.0 : 2.0;

                    // Skill Modifiers
                    // Strong = +0.5, Weak = -0.2, Missing = -0.5
                    skillRatings.forEach(sr => {
                        if (sr.rating === 'Strong') feedbackScore += 0.5;
                        else if (sr.rating === 'Weak') feedbackScore -= 0.2;
                        else if (sr.rating === 'Missing') feedbackScore -= 0.5;
                    });

                    // Cap the score between 1.0 and 5.0
                    feedbackScore = Math.max(1.0, Math.min(5.0, feedbackScore));

                    // Calculate moving average
                    const currentScore = institute.qualityScore || 0;
                    const currentRatings = institute.totalRatings || 0;
                    
                    const newScore = ((currentScore * currentRatings) + feedbackScore) / (currentRatings + 1);
                    
                    institute.qualityScore = Number(newScore.toFixed(1)); // Round to 1 decimal
                    institute.totalRatings = currentRatings + 1;
                    
                    await institute.save();
                }
            }
        } catch (scoreError) {
            console.error("Failed to update Institute Quality Score:", scoreError);
            // Non-blocking error, we don't return 500 here to not disrupt employer flow
        }

        // -------------------------------------------------------------
        // Send WebSockets Notification to Candidate
        // -------------------------------------------------------------
        const userIdStr = application.userId.toString();
        const notificationMessage = `Your job application status has been updated to: ${finalStatus}`;

        try {
            await UserNotification.create({
                userId: userIdStr,
                type: 'Job_Status',
                title: 'Application Status Update',
                message: notificationMessage,
                link: '/applications'
            });

            const io = getIO();
            io.emit('candidate_notification', { 
                userId: userIdStr, 
                message: notificationMessage, 
                type: 'job' 
            });

            // -------------------------------------------------------------
            // Ask for Course Review if Rejected
            // -------------------------------------------------------------
            if (finalStatus === 'Rejected') {
                const latestEnrollment = await Enrollment.findOne({ userId: application.userId })
                    .sort({ createdAt: -1 })
                    .populate('batchId');

                if (latestEnrollment && latestEnrollment.batchId && latestEnrollment.batchId.courseId) {
                    const courseId = latestEnrollment.batchId.courseId;
                    
                    await UserNotification.create({
                        userId: userIdStr,
                        type: 'Course_Review_Request',
                        title: 'How was your course?',
                        message: 'We noticed your interview did not clear. Please rate your recent training course to help us improve.',
                        link: `/upskill?rateCourse=${courseId}&appId=${applicationId}`
                    });

                    io.emit('candidate_notification', {
                        userId: userIdStr,
                        message: 'Please rate your recent training course.',
                        type: 'review_request',
                        courseId: courseId,
                        applicationId: applicationId
                    });
                }
            }
        } catch (notifError) {
            console.error("Failed to send candidate notification:", notifError.message);
        }

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

        // Fetch all candidate IDs
        const candidateIds = enrollments.map(enr => enr.userId?._id?.toString() || enr.userId);

        // Fetch all feedbacks for these candidates in ONE query to avoid N+1 problem
        const feedbacks = await EmployerFeedback.find({ candidateId: { $in: candidateIds } })
            .populate({ path: 'jobId', select: 'title' })
            .sort({ submittedAt: -1 });

        // Create a lookup map for feedbacks (array of feedbacks per candidate)
        const feedbackMap = {};
        for (const fb of feedbacks) {
            if (!feedbackMap[fb.candidateId]) {
                feedbackMap[fb.candidateId] = [];
            }
            feedbackMap[fb.candidateId].push(fb);
        }

        // Construct results synchronously (One row per feedback per enrollment)
        const results = [];
        
        for (const enr of enrollments) {
            const candidateId = enr.userId?._id?.toString() || enr.userId;
            const candidateFeedbacks = feedbackMap[candidateId] || [];

            if (candidateFeedbacks.length === 0) {
                // No feedback yet
                results.push({
                    studentName: enr.userId?.name || 'Unknown',
                    studentImage: enr.userId?.image || null,
                    courseName: enr.batchId?.courseId?.name || 'Unknown Course',
                    batchCode: enr.batchId?.batchCode || 'N/A',
                    placementStatus: 'Not Interviewed',
                    jobTitle: null,
                    skillRatings: [],
                    overallComment: '',
                    feedbackDate: null
                });
            } else {
                // Generate a row for EACH feedback
                for (const feedback of candidateFeedbacks) {
                    results.push({
                        studentName: enr.userId?.name || 'Unknown',
                        studentImage: enr.userId?.image || null,
                        courseName: enr.batchId?.courseId?.name || 'Unknown Course',
                        batchCode: enr.batchId?.batchCode || 'N/A',
                        placementStatus: feedback.finalStatus,
                        jobTitle: feedback.jobId?.title || null,
                        skillRatings: feedback.skillRatings || [],
                        overallComment: feedback.overallComment || '',
                        feedbackDate: feedback.submittedAt || null
                    });
                }
            }
        }
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
