import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    category: { type: String, required: true },
    level: { type: String, required: true },
    jobType: { type: String, default: 'Full Time' },
    skills: [{ type: String }],
    salary: { type: Number, required: true },
    date: { type: Number, required: true },
    visible: { type: Boolean, default: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    vacancies: { type: Number, default: 1, required: true },
    intelligenceStatus: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Failed'], default: 'Pending' },
    intelligenceLastError: { type: String },
    intelligenceRetryCount: { type: Number, default: 0 }
})

// Indexes for fast lookup & pagination
jobSchema.index({ visible: 1, date: -1 });
jobSchema.index({ companyId: 1 });

const Job = mongoose.model('Job', jobSchema)

export default Job