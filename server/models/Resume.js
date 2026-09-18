import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    resumeName: { type: String, required: true, default: "Untitled Resume" },
    template: { type: String, default: "ATS Classic" },
    sectionOrder: { 
        type: [String], 
        default: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements'] 
    },
    
    design: {
        fontFamily: { type: String, default: 'Inter' },
        accentColor: { type: String, default: '#3B82F6' },
        spacing: { type: String, default: 'normal' }
    },
    
    personalInfo: {
        fullName: { type: String, default: "" },
        professionalTitle: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        location: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        portfolioUrl: { type: String, default: "" },
        profilePhoto: { type: String, default: "" } // Optional Cloudinary URL
    },
    
    summary: { type: String, default: "" },
    
    experience: [{
        jobTitle: { type: String, default: "" },
        company: { type: String, default: "" },
        location: { type: String, default: "" },
        startDate: { type: String, default: "" }, // Format: "MM/YYYY" or similar
        endDate: { type: String, default: "" },
        currentlyWorking: { type: Boolean, default: false },
        responsibilities: { type: String, default: "" } // Stored as text with newlines or rich text
    }],
    
    education: [{
        degree: { type: String, default: "" },
        institution: { type: String, default: "" },
        location: { type: String, default: "" },
        startYear: { type: String, default: "" },
        endYear: { type: String, default: "" },
        score: { type: String, default: "" }, // CGPA or Percentage
        coursework: { type: String, default: "" }
    }],
    
    skills: {
        technical: [{ type: String }],
        programmingLanguages: [{ type: String }],
        frameworks: [{ type: String }],
        databases: [{ type: String }],
        tools: [{ type: String }],
        cloudDevOps: [{ type: String }],
        softSkills: [{ type: String }]
    },
    
    projects: [{
        projectName: { type: String, default: "" },
        role: { type: String, default: "" },
        description: { type: String, default: "" },
        technologies: [{ type: String }],
        keyContributions: { type: String, default: "" },
        githubUrl: { type: String, default: "" },
        liveDemoUrl: { type: String, default: "" }
    }],
    
    certifications: [{
        certificateName: { type: String, default: "" },
        issuingOrganization: { type: String, default: "" },
        issueDate: { type: String, default: "" },
        credentialId: { type: String, default: "" },
        credentialUrl: { type: String, default: "" }
    }],
    
    achievements: [{
        achievementName: { type: String, default: "" },
        organization: { type: String, default: "" },
        date: { type: String, default: "" },
        description: { type: String, default: "" }
    }],

    // Additional optional sections
    languages: [{ type: String }],
    volunteerExperience: [{
        role: { type: String, default: "" },
        organization: { type: String, default: "" },
        description: { type: String, default: "" }
    }],
    publications: [{
        title: { type: String, default: "" },
        publisher: { type: String, default: "" },
        date: { type: String, default: "" },
        link: { type: String, default: "" }
    }],
    interests: [{ type: String }]

}, { timestamps: true });

// Prevent duplicate resume models if recompiled (useful for Next.js/serverless, safe for standard express)
const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

export default Resume;
