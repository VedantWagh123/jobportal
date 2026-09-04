import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String }, // e.g., "Engineering", "Design"
    description: { type: String },
    aliases: [{ type: String }], // e.g., ["Frontend Eng", "UI Developer"]
    createdAt: { type: Date, default: Date.now }
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
