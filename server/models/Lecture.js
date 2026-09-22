import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingInstitute', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lectureNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['Theory', 'Practical'], required: true },
    duration: { type: Number, required: true }, // duration in minutes
    status: { type: String, enum: ['Draft', 'Coming Soon', 'Published'], default: 'Draft' },
    video: {
        publicId: { type: String },
        secureUrl: { type: String },
        format: { type: String },
        duration: { type: Number }, // duration from cloudinary in seconds
        resourceType: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});

lectureSchema.index({ courseId: 1, lectureNumber: 1 });
lectureSchema.index({ instituteId: 1 });

const Lecture = mongoose.model('Lecture', lectureSchema);

export default Lecture;
