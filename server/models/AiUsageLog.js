import mongoose from 'mongoose';

const aiUsageLogSchema = new mongoose.Schema({
    userId: { type: String, required: false, index: true },
    feature: { type: String, required: true, index: true }, // e.g., 'ATS Score', 'Resume Extract'
    promptPreview: { type: String, required: true },
    provider: { type: String, default: 'Google Gemini' },
    modelUsed: { type: String, default: 'gemini-3.6-flash' },
    keyChannel: { type: String, index: true }, // e.g., 'Primary Key', 'Fallback Key'
    status: { type: String, enum: ['success', 'error'], default: 'success', index: true },
    durationMs: { type: Number, default: 0 },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    errorCode: { type: String },
    errorMessage: { type: String },
    fallbackUsed: { type: Boolean, default: false },
    source: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now, index: true }
});

export default mongoose.model('AiUsageLog', aiUsageLogSchema);
