import InstituteNotification from '../../models/InstituteNotification.js';

export const getNotifications = async (req, res) => {
    try {
        const notifications = await InstituteNotification.find({ instituteId: req.institute._id }).sort({ date: -1 }).limit(50);
        res.json({ success: true, notifications });
    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching notifications' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notification = await InstituteNotification.findOneAndUpdate(
            { _id: req.params.id, instituteId: req.institute._id },
            { isRead: true },
            { new: true }
        );
        if (notification) {
            res.json({ success: true, notification });
        } else {
            res.status(404).json({ success: false, message: 'Notification not found' });
        }
    } catch (error) {
        console.error('Mark Notification Read Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating notification' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await InstituteNotification.updateMany(
            { instituteId: req.institute._id, isRead: false },
            { isRead: true }
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark All Read Error:', error);
        res.status(500).json({ success: false, message: 'Server error updating notifications' });
    }
};
