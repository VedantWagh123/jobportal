import EmployerFeedback from "../models/EmployerFeedback.js";
import TrainingInstitute from "../models/TrainingInstitute.js";

// Submit feedback from employer
export const submitFeedback = async (req, res) => {
    try {
        const { candidateId, instituteId, courseId, jobId, skillMatchScore, comments } = req.body;
        const employerId = req.company._id; // from protectCompany middleware

        if (!candidateId || !instituteId || !courseId || !skillMatchScore) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Check if already submitted
        const existing = await EmployerFeedback.findOne({ employerId, candidateId, courseId });
        if (existing) {
            return res.status(400).json({ success: false, message: "You have already submitted feedback for this candidate for this course." });
        }

        const feedback = await EmployerFeedback.create({
            employerId,
            candidateId,
            instituteId,
            courseId,
            jobId,
            skillMatchScore,
            comments
        });

        // Optional: Update average score on Institute or calculate dynamically
        res.json({ success: true, message: "Feedback submitted successfully", feedback });
    } catch (error) {
        console.error("Submit Feedback Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get aggregate scores for institutes
export const getInstituteScores = async (req, res) => {
    try {
        const scores = await EmployerFeedback.aggregate([
            {
                $group: {
                    _id: "$instituteId",
                    averageScore: { $avg: "$skillMatchScore" },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "traininginstitutes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "institute"
                }
            },
            { $unwind: "$institute" },
            {
                $project: {
                    instituteId: "$_id",
                    instituteName: "$institute.name",
                    averageScore: { $round: ["$averageScore", 1] },
                    totalReviews: 1
                }
            }
        ]);

        res.json({ success: true, scores });
    } catch (error) {
        console.error("Get Institute Scores Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
