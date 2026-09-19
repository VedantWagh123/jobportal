import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const instituteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
    type: { type: String, enum: ['Government', 'Private', 'NGO', 'Corporate'], default: 'Private' },
    accreditation: { type: String }, // e.g., "NSDC", "AICTE"
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" }, // Cloudinary Image URL
    isApproved: { type: Boolean, default: false }, // Must be approved by Super Admin before login is allowed
    qualityScore: { type: Number, default: 0 }, // Out of 5
    totalRatings: { type: Number, default: 0 },
    refreshTokens: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

// Index for geographical grouping queries
instituteSchema.index({ districtId: 1 });

instituteSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

instituteSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const TrainingInstitute = mongoose.model('TrainingInstitute', instituteSchema);

export default TrainingInstitute;
