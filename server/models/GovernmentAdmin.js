import mongoose from "mongoose";

const governmentAdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['government_admin'], 
        default: 'government_admin' 
    },
    scope: { 
        type: String, 
        enum: ['national', 'state', 'district'], 
        default: 'national' 
    },
    stateName: { type: String, default: 'Maharashtra' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    refreshTokens: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const GovernmentAdmin = mongoose.model('GovernmentAdmin', governmentAdminSchema);

export default GovernmentAdmin;
