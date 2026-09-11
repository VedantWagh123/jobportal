import mongoose from "mongoose";

const instituteNotificationSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingInstitute', required: true },
    type: { type: String, enum: ['System', 'Alert', 'ActionRequired', 'Success'], default: 'System' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    date: { type: Number, default: () => Date.now() }
});

export default mongoose.model('InstituteNotification', instituteNotificationSchema);
