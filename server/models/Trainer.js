import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingInstitute', required: true },
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }], // Skills they are qualified to teach
    experienceYears: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Trainer = mongoose.model('Trainer', trainerSchema);

export default Trainer;
