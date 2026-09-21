import Resume from '../models/Resume.js';
import { generateResponse } from '../services/geminiAiService.js';
import { generateResumePdf } from '../utils/pdfGenerator.js';
import pdfParse from 'pdf-parse-new';
import mammoth from 'mammoth';

// Get all resumes for user
export const getUserResumes = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
        res.json({ success: true, resumes });
    } catch (error) {
        console.error("Get Resumes Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single resume
export const getResumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;
        const resume = await Resume.findOne({ _id: id, userId });
        
        if (!resume) {
            return res.status(404).json({ success: false, message: "Resume not found or unauthorized" });
        }
        
        res.json({ success: true, resume });
    } catch (error) {
        console.error("Get Resume Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create empty resume
export const createResume = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { resumeName, template, isImport, personalInfo, summary, experience, education, skills, projects, certifications, achievements, sectionOrder } = req.body;
        
        // If it's an import, use the provided data directly without injecting dummy data
        const newResume = new Resume({
            userId,
            resumeName: resumeName || "Untitled Resume",
            template: template || "ATS Classic",
            ...(sectionOrder && { sectionOrder }),
            personalInfo: personalInfo || (isImport ? {} : {
                fullName: "John Doe",
                professionalTitle: "",
                email: "",
                phone: "",
                location: "",
                linkedin: "",
                portfolioUrl: "",
                github: ""
            }),
            summary: summary || (isImport ? "" : "Proven ability in analyzing large datasets, debugging SQL queries, and transforming data to drive business decisions.\nProficient in creating compelling, interactive dashboards using Power BI, enhancing data accessibility and understanding."),
            experience: experience || (isImport ? [] : [
                {
                    jobTitle: "Data Analyst",
                    company: "Tech Corp",
                    location: "",
                    startDate: "June 2022",
                    endDate: "Present",
                    currentlyWorking: true,
                    responsibilities: "- Manage and enhance client data across multiple CRM tools, ensuring up-to-date and accurate information.\n- Oversee data accuracy and consistency through ongoing validation, audits, and updates."
                }
            ]),
            education: education || (isImport ? [] : [
                {
                    degree: "Bachelor of Science",
                    institution: "University of Technology",
                    startYear: "2018",
                    endYear: "2022",
                    score: "3.8 GPA"
                }
            ]),
            projects: projects || (isImport ? [] : [
                {
                    projectName: "Data Visualization Dashboard",
                    role: "",
                    description: "- Built an interactive dashboard for enhanced data visualization.",
                    technologies: ["React", "Node.js"],
                    liveDemoUrl: "",
                    githubUrl: ""
                }
            ]),
            skills: skills || (isImport ? {
                technical: [],
                programmingLanguages: [],
                frameworks: [],
                databases: [],
                tools: [],
                softSkills: []
            } : {
                technical: ["Excel", "Power BI", "Tableau"],
                programmingLanguages: ["Python", "SQL"],
                frameworks: ["React", "Node.js"]
            }),
            certifications: certifications || [],
            achievements: achievements || []
        });
        
        await newResume.save();
        res.status(201).json({ success: true, resume: newResume });
    } catch (error) {
        console.error("Create Resume Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Duplicate resume
export const duplicateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;
        
        const originalResume = await Resume.findOne({ _id: id, userId });
        if (!originalResume) {
            return res.status(404).json({ success: false, message: "Resume not found" });
        }
        
        const resumeData = originalResume.toObject();
        delete resumeData._id;
        delete resumeData.createdAt;
        delete resumeData.updatedAt;
        
        resumeData.resumeName = `${resumeData.resumeName} (Copy)`;
        
        const duplicatedResume = new Resume(resumeData);
        await duplicatedResume.save();
        
        res.status(201).json({ success: true, resume: duplicatedResume });
    } catch (error) {
        console.error("Duplicate Resume Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update resume
export const updateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;
        const updateData = req.body;
        
        // Ensure user cannot change owner
        delete updateData.userId;
        
        const updatedResume = await Resume.findOneAndUpdate(
            { _id: id, userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!updatedResume) {
            return res.status(404).json({ success: false, message: "Resume not found or unauthorized" });
        }
        
        res.json({ success: true, resume: updatedResume });
    } catch (error) {
        console.error("Update Resume Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete resume
export const deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;
        
        const result = await Resume.findOneAndDelete({ _id: id, userId });
        
        if (!result) {
            return res.status(404).json({ success: false, message: "Resume not found or unauthorized" });
        }
        
        res.json({ success: true, message: "Resume deleted successfully" });
    } catch (error) {
        console.error("Delete Resume Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate PDF
export const downloadPdf = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;
        
        // Support POST body for unsaved changes preview, otherwise fetch from DB
        let resumeData = req.body.resumeData;
        
        if (!resumeData) {
            const resumeDoc = await Resume.findOne({ _id: id, userId });
            if (!resumeDoc) {
                return res.status(404).json({ success: false, message: "Resume not found" });
            }
            resumeData = resumeDoc.toObject();
        }
        
        const pdfBuffer = await generateResumePdf({
            summary: '',
            experience: [],
            projects: [],
            skills: { technical: [], programmingLanguages: [], frameworks: [], databases: [], tools: [], softSkills: [] },
            education: [],
            certifications: [],
            ...resumeData,
            resumeName: resumeData.name || resumeData.personalInfo?.fullName ? `${resumeData.personalInfo?.fullName} Resume` : 'Resume',
            template: resumeData.template || 'ATS Classic'
        });
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${resumeData.resumeName || 'Resume'}.pdf"`,
            'Content-Length': pdfBuffer.length
        });
        
        res.end(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate PDF: " + error.message });
    }
};

// AI Endpoint: Improve Section
export const improveWithAI = async (req, res) => {
    try {
        const { section, content, context } = req.body;
        
        let prompt = "";
        
        if (section === 'summary') {
            prompt = `You are an expert resume writer. Improve the following professional summary.
Make it concise, professional, ATS-friendly, and impactful.
Do NOT invent any facts, experiences, or degrees that are not present in the input.
If the input is empty or too short, write a strong generic starting point based on the context provided.
Context: ${JSON.stringify(context || {})}
Input Summary: "${content}"
Return ONLY the improved text, without any markdown wrappers or conversational filler.`;
        } 
        else if (section === 'experience') {
            prompt = `You are an expert resume writer. Improve the following job experience bullet points.
Convert the input into strong, action-oriented, professional bullet points starting with action verbs (e.g., Developed, Managed, Optimized).
Keep it concise and ATS-friendly.
CRITICAL RULE: DO NOT invent metrics, numbers, technologies, or achievements that are not explicitly stated in the input. If the input is weak, improve the phrasing but stick to the facts.
Format as a bulleted list using the '-' character. Return ONLY the bullet points, no conversational filler.
Input Job Details: ${JSON.stringify(context || {})}
Input Responsibilities: "${content}"`;
        }
        else if (section === 'projects') {
             prompt = `You are an expert technical resume writer. Improve the following project description.
Convert the input into strong, action-oriented, professional bullet points starting with action verbs.
CRITICAL RULE: DO NOT invent metrics, numbers, or technologies that are not explicitly stated. 
Format as a bulleted list using the '-' character. Return ONLY the bullet points, no conversational filler.
Project Name/Tech: ${JSON.stringify(context || {})}
Input Description: "${content}"`;
        }
        else {
            return res.status(400).json({ success: false, message: "Invalid section for AI improvement" });
        }

        const improvedText = await generateResponse(prompt, content); // Fallback to original content
        
        res.json({ success: true, result: improvedText.trim() });
    } catch (error) {
        console.error("AI Improve Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// AI Endpoint: Job Match Analysis
export const analyzeJobDescription = async (req, res) => {
    try {
        const { jobDescription, resumeData } = req.body;
        
        if (!jobDescription || !resumeData) {
            return res.status(400).json({ success: false, message: "Job description and resume data are required" });
        }
        
        const prompt = `You are a strict ATS (Applicant Tracking System).
Compare the candidate's Resume with the Job Description.

Job Description:
${jobDescription}

Candidate Resume:
${JSON.stringify(resumeData)}

Extract the required and preferred skills from the Job Description.
Then, check if those EXACT skills exist in the Candidate Resume.

Return ONLY a valid JSON object strictly matching this schema:
{
    "matchedSkills": ["Skill 1", "Skill 2"],
    "missingSkills": ["Skill 3", "Skill 4"],
    "overallMatchPercentage": 75,
    "suggestions": ["Add more keywords", "Highlight leadership experience"]
}
Do not use markdown backticks around the JSON.`;

        const fallback = JSON.stringify({ matchedSkills: [], missingSkills: [], overallMatchPercentage: 0, suggestions: ["AI analysis failed. Please review manually."] });
        let resultString = await generateResponse(prompt, fallback);
        resultString = resultString.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        let analysis;
        try {
            analysis = JSON.parse(resultString);
        } catch (e) {
            analysis = JSON.parse(fallback);
        }
        
        res.json({ success: true, analysis });
    } catch (error) {
        console.error("AI Job Analysis Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const generateAtsScore = async (req, res) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).json({ success: false, message: "Resume data is required" });

        const prompt = `Act as an expert ATS (Applicant Tracking System) software and Senior Tech Recruiter.
Analyze the following JSON resume data and provide a precise ATS Score out of 100 based on standard industry criteria: keyword optimization, section completeness, action verbs, measurable achievements, and overall professional layout (infer from data).

Resume Data:
${JSON.stringify(resumeData)}

CRITICAL: Return ONLY a valid JSON object in this exact format. Do NOT wrap it in markdown ticks or anything else.
{
  "score": 85,
  "feedback": {
    "strengths": [
      "Good use of action verbs in experience.",
      "Clear contact information."
    ],
    "weaknesses": [
      "Missing measurable metrics in projects.",
      "Unnecessary or outdated skills included."
    ],
    "improvements": [
      "Add more quantifiable results (e.g., 'increased sales by 20%').",
      "Tailor the summary more towards a specific role."
    ]
  }
}`;

        const aiResponse = await generateResponse(prompt);
        if (!aiResponse || aiResponse.includes('Ollama Connection Failed') || aiResponse.includes('Ollama Error')) {
            return res.status(503).json({ success: false, message: "AI servers are currently experiencing high demand. Please try again in a few moments." });
        }

        let parsedResult;
        try {
            // Clean markdown block ticks if present
            const cleanStr = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            parsedResult = JSON.parse(cleanStr);
        } catch (e) {
            console.error("Failed to parse ATS Score AI response", e, "Raw:", aiResponse);
            return res.status(500).json({ success: false, message: "AI generated an invalid response. Please try again." });
        }

        res.json({ success: true, result: parsedResult });
    } catch (error) {
        console.error("ATS Score Generation Error:", error);
        res.status(500).json({ success: false, message: "An error occurred while generating the ATS score." });
    }
};

// Upload Resume and Extract via AI
export const uploadResumeAndExtract = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        
        let extractedText = "";

        if (mimeType === 'application/pdf') {
            const pdfData = await pdfParse(fileBuffer);
            extractedText = pdfData.text;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;
        } else if (mimeType.startsWith('image/')) {
            return res.status(400).json({ success: false, message: "Image upload is not supported yet. Please upload a PDF or DOCX file." });
        } else {
            return res.status(400).json({ success: false, message: "Unsupported file format. Please upload a PDF or DOCX file." });
        }

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Could not extract text from the uploaded file. It might be an image-based PDF without selectable text." });
        }

        const prompt = `You are an expert ATS resume parser. Your task is to analyze the following text and determine if it is a resume. A valid resume typically contains sections like Professional Summary, Skills, Experience, or Education.
        
CRITICAL RULES: 
1. Return ONLY a valid JSON object. Do not include markdown code block syntax (like \`\`\`json). Do not include any conversational text.
2. If the text is CLEARLY NOT a resume (e.g., it is an offer letter, a random article, a receipt, or general text), you MUST return EXACTLY this JSON: {"isResume": false}.
3. DO NOT INVENT OR HALLUCINATE DATA. If a field (like a skill, project, or date) is not present in the text, leave it as an empty string "" or an empty array [].
4. DO NOT SUMMARIZE OR CUT CONTENT. EXTRACT 100% OF THE ORIGINAL CONTENT WORD-FOR-WORD. Extract the exact full text for responsibilities, descriptions, and summaries as written in the resume. Never omit any details.
5. DETERMINE SECTION ORDER. Based on the flow of the original text, identify the order in which sections appeared and return them in "sectionOrder". Valid sections are: "summary", "experience", "education", "skills", "projects", "certifications", "achievements".

Extract the text into this exact JSON schema:
{
    "isResume": true,
    "sectionOrder": ["summary", "experience", "education", "skills", "projects", "certifications", "achievements"],
    "personalInfo": {
        "fullName": "Extracted full name",
        "professionalTitle": "Current or target job title",
        "email": "Email address",
        "phone": "Phone number",
        "location": "City, State, Country etc.",
        "linkedin": "LinkedIn URL",
        "portfolioUrl": "Portfolio URL or GitHub URL"
    },
    "summary": "Professional summary paragraph. If multiple paragraphs, join with \\n",
    "experience": [
        {
            "jobTitle": "Job Title",
            "company": "Company Name",
            "location": "Job Location",
            "startDate": "MM/YYYY",
            "endDate": "MM/YYYY or 'Present'",
            "currentlyWorking": true/false,
            "responsibilities": "- Bullet 1\\n- Bullet 2"
        }
    ],
    "education": [
        {
            "degree": "Degree Name",
            "institution": "University/College",
            "startYear": "YYYY",
            "endYear": "YYYY",
            "score": "CGPA or Percentage"
        }
    ],
    "skills": {
        "technical": ["Skill 1", "Skill 2"],
        "programmingLanguages": [],
        "frameworks": [],
        "databases": [],
        "tools": [],
        "softSkills": []
    },
    "projects": [
        {
            "projectName": "Project Name",
            "technologies": ["Tech 1", "Tech 2"],
            "liveDemoUrl": "URL",
            "githubUrl": "URL",
            "description": "- Bullet 1\\n- Bullet 2"
        }
    ],
    "certifications": [
        {
            "certificateName": "Cert Name",
            "issuingOrganization": "Org Name",
            "issueDate": "MM/YYYY",
            "credentialUrl": "URL"
        }
    ],
    "achievements": [
        {
            "achievementName": "Title",
            "organization": "Org (if any)",
            "date": "MM/YYYY",
            "description": "Short description"
        }
    ]
}

Resume Text to Parse:
"""
${extractedText.substring(0, 15000)}
"""
`;

        const aiResponse = await generateResponse(prompt);
        
        if (!aiResponse || aiResponse.includes('Ollama Connection Failed') || aiResponse.includes('Ollama Error')) {
            return res.status(503).json({ success: false, message: "AI servers are currently experiencing high demand. Please try again in a few moments." });
        }

        let parsedResult;
        try {
            const cleanStr = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            parsedResult = JSON.parse(cleanStr);
        } catch (e) {
            console.error("Failed to parse extracted JSON from AI", e, "Raw:", aiResponse);
            return res.status(500).json({ success: false, message: "AI generated an invalid structure. Please try again." });
        }

        if (parsedResult.isResume === false) {
            return res.status(400).json({ success: false, message: "The uploaded document does not appear to be a valid resume. Please upload a resume containing your skills, experience, and education." });
        }

        res.json({ success: true, extractedData: parsedResult });

    } catch (error) {
        console.error("Upload & Extract Error:", error);
        res.status(500).json({ success: false, message: "An error occurred during file extraction: " + error.message });
    }
};

