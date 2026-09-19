import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Banned'], default: 'Approved' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    contactDetails: { type: String, default: '' },
    industry: { type: String, default: '' },
    companySize: { type: String, default: '' },
    foundedYear: { type: Number, default: null },
    keyResponsibilities: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    refreshTokens: [{ type: String }]
}, { timestamps: true })

const Company = mongoose.model('Company', companySchema)

export default Company