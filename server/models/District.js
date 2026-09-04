import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
    name: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    createdAt: { type: Date, default: Date.now }
});

// Ensure the same district name is not duplicated within the same state
districtSchema.index({ name: 1, state: 1 }, { unique: true });

const District = mongoose.model('District', districtSchema);

export default District;
