import Job from "../models/Job.js";
import JobIntelligence from "../models/JobIntelligence.js";
import { parseJobDescription } from "../services/aiService.js";

// @route   POST /api/intelligence/parse-job
export const parseJobManually = async (req, res, next) => {
    try {
        const { jobId } = req.body;
        if (!jobId) return res.status(400).json({ success: false, message: "jobId is required" });

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        // Run synchronously for testing/admin purposes
        await parseJobDescription(job._id, job.title, job.description);

        const intelligence = await JobIntelligence.findOne({ jobId });
        res.json({ success: true, message: "Job parsed successfully", intelligence });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/intelligence/status/:jobId
export const getIntelligenceStatus = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId).select('intelligenceStatus intelligenceLastError');
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        const intelligence = await JobIntelligence.findOne({ jobId });

        res.json({ 
            success: true, 
            status: job.intelligenceStatus, 
            error: job.intelligenceLastError,
            intelligence 
        });
    } catch (error) {
        next(error);
    }
};
