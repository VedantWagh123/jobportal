import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
    forceOllama: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
