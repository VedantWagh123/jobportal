import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "3D Printer", "MacBook Pro", "Welding Machine"
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingInstitute', required: true },
    quantity: { type: Number, required: true, default: 1 },
    condition: { type: String, enum: ['Good', 'Needs Repair', 'Broken'], default: 'Good' },
    skillsSupported: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }], // Skills this equipment is used to teach
    createdAt: { type: Date, default: Date.now }
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;
