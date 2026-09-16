import mongoose from "mongoose";

const userNotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: ['Job_Status', 'System'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    date: { type: Number, default: () => Date.now() }
});

export default mongoose.model('UserNotification', userNotificationSchema);
