import Job from '../models/Job.js';
import JobSkill from '../models/JobSkill.js';
import Skill from '../models/Skill.js';
import CourseSkill from '../models/CourseSkill.js';
import Course from '../models/Course.js';
import TrainingInstitute from '../models/TrainingInstitute.js';
import TrainingBatch from '../models/TrainingBatch.js';

class SkillGapService {
    
    static SKILL_ALIASES = {
        "databases": ["database", "sql database", "dbms", "databases", "sql"],
        "javascript": ["js", "javascript", "ecmascript"],
        "react": ["reactjs", "react.js", "react"],
        "node.js": ["node", "nodejs", "node.js"]
    };

    static cleanSkillString(text) {
        if (!text) return '';
        return text.toLowerCase()
            .trim()
            .replace(/[^a-z0-9+#.]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static levenshtein(a, b) {
        if(a.length === 0) return b.length; 
        if(b.length === 0) return a.length; 
        const matrix = [];
        for(let i = 0; i <= b.length; i++) matrix[i] = [i];
        for(let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for(let i = 1; i <= b.length; i++){
            for(let j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)){
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    }

    static getSimilarity(a, b) {
        const distance = this.levenshtein(a, b);
        const longestLength = Math.max(a.length, b.length);
        if (longestLength === 0) return 1.0;
        return (longestLength - distance) / longestLength;
    }

    static getCanonicalFromAlias(rawSkill) {
        for (const [canonical, aliases] of Object.entries(this.SKILL_ALIASES)) {
            if (aliases.includes(rawSkill)) {
                return canonical;
            }
        }
        return null;
    }

    // Normalize user's raw skill strings to canonical Skill records in our Master DB
    static async normalizeCandidateSkills(rawSkills = []) {
        const normalizedSkills = [];
        const uniqueRawSkills = [...new Set(rawSkills.map(s => this.cleanSkillString(s)))];

        // Fetch all master skills once for in-memory matching
        const allDbSkills = await Skill.find({});

        for (const rawSkill of uniqueRawSkills) {
            if (!rawSkill) continue;
            let matchedSkillDoc = null;
            
            // 1. Alias Match (Hardcoded map)
            const canonicalNameFromAlias = this.getCanonicalFromAlias(rawSkill);
            if (canonicalNameFromAlias) {
                 matchedSkillDoc = allDbSkills.find(s => this.cleanSkillString(s.name) === canonicalNameFromAlias);
            }

            // 2. Exact/Alias Match (from DB)
            if (!matchedSkillDoc) {
                 matchedSkillDoc = allDbSkills.find(s => 
                     this.cleanSkillString(s.name) === rawSkill ||
                     (s.aliases && s.aliases.some(a => this.cleanSkillString(a) === rawSkill))
                 );
            }

            // 3. Fuzzy Match
            if (!matchedSkillDoc) {
                 let bestMatch = null;
                 let highestSim = 0;
                 const THRESHOLD = 0.8; // 80% similarity required

                 for (const dbSkill of allDbSkills) {
                     const sim = this.getSimilarity(rawSkill, this.cleanSkillString(dbSkill.name));
                     if (sim > highestSim && sim >= THRESHOLD) {
                         highestSim = sim;
                         bestMatch = dbSkill;
                     }
                     if (dbSkill.aliases) {
                         for (const alias of dbSkill.aliases) {
                             const aliasSim = this.getSimilarity(rawSkill, this.cleanSkillString(alias));
                             if (aliasSim > highestSim && aliasSim >= THRESHOLD) {
                                 highestSim = aliasSim;
                                 bestMatch = dbSkill;
                             }
                         }
                     }
                 }
                 matchedSkillDoc = bestMatch;
            }

            if (matchedSkillDoc) {
                if (!normalizedSkills.find(s => s._id.toString() === matchedSkillDoc._id.toString())) {
                    normalizedSkills.push(matchedSkillDoc);
                }
            }
        }
        return normalizedSkills;
    }

    static async getCareerAnalysis(candidateSkills = [], targetJobId) {
        // 1. Get Job Info
        const job = await Job.findById(targetJobId).populate('companyId', 'name image');
        if (!job) throw new Error('Job not found');

        // 2. Get Required Job Skills
        const jobSkills = await JobSkill.find({ jobId: targetJobId }).populate('skillId');
        
        const requiredSkills = jobSkills
            .filter(js => js.skillId != null) // Ensure skill hasn't been deleted
            .map(js => ({
                id: js.skillId._id.toString(),
                name: js.skillId.name
            }));

        if (requiredSkills.length === 0) {
            return {
                job: { id: job._id, title: job.title, company: job.companyId?.name, location: job.location },
                matchScore: 0,
                requiredSkills: [],
                matchedSkills: [],
                missingSkills: [],
                recommendations: [],
                message: "Skill requirements are not available for this job yet."
            };
        }

        // 3. Normalize Candidate Skills
        const normalizedCandSkills = await this.normalizeCandidateSkills(candidateSkills);
        const candSkillIds = new Set(normalizedCandSkills.map(s => s._id.toString()));

        // 4. Calculate Match vs Missing
        const matchedSkills = [];
        const missingSkills = [];

        for (const reqSkill of requiredSkills) {
            if (candSkillIds.has(reqSkill.id)) {
                matchedSkills.push(reqSkill);
            } else {
                missingSkills.push(reqSkill);
            }
        }

        // 5. Match Score Formula: (matched / totalRequired) * 100, rounded to nearest int
        const matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);

        // 6. Government Course Recommendations (For Missing Skills)
        let recommendations = [];
        if (missingSkills.length > 0) {
            recommendations = await this.getRecommendationsForMissingSkills(missingSkills);
        }

        return {
            job: { id: job._id, title: job.title, company: job.companyId?.name, location: job.location },
            matchScore,
            requiredSkills,
            matchedSkills,
            missingSkills,
            recommendations
        };
    }

    static async getRecommendationsForMissingSkills(missingSkills) {
        const missingSkillIds = missingSkills.map(s => s.id);
        const missingSkillMap = new Map(missingSkills.map(s => [s.id, s.name]));

        // Find courses that teach any of the missing skills
        const courseSkills = await CourseSkill.find({ skillId: { $in: missingSkillIds } });
        if (courseSkills.length === 0) return [];

        const courseIdSet = new Set(courseSkills.map(cs => cs.courseId.toString()));
        
        // Map to hold aggregated info per course
        // Key: Course ID
        // Value: { courseId, coveredSkills: [String] }
        const courseCoverageMap = new Map();
        
        courseSkills.forEach(cs => {
            const cid = cs.courseId.toString();
            const sname = missingSkillMap.get(cs.skillId.toString());
            
            if (!courseCoverageMap.has(cid)) {
                courseCoverageMap.set(cid, { courseId: cid, coveredSkills: new Set() });
            }
            if (sname) {
                courseCoverageMap.get(cid).coveredSkills.add(sname);
            }
        });

        // Now fetch active courses and their institutes
        const recommendedCourses = [];
        for (const cid of courseIdSet) {
            const course = await Course.findOne({ _id: cid, isActive: true }).populate({
                path: 'instituteId',
                populate: { path: 'districtId' }
            });
            if (!course || !course.instituteId) continue; // Skip inactive courses or detached institutes
            
            // Check if there's any active batch for this course
            const activeBatch = await TrainingBatch.findOne({ 
                courseId: cid, 
                status: { $in: ['Planned', 'Ongoing'] }
            });

            const coveredSkillsArr = Array.from(courseCoverageMap.get(cid).coveredSkills);
            
            // Calculate a deterministic relevance score
            // +100 for each missing skill covered
            // +50 if there is an active/planned batch
            let relevanceScore = (coveredSkillsArr.length * 100) + (activeBatch ? 50 : 0);

            recommendedCourses.push({
                courseId: course._id,
                courseName: course.name,
                instituteId: course.instituteId._id,
                instituteName: course.instituteId.name,
                districtName: course.instituteId.districtId?.name || 'Unknown',
                coveredSkills: coveredSkillsArr,
                batchAvailable: !!activeBatch,
                relevanceScore
            });
        }

        // Sort recommendations by highest relevance score first
        recommendedCourses.sort((a, b) => b.relevanceScore - a.relevanceScore);

        return recommendedCourses;
    }
}

export default SkillGapService;
