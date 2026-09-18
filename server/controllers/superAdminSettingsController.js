import SystemSetting from '../models/SystemSetting.js';

export const getSettings = async (req, res, next) => {
    try {
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({ forceOllama: false });
        }
        res.json({ success: true, settings });
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req, res, next) => {
    try {
        const { forceOllama } = req.body;
        
        let settings = await SystemSetting.findOne();
        if (!settings) {
            settings = await SystemSetting.create({ forceOllama });
        } else {
            settings.forceOllama = forceOllama;
            await settings.save();
        }

        res.json({ success: true, message: "Settings updated successfully", settings });
    } catch (error) {
        next(error);
    }
};
