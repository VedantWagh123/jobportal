import StateAdminNotification from "../models/StateAdminNotification.js";

// Get State Admin Notifications
export const getStateAdminNotifications = async (req, res) => {
    try {
        let state = 'Maharashtra';
        if (req.admin && req.admin.scope) {
            state = typeof req.admin.scope === 'string' ? req.admin.scope : req.admin.scope.state;
        } else if (req.admin && req.admin.name) {
             state = req.admin.name.toLowerCase().replace('government of ', '').trim();
        }
        
        const notifications = await StateAdminNotification.find({ state }).sort({ date: -1 }).limit(50);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark State Admin Notifications as Read
export const markStateAdminNotificationsRead = async (req, res) => {
    try {
        let state = 'Maharashtra';
        if (req.admin && req.admin.scope) {
            state = typeof req.admin.scope === 'string' ? req.admin.scope : req.admin.scope.state;
        } else if (req.admin && req.admin.name) {
             state = req.admin.name.toLowerCase().replace('government of ', '').trim();
        }
        
        await StateAdminNotification.updateMany({ state, isRead: false }, { $set: { isRead: true } });
        res.json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
