import TrainingInstitute from "../models/TrainingInstitute.js";
import District from "../models/District.js";

export const createInstitute = async (req, res) => {
    try {
        const { name, email, password, districtId, type, accreditation } = req.body;
        
        if (!name || !email || !password || !districtId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const district = await District.findById(districtId);
        if (!district) return res.status(400).json({ success: false, message: "Invalid district reference" });

        const existing = await TrainingInstitute.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: "Email already registered" });

        const institute = await TrainingInstitute.create({ name, email, password, districtId, type, accreditation });
        
        // Hide password in response
        institute.password = undefined;
        res.status(201).json({ success: true, institute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInstitutes = async (req, res) => {
    try {
        const filter = {};
        if (req.query.districtId) filter.districtId = req.query.districtId;
        if (req.query.type) filter.type = req.query.type;
        // active/inactive might be added later, currently no isActive flag in schema, keeping it ready

        const institutes = await TrainingInstitute.find(filter).select('-password').populate('districtId', 'name state');
        res.json({ success: true, institutes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInstituteById = async (req, res) => {
    try {
        const institute = await TrainingInstitute.findById(req.params.id).select('-password').populate('districtId');
        if (!institute) return res.status(404).json({ success: false, message: "Institute not found" });
        res.json({ success: true, institute });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Invalid ID or error' });
    }
};

export const updateInstitute = async (req, res) => {
    try {
        const { name, districtId, type, accreditation } = req.body;
        
        if (districtId) {
            const district = await District.findById(districtId);
            if (!district) return res.status(400).json({ success: false, message: "Invalid district reference" });
        }

        const institute = await TrainingInstitute.findByIdAndUpdate(req.params.id, {
            name, districtId, type, accreditation
        }, { new: true }).select('-password');
        
        if (!institute) return res.status(404).json({ success: false, message: "Institute not found" });

        res.json({ success: true, institute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
