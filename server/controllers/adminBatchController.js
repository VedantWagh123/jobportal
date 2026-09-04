import TrainingBatch from "../models/TrainingBatch.js";
import Course from "../models/Course.js";
import TrainingInstitute from "../models/TrainingInstitute.js";

export const createBatch = async (req, res) => {
    try {
        const { courseId, instituteId, batchName, capacity, startDate, endDate, status } = req.body;
        
        if (!courseId || !instituteId || !batchName || !capacity || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (capacity <= 0) return res.status(400).json({ success: false, message: "Capacity must be > 0" });
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) return res.status(400).json({ success: false, message: "endDate must be >= startDate" });

        const course = await Course.findById(courseId);
        if (!course) return res.status(400).json({ success: false, message: "Invalid course reference" });

        const institute = await TrainingInstitute.findById(instituteId);
        if (!institute) return res.status(400).json({ success: false, message: "Invalid institute reference" });

        const batch = await TrainingBatch.create({ courseId, instituteId, batchName, capacity, startDate, endDate, status });
        res.status(201).json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBatches = async (req, res) => {
    try {
        const filter = {};
        if (req.query.instituteId) filter.instituteId = req.query.instituteId;
        if (req.query.courseId) filter.courseId = req.query.courseId;
        if (req.query.status) filter.status = req.query.status;
        
        if (req.query.startDate && req.query.endDate) {
            filter.startDate = { $gte: new Date(req.query.startDate) };
            filter.endDate = { $lte: new Date(req.query.endDate) };
        }

        const batches = await TrainingBatch.find(filter)
            .populate('instituteId', 'name')
            .populate('courseId', 'name durationMonths');
            
        res.json({ success: true, batches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBatchById = async (req, res) => {
    try {
        const batch = await TrainingBatch.findById(req.params.id)
            .populate('instituteId')
            .populate('courseId');
            
        if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Invalid ID or error' });
    }
};

export const updateBatch = async (req, res) => {
    try {
        const { batchName, capacity, startDate, endDate, status } = req.body;
        
        if (capacity !== undefined && capacity <= 0) {
            return res.status(400).json({ success: false, message: "Capacity must be > 0" });
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) return res.status(400).json({ success: false, message: "endDate must be >= startDate" });
        }

        const batch = await TrainingBatch.findByIdAndUpdate(req.params.id, {
            batchName, capacity, startDate, endDate, status
        }, { new: true });
        
        if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });

        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
