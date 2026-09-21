import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    resume: { type: String },
    image: { type: String, required: true },
    skills: [{ type: String }],
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    college: { type: String },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    isPremium: { type: Boolean, default: false },
    razorpayCustomerId: { type: String },
    subscriptionId: { type: String }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

export default User;