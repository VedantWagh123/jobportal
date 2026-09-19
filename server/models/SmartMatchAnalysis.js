import mongoose from "mongoose";

const smartMatchAnalysisSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    resumeUrl: { type: String }, // Optional, could be a file path or cloudinary url
    fileHash: { type: String, index: true }, // For caching/deduplication
    
    // Extracted raw data from AI
    extractedData: {
        summary: String,
        technicalSkills: [String],
        softSkills: [String],
        experience: [{
            jobTitle: String,
            company: String,
            years: Number,
            description: String
        }],
        education: [{
            degree: String,
            institution: String,
            year: String
        }],
        certifications: [String]
    },

    // Processed Data
    normalizedSkills: [{ type: String }],
    embedding: { type: [Number] }, // Vertex/Gemini embedding vector
    
    // Analysis Status
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    errorMessage: { type: String }
    
}, { timestamps: true });

// Prevent overwrite issue
const SmartMatchAnalysis = mongoose.models.SmartMatchAnalysis || mongoose.model('SmartMatchAnalysis', smartMatchAnalysisSchema);

export default SmartMatchAnalysis;
