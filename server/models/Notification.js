import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    type: { type: String, enum: ['New_Application', 'Interview_Update', 'Job_Status', 'System'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    date: { type: Number, default: () => Date.now() }
});

export default mongoose.model('Notification', notificationSchema);
