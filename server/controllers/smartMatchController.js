import multer from 'multer';
import crypto from 'crypto';
import pdfParse from 'pdf-parse-new';
import SmartMatchAnalysis from '../models/SmartMatchAnalysis.js';
import JobIntelligence from '../models/JobIntelligence.js';
import Job from '../models/Job.js';
import Course from '../models/Course.js';
import { analyzeResumeForSmartMatch, generateEmbedding, generateSkillGapRoadmap } from '../services/geminiAiService.js';
import SkillNormalizationService from '../services/SkillNormalizationService.js';
import SkillGapService from '../services/skillGapService.js';

const storage = multer.memoryStorage();
const roadmapCache = new Map();

export const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No resume PDF provided.' });
        }

        const userId = req.body.userId || "guest";
        
        // Caching: Check if this exact file was already uploaded by this user
        const fileHash = crypto.createHash('md5').update(req.file.buffer).digest('hex');
        const existingAnalysis = await SmartMatchAnalysis.findOne({ userId, fileHash, status: 'completed' });
        
        if (existingAnalysis) {
            console.log("SmartMatch: Returning cached analysis for fileHash", fileHash);
            return res.json({
                success: true,
                message: 'Resume analyzed successfully (cached).',
                data: existingAnalysis
            });
        }

        const pdfData = await pdfParse(req.file.buffer);
        const text = pdfData.text;

        if (!text || text.trim().length < 50) {
            return res.status(400).json({ success: false, message: 'PDF contains no readable text. Please upload a text-based PDF.' });
        }

        const extractedData = await analyzeResumeForSmartMatch(text);

        const rawSkills = [...(extractedData.technicalSkills || []), ...(extractedData.softSkills || [])];
        const normalizedSkills = Array.from(new Set(rawSkills.map(s => SkillNormalizationService.cleanSkillString(s)).filter(s => s)));

        const embeddingText = `Skills: ${normalizedSkills.join(', ')}. Experience: ${extractedData.experience.map(e => e.jobTitle).join(', ')}`;
        let embedding = [];
        try {
            embedding = await generateEmbedding(embeddingText);
        } catch(e) {
            console.warn("Could not generate embedding, skipping vector. Reason:", e.message);
        }

        const analysis = new SmartMatchAnalysis({
            userId,
            fileHash,
            extractedData,
            normalizedSkills,
            embedding,
            status: 'completed'
        });
        await analysis.save();

        res.json({ success: true, data: analysis });

    } catch (error) {
        console.error("SmartMatch Analysis Error:", error);
        res.status(500).json({ success: false, message: error.message || 'Failed to analyze resume.', error: error.message });
    }
};

export const getMatches = async (req, res) => {
    try {
        const { analysisId } = req.body;
        
        const analysis = await SmartMatchAnalysis.findById(analysisId);
        if (!analysis) {
            return res.status(404).json({ success: false, message: 'Analysis not found' });
        }

        const activeJobs = await Job.find({ visible: true }).populate('companyId', 'name image');
        const jobIntelligences = await JobIntelligence.find({ jobId: { $in: activeJobs.map(j => j._id) } });

        const matches = [];

        for (const job of activeJobs) {
            const intel = jobIntelligences.find(ji => ji.jobId.toString() === job._id.toString());
            
            const requiredSkills = job.skills || [];
            let matchedSkills = [];
            let missingSkills = [];
            
            requiredSkills.forEach(reqSkill => {
                let isMatched = false;
                for (const candSkill of analysis.normalizedSkills) {
                    const comp = SkillNormalizationService.compareSkills(reqSkill, candSkill);
                    if (comp.confidence >= 0.8) {
                        isMatched = true;
                        break;
                    }
                }
                if (isMatched) matchedSkills.push(reqSkill);
                else missingSkills.push(reqSkill);
            });

            // Strict check: If the job has no required skills, or if we matched 0 skills, DO NOT recommend this job.
            if (requiredSkills.length === 0 || matchedSkills.length === 0) {
                continue; // Skip this job entirely
            }

            const skillScore = (matchedSkills.length / requiredSkills.length) * 100;

            let semanticScore = 0;
            if (intel && intel.embedding && intel.embedding.length > 0 && analysis.embedding && analysis.embedding.length > 0) {
                semanticScore = cosineSimilarity(analysis.embedding, intel.embedding) * 100;
                semanticScore = Math.max(0, semanticScore);
            } else {
                semanticScore = skillScore;
            }

            const totalCandYears = analysis.extractedData.experience.reduce((sum, exp) => sum + (exp.years || 0), 0);
            const reqYears = job.level === 'Senior level' ? 5 : job.level === 'Mid level' ? 2 : 0;
            
            let expScore = 100;
            if (reqYears > 0) {
                expScore = Math.min(100, (totalCandYears / reqYears) * 100);
            }

            const aiScore = Math.round((semanticScore * 0.4) + (skillScore * 0.4) + (expScore * 0.2));

            matches.push({
                job,
                aiScore,
                matchedSkills,
                missingSkills,
                explanation: `Your profile is an ${aiScore}% match. You possess ${matchedSkills.length} of the ${requiredSkills.length} required skills for this role.`
            });
        }

        matches.sort((a, b) => b.aiScore - a.aiScore);

        res.json({ success: true, matches: matches.slice(0, 5) });

    } catch (error) {
        console.error("SmartMatch Match Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate matches.', error: error.message });
    }
};

export const analyzeSkillGap = async (req, res) => {
    try {
        const { analysisId, jobId } = req.body;
        
        if (!analysisId || !jobId) {
            return res.status(400).json({ success: false, message: 'Missing analysisId or jobId' });
        }

        const analysis = await SmartMatchAnalysis.findById(analysisId);
        const job = await Job.findById(jobId).populate('companyId');

        if (!analysis || !job) {
            return res.status(404).json({ success: false, message: 'Analysis or Job not found' });
        }

        const requiredSkills = job.skills || [];
        let missingSkillsStrings = [];

        requiredSkills.forEach(reqSkill => {
            let isMatched = false;
            for (const candSkill of analysis.normalizedSkills) {
                const comp = SkillNormalizationService.compareSkills(reqSkill, candSkill);
                if (comp.confidence >= 0.8) {
                    isMatched = true;
                    break;
                }
            }
            if (!isMatched) {
                missingSkillsStrings.push(reqSkill);
            }
        });

        if (missingSkillsStrings.length === 0) {
            return res.json({ 
                success: true, 
                message: "No skill gap! You have all the required skills.",
                roadmap: null,
                recommendedCourses: []
            });
        }

        // Generate AI Roadmap (with 5 min cache)
        const cacheKey = `${analysisId}_${jobId}`;
        const cachedRoadmap = roadmapCache.get(cacheKey);
        
        let roadmapData = null;
        if (cachedRoadmap && Date.now() < cachedRoadmap.expiresAt) {
            console.log("SkillGap: Returning cached roadmap for", cacheKey);
            roadmapData = cachedRoadmap.data;
        } else {
            try {
                roadmapData = await generateSkillGapRoadmap(
                    missingSkillsStrings, 
                    job.title, 
                    analysis.extractedData
                );
                roadmapCache.set(cacheKey, {
                    data: roadmapData,
                    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
                });
            } catch (e) {
                console.error("Roadmap generation failed:", e.message);
            }
        }

        // Fetch Real Courses from DB using SkillGapService
        // 1. Normalize the missing string skills to find Canonical Skill IDs
        const normalizedMissingDB = await SkillGapService.normalizeCandidateSkills(missingSkillsStrings);
        
        // 2. Fetch courses that teach these canonical skills
        // getRecommendationsForMissingSkills expects objects with { id, name }
        const formattedMissing = normalizedMissingDB.map(dbSkill => ({
            id: dbSkill._id.toString(),
            name: dbSkill.name
        }));
        
        let recommendedCourses = [];
        if (formattedMissing.length > 0) {
            recommendedCourses = await SkillGapService.getRecommendationsForMissingSkills(formattedMissing, analysis.normalizedSkills);
        }

        // FALLBACK: If strict Skill mapping failed (e.g. no CourseSkill relations), try a simple text search on active courses
        if (recommendedCourses.length === 0) {
            const allCourses = await Course.find({ isActive: true }).populate({
                path: 'instituteId',
                populate: { path: 'districtId' }
            });
            for (const course of allCourses) {
                const textToSearch = `${course.name} ${course.description || ''}`.toLowerCase();
                let matchCount = 0;
                for (const skill of missingSkillsStrings) {
                    const skillLower = skill.toLowerCase();
                    if (textToSearch.includes(skillLower)) {
                        matchCount += 2; // Exact match gets higher weight
                        continue;
                    }
                    
                    // Alias checks
                    if (skillLower.includes('language model') && textToSearch.includes('llm')) {
                        matchCount++;
                        continue;
                    }
                    if (skillLower.includes('artificial intelligence') && textToSearch.includes('ai')) {
                        matchCount++;
                        continue;
                    }
                    
                    // Word-level fuzzy match
                    const skillWords = skillLower.replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
                    let matchedWord = false;
                    for (const word of skillWords) {
                        // Check if word exists as an isolated token to prevent false positives (e.g. 'api' matching 'capital')
                        const regex = new RegExp(`\\b${word}\\b`, 'i');
                        if (regex.test(textToSearch)) {
                            matchedWord = true;
                            break;
                        }
                    }
                    if (matchedWord) {
                        matchCount++;
                    }
                }
                if (matchCount > 0) {
                    recommendedCourses.push({
                        courseId: course._id,
                        courseName: course.name,
                        courseDescription: course.description || '',
                        courseImage: course.image || '',
                        durationMonths: course.durationMonths || 0,
                        instituteId: course.instituteId?._id,
                        instituteName: course.instituteId?.name || 'Unknown',
                        relevanceScore: matchCount * 10
                    });
                }
            }
            // Sort fallback courses
            recommendedCourses.sort((a, b) => b.relevanceScore - a.relevanceScore);
            // Limit to top 4
            recommendedCourses = recommendedCourses.slice(0, 4);
        }

        res.json({
            success: true,
            missingSkills: missingSkillsStrings,
            roadmap: roadmapData,
            recommendedCourses
        });

    } catch (error) {
        console.error("Skill Gap Analysis Error:", error);
        res.status(500).json({ success: false, message: 'Failed to analyze skill gap.', error: error.message });
    }
};
