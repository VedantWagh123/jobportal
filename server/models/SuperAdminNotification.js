import mongoose from "mongoose";

const superAdminNotificationSchema = new mongoose.Schema({
    type: { type: String, enum: ['New_Institute', 'System_Alert', 'Job_Spike', 'Unresolved_Skill', 'New_Employer'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    date: { type: Number, default: () => Date.now() }
});

export default mongoose.model('SuperAdminNotification', superAdminNotificationSchema);
