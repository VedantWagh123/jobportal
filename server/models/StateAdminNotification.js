import mongoose from "mongoose";

const stateAdminNotificationSchema = new mongoose.Schema({
    state: { type: String, required: true }, // The state this notification belongs to
    type: { type: String, enum: ['New_Institute', 'Placement_Update', 'System_Alert', 'Demand_Spike'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    date: { type: Number, default: () => Date.now() }
});

export default mongoose.model('StateAdminNotification', stateAdminNotificationSchema);
