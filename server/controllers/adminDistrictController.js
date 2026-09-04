import District from "../models/District.js";

// POST /api/government-admin/districts
export const createDistrict = async (req, res) => {
    try {
        const { name, state, country } = req.body;
        
        if (!name || !state) {
            return res.status(400).json({ success: false, message: "Name and state are required" });
        }

        const existing = await District.findOne({ name, state });
        if (existing) {
            return res.status(400).json({ success: false, message: "District already exists in this state" });
        }

        const district = await District.create({ name, state, country });
        res.status(201).json({ success: true, district });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/government-admin/districts
export const getDistricts = async (req, res) => {
    try {
        const filter = {};
        if (req.query.state) {
            filter.state = req.query.state;
        }

        // Scope handling
        if (req.admin.scope === 'state' && req.admin.state) {
            filter.state = req.admin.state; // Note: admin.state must exist for strict scope
        }

        const districts = await District.find(filter);
        res.json({ success: true, districts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/government-admin/districts/:id
export const getDistrictById = async (req, res) => {
    try {
        const district = await District.findById(req.params.id);
        if (!district) return res.status(404).json({ success: false, message: "District not found" });
        res.json({ success: true, district });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Invalid ID or error' });
    }
};

// PUT /api/government-admin/districts/:id
export const updateDistrict = async (req, res) => {
    try {
        const { name, state, country } = req.body;
        const district = await District.findById(req.params.id);
        
        if (!district) return res.status(404).json({ success: false, message: "District not found" });

        if (name) district.name = name;
        if (state) district.state = state;
        if (country) district.country = country;

        await district.save();
        res.json({ success: true, district });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "District already exists in this state" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
