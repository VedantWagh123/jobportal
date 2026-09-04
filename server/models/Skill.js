import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    aliases: [{ type: String }], // e.g., ["React.js", "React JS"]
    category: { type: String }, // e.g., "Programming Languages", "Frameworks"
    subcategory: { type: String }, 
    parentSkillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }, // e.g., JavaScript is parent of React
    relatedSkillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
    createdAt: { type: Date, default: Date.now }
});

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
