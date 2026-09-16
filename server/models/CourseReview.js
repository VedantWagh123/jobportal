import mongoose from "mongoose";

const courseReviewSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Clerk User ID
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }, // Optional tie to a rejection
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

// A user can only review a course once
courseReviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseReview = mongoose.model('CourseReview', courseReviewSchema);

export default CourseReview;
