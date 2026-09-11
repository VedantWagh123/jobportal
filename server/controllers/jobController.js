import Job from "../models/Job.js"



// Get All Jobs with Pagination and Filtering
export const getJobs = async (req, res) => {
    try {
        const { page = 1, limit = 6, title, searchLocation, categories, locations } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build Dynamic Query
        let query = { visible: true };

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }
        
        let locationConditions = [];
        if (searchLocation) {
            locationConditions.push({ location: { $regex: searchLocation, $options: 'i' } });
        }
        if (locations) {
            const locArray = locations.split(',');
            if (locArray.length > 0) {
                locationConditions.push({ location: { $in: locArray } });
            }
        }
        if (locationConditions.length > 0) {
            query.$and = locationConditions;
        }

        if (categories) {
            const catArray = categories.split(',');
            if (catArray.length > 0) {
                query.category = { $in: catArray };
            }
        }

        const totalJobs = await Job.countDocuments(query);

        const jobs = await Job.find(query)
            .populate({ path: 'companyId', select: '-password' })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        res.json({ 
            success: true, 
            jobs,
            totalPages: Math.ceil(totalJobs / limitNum),
            currentPage: pageNum,
            totalJobs

        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get Single Job Using JobID
export const getJobById = async (req, res) => {
    try {

        const { id } = req.params

        const job = await Job.findById(id)
            .populate({
                path: 'companyId',
                select: '-password'
            })

        if (!job) {
            return res.json({
                success: false,
                message: 'Job not found'
            })
        }

        res.json({
            success: true,
            job
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}