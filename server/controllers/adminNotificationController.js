import SuperAdminNotification from "../models/SuperAdminNotification.js";

// Get Super Admin Notifications
export const getAdminNotifications = async (req, res) => {
    try {
        const notifications = await SuperAdminNotification.find().sort({ date: -1 }).limit(50);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark Super Admin Notifications as Read
export const markAdminNotificationsRead = async (req, res) => {
    try {
        await SuperAdminNotification.updateMany({ isRead: false }, { $set: { isRead: true } });
        res.json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
