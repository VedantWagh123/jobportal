import Course from '../../models/Course.js';
import Batch from '../../models/Batch.js';
import CurriculumAlert from '../../models/CurriculumAlert.js';
import Enrollment from '../../models/Enrollment.js';
import TrainingInstitute from '../../models/TrainingInstitute.js';
import Skill from '../../models/Skill.js';
import CourseSkill from '../../models/CourseSkill.js';
import JobSkill from '../../models/JobSkill.js';
import Job from '../../models/Job.js';
import JobApplication from '../../models/JobApplication.js';
import { generateResponse } from '../../services/geminiAiService.js';
import { v2 as cloudinary } from 'cloudinary';
import { getIO } from '../../config/socket.js';
import { clearCache } from '../../utils/cache.js';

// --- COURSES ---
export const getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ instituteId: req.institute._id }).sort({ createdAt: -1 });
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { name, description, durationMonths, skills, location } = req.body;
        
        // Upload thumbnail to Cloudinary if provided
        let imageUrl = '';
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, {
                folder: 'job_portal/course_thumbnails'
            });
            imageUrl = imageUpload.secure_url;
        }

        const course = await Course.create({
            instituteId: req.institute._id,
            name,
            description,
            durationMonths,
            location: location || 'Online',
            image: imageUrl
        });

        if (skills && Array.isArray(skills)) {
            for (const skillName of skills) {
                const cleanName = skillName.trim();
                if (!cleanName) continue;
                
                // Find or Create Skill
                // We use regex for case-insensitive search
                let skill = await Skill.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
                if (!skill) {
                    skill = await Skill.create({ name: cleanName });
                }

                await CourseSkill.create({
                    courseId: course._id,
                    skillId: skill._id,
                    proficiencyTaught: 'Intermediate' // default
                });
            }
        }

        // Emit real-time WebSockets event
        try {
            const io = getIO();
            io.emit('notification', { message: `New Course Added: "${course.name}"`, type: 'course' });
        } catch (err) {
            console.error("Socket error:", err.message);
        }

        res.status(201).json({ success: true, course });
    } catch (error) {
        console.error("COURSE CREATE ERROR:", error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, instituteId: req.institute._id });
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const { name, description, durationMonths, location, skills } = req.body;

        // Upload new thumbnail if provided
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, {
                folder: 'job_portal/course_thumbnails'
            });
            course.image = imageUpload.secure_url;
        }

        if (name) course.name = name;
        if (description !== undefined) course.description = description;
        if (durationMonths) course.durationMonths = durationMonths;
        if (location) course.location = location;

        await course.save();

        // Update skills if provided
        if (skills && Array.isArray(skills)) {
            // Remove old skills
            await CourseSkill.deleteMany({ courseId: course._id });
            // Add new skills
            for (const skillName of skills) {
                const cleanName = skillName.trim();
                if (!cleanName) continue;
                let skill = await Skill.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
                if (!skill) skill = await Skill.create({ name: cleanName });
                await CourseSkill.create({ courseId: course._id, skillId: skill._id, proficiencyTaught: 'Intermediate' });
            }
        }

        res.json({ success: true, course });
    } catch (error) {
        console.error("COURSE UPDATE ERROR:", error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const extractCourseSkills = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.json({ success: true, skills: [] });

        const prompt = `You are an AI assistant for a technical education platform. 
Read the following course description and extract a list of specific technical skills, tools, and frameworks that will be taught.
Return ONLY a comma-separated list of skills, with no other text.
Examples: "Python, Scikit-learn, Machine Learning", or "React, Node.js, MongoDB".

Course Description:
${description}`;

        const aiResponse = await generateResponse(prompt);
        // Clean up the response
        const skillsArray = aiResponse
            .split(',')
            .map(s => s.trim().replace(/['"]/g, ''))
            .filter(s => s.length > 0 && s.length < 50);

        res.json({ success: true, skills: skillsArray });
    } catch (error) {
        console.error("EXTRACT SKILLS ERROR:", error);
        res.status(500).json({ success: false, message: 'Failed to extract skills' });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        await Course.findOneAndDelete({ _id: req.params.id, instituteId: req.institute._id });
        res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateCourseCurriculum = async (req, res) => {
    try {
        const { curriculum } = req.body;
        const course = await Course.findOneAndUpdate(
            { _id: req.params.id, instituteId: req.institute._id },
            { curriculum },
            { new: true }
        );
        
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        
        res.json({ success: true, course });
    } catch (error) {
        console.error("UPDATE CURRICULUM ERROR:", error);
        res.status(500).json({ success: false, message: 'Failed to update curriculum' });
    }
};

// --- BATCHES ---
export const getMyBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ instituteId: req.institute._id })
            .populate('courseId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, batches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createBatch = async (req, res) => {
    try {
        const { courseId, batchCode, capacity, startDate, endDate } = req.body;
        
        // Ensure course belongs to this institute
        const course = await Course.findOne({ _id: courseId, instituteId: req.institute._id });
        if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

        const batch = await Batch.create({
            instituteId: req.institute._id,
            courseId,
            batchCode,
            capacity,
            startDate,
            endDate,
            status: 'Planning'
        });
        
        // Populate course name for the response
        await batch.populate('courseId', 'name');
        
        clearCache('/api/state-admin');
        try {
            getIO().emit('dashboard_stale');
        } catch (err) {}

        res.status(201).json({ success: true, batch });
    } catch (error) {
        console.error("BATCH CREATE ERROR:", error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

export const getBatchEnrollments = async (req, res) => {
    try {
        const { batchId } = req.params;
        
        // Ensure the batch belongs to this institute
        const batch = await Batch.findOne({ _id: batchId, instituteId: req.institute._id });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found or access denied' });
        }

        const enrollments = await Enrollment.find({ batchId })
            .populate('userId', 'name email image')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, enrollments });
    } catch (error) {
        console.error("GET BATCH ENROLLMENTS ERROR:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getInstituteAlerts = async (req, res) => {
    try {
        const instituteId = req.institute._id;

        // ─── PARALLEL BATCH 1 ────────────────────────────────────────────────
        // All queries that only need instituteId can fire simultaneously
        const [institute, activeCourses, allBatches, allInstituteCourses] = await Promise.all([
            TrainingInstitute.findById(instituteId),
            Course.countDocuments({ instituteId }),
            // Fetch batches with full populate so we don't need a second Batch query
            Batch.find({ instituteId })
                .sort({ createdAt: -1 })
                .populate('courseId', 'name')
                .populate('trainerId', 'name'),
            Course.find({ instituteId }),
        ]);

        const batchIds = allBatches.map(b => b._id);
        const instituteCourseIds = allInstituteCourses
            .filter(c => c.isActive !== false)
            .map(c => c._id);

        // ─── PARALLEL BATCH 2 ────────────────────────────────────────────────
        // Now fire all queries that depend on batch 1 results simultaneously
        const [totalStudents, activeAlerts, coveredCourseSkills, allEnrollments] = await Promise.all([
            Enrollment.countDocuments({ batchId: { $in: batchIds } }),
            CurriculumAlert.find({
                status: 'Active',
                $or: [
                    { districtId: institute?.districtId },
                    { districtId: null },
                    { districtId: { $exists: false } }
                ]
            }).sort({ severity: -1, createdAt: -1 }).limit(10),
            CourseSkill.find({ courseId: { $in: instituteCourseIds } })
                .populate('skillId', 'name'),
            Enrollment.find({ batchId: { $in: batchIds } }).populate('batchId'),
        ]);

        // ─── PARALLEL BATCH 3 ────────────────────────────────────────────────
        // Only needs userIds derived from enrollments
        const userIds = [...new Set(allEnrollments.map(e => e.userId))];
        const userApplications = userIds.length > 0
            ? await JobApplication.find({ userId: { $in: userIds } })
            : [];

        // ─── COMPUTE ─────────────────────────────────────────────────────────

        // Filter alerts — hide skills institute already covers
        const alreadyCoveredSkillNames = new Set(
            coveredCourseSkills
                .filter(cs => cs.skillId)
                .map(cs => cs.skillId.name.toLowerCase().trim())
        );
        const filteredAlerts = activeAlerts.filter(alert => {
            const alertSkill = (alert.skill || alert.skillName || '').toLowerCase().trim();
            if (!alertSkill) return true;
            for (const coveredSkill of alreadyCoveredSkillNames) {
                if (coveredSkill.includes(alertSkill) || alertSkill.includes(coveredSkill)) return false;
            }
            return true;
        }).slice(0, 3);

        // Live batches (top 5 from already-fetched allBatches)
        const liveBatches = allBatches.slice(0, 5);

        // Placement performance
        const placementDataMap = new Map();
        allInstituteCourses.forEach(c => {
            placementDataMap.set(c._id.toString(), { name: c.name, enrolled: 0, placed: 0 });
        });

        const userAppMap = new Map();
        userApplications.forEach(app => {
            if (!userAppMap.has(app.userId.toString())) userAppMap.set(app.userId.toString(), []);
            userAppMap.get(app.userId.toString()).push(app);
        });

        allEnrollments.forEach(enrollment => {
            if (enrollment.batchId?.courseId) {
                const courseIdStr = enrollment.batchId.courseId.toString();
                if (placementDataMap.has(courseIdStr)) {
                    const data = placementDataMap.get(courseIdStr);
                    data.enrolled += 1;
                    const apps = userAppMap.get(enrollment.userId?.toString()) || [];
                    if (apps.some(app => app.status === 'Hired')) data.placed += 1;
                }
            }
        });

        let placementData = Array.from(placementDataMap.values()).filter(d => d.enrolled > 0);
        if (placementData.length === 0) {
            placementData = Array.from(placementDataMap.values()).slice(0, 5);
        }

        const totalEnrolledGlobal = placementData.reduce((acc, curr) => acc + curr.enrolled, 0);
        const totalPlacedGlobal = placementData.reduce((acc, curr) => acc + curr.placed, 0);
        const overallPlacementRate = totalEnrolledGlobal > 0
            ? Math.round((totalPlacedGlobal / totalEnrolledGlobal) * 100)
            : 0;

        res.json({
            success: true,
            alerts: filteredAlerts,
            metrics: {
                activeCourses,
                totalStudents,
                totalBatches: allBatches.length,
                liveBatches,
                placementData,
                overallPlacementRate
            }
        });
    } catch (error) {
        console.error("GET ALERTS ERROR:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateBatchStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const batch = await Batch.findOneAndUpdate(
            { _id: req.params.id, instituteId: req.institute._id },
            { status },
            { new: true }
        ).populate('courseId', 'name');
        
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        clearCache('/api/state-admin');
        try {
            getIO().emit('dashboard_stale');
        } catch (err) {}

        res.json({ success: true, batch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateBatch = async (req, res) => {
    try {
        const { courseId, batchCode, capacity, startDate, endDate } = req.body;
        const batch = await Batch.findOne({ _id: req.params.id, instituteId: req.institute._id });
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        if (courseId) batch.courseId = courseId;
        if (batchCode) batch.batchCode = batchCode;
        if (capacity) batch.capacity = capacity;
        if (startDate) batch.startDate = startDate;
        if (endDate) batch.endDate = endDate;
        
        await batch.save();
        await batch.populate('courseId', 'name');
        
        clearCache('/api/state-admin');
        try {
            getIO().emit('dashboard_stale');
        } catch (err) {}

        res.json({ success: true, message: 'Batch updated', batch });
    } catch (error) {
        console.error("BATCH UPDATE ERROR:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const generateDashboardSummary = async (req, res) => {
    try {
        const { metrics, alerts, messages } = req.body;
        
        // If there are conversational messages, handle it as a chat
        if (messages && messages.length > 0) {
            const chatPrompt = `You are a friendly, smart AI Strategy Advisor for a Training Institute. 
The user is viewing their AI Dashboard Panel.
LIVE DATA: Metrics: ${JSON.stringify(metrics)}, Alerts: ${JSON.stringify(alerts)}
STRICT RULES:
1. Speak in VERY SIMPLE English. Use emojis! 🚀
2. Be SHORT and PUNCHY. No long paragraphs.
3. Answer their questions directly based on the live data.`;

            const formattedHistory = [{ role: 'user', parts: [{ text: `SYSTEM INSTRUCTION:\n${chatPrompt}` }] }, { role: 'model', parts: [{ text: "Got it! I am ready to chat." }] }];
            
            messages.forEach(msg => {
                formattedHistory.push({
                    role: msg.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                });
            });

            const { generateChatResponse } = await import('../../services/geminiAiService.js');
            const reply = await generateChatResponse(formattedHistory, "Sorry, I'm having trouble analyzing the data right now.");
            return res.json({ success: true, isChat: true, summary: reply });
        }

        // System context block for JSON Panel
        const systemPrompt = `You are a highly analytical AI Strategy Advisor for a Training Institute.
Your goal is to analyze the dashboard metrics and active Skill Gap Alerts, and provide a premium, structured business recommendation panel.

STRICT RULES:
1. You MUST respond ONLY with a valid JSON object. No markdown formatting outside the JSON, no backticks, no introduction, no conclusion.
2. The JSON MUST exactly match this schema:
{
  "courses": [{ "name": "Course Name", "demand": "Critical" | "High" | "Medium", "reason": "Short reason" }],
  "capacities": [{ "course": "Course Name", "capacity": "Number-Number students", "reason": "Short reason" }],
  "improvements": { "addSkills": "Short text", "increaseEnrollments": "Short text", "improvePlacements": "Short text" },
  "priorities": [{ "action": "Short action", "priority": "HIGH" | "MEDIUM" }],
  "insight": "One short final recommendation"
}
3. Use the LIVE DATA provided below. DO NOT invent fake alerts.
4. CRITICAL: NEVER output "0-0 students" for capacity. You must analyze the job market demand (e.g. Critical, High) and estimate a realistic batch size (e.g. "30-40 students", "40-50 students"). If current students are 0, it means they need to START new batches!

LIVE DASHBOARD DATA:
Metrics: ${JSON.stringify(metrics)}
Active Skill Gap Alerts (URGENT DEMAND): ${JSON.stringify(alerts)}`;

        const { generateResponse } = await import('../../services/geminiAiService.js');
        const aiText = await generateResponse(systemPrompt, "{}");
        
        let parsedData = {};
        try {
            // Clean markdown JSON ticks if present
            const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("Failed to parse AI JSON:", parseError);
            console.log("Raw AI response:", aiText);
            return res.json({ success: false, message: 'AI returned invalid data format.' });
        }
        
        res.json({ success: true, isChat: false, summary: parsedData });
    } catch (error) {
        console.error("AI CHAT ERROR:", error);
        res.status(500).json({ success: false, message: 'Failed to generate AI response' });
    }
};

export const generateCoursePlan = async (req, res) => {
    try {
        const { insight, metrics } = req.body;
        
        const systemPrompt = `You are an expert AI Curriculum Designer and Business Strategist for an Educational Institute.
The institute owner clicked on an AI Insight: "${insight.skillName || insight.skill} Shortage" - "${insight.message}".
Your task is to design a complete course plan that they can immediately launch to address this shortage.

STRICT RULES:
1. You MUST respond ONLY with a valid JSON object. No markdown formatting outside the JSON, no backticks, no introduction, no conclusion.
2. The JSON MUST exactly match this schema:
{
  "courseName": "An engaging, professional title for the course",
  "demandReason": "Why they should start this course now (based on job market)",
  "duration": "e.g., 2-3 Months",
  "batchCapacity": "e.g., 30-40 Students",
  "prerequisites": "What students need to know before joining (e.g., Basic Python, None)",
  "curriculum": [
    {
      "module": "Module 1: Title",
      "topics": ["Topic 1", "Topic 2"]
    }
  ],
  "targetAudience": "Who should join this course"
}
3. Base your batchCapacity on current market demand. NEVER output 0-0 students.
4. IMPORTANT: Keep the curriculum concise. Create a MAXIMUM of 4 modules. Do NOT make the curriculum too long.
5. Keep topics realistic and structured.

LIVE METRICS (for context): ${JSON.stringify(metrics)}
CLICKED INSIGHT: ${JSON.stringify(insight)}`;

        const { generateResponse } = await import('../../services/geminiAiService.js');
        const aiText = await generateResponse(systemPrompt, "{}");
        
        let parsedData = {};
        try {
            const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedData = JSON.parse(cleanJson);
            
            // Check if it's the empty fallback object
            if (Object.keys(parsedData).length === 0) {
                return res.json({ success: false, message: 'AI Engine is currently overloaded. Please try again in a few moments.' });
            }
        } catch (parseError) {
            console.error("Failed to parse AI Course Plan JSON:", parseError);
            return res.json({ success: false, message: 'AI returned invalid data format.' });
        }
        
        res.json({ success: true, coursePlan: parsedData });
    } catch (error) {
        console.error("COURSE PLAN ERROR:", error);
        res.status(500).json({ success: false, message: 'Failed to generate AI course plan' });
    }
};

// --- CURRICULUM GAP ---
export const getCurriculumGap = async (req, res) => {
    try {
        // ─── PARALLEL BATCH 1 ────────────────────────────────────────────────
        // Both are independent — fire simultaneously
        const [myCourses, activeJobs] = await Promise.all([
            Course.find({ instituteId: req.institute._id }).select('_id'),
            Job.find({ status: 'Open' }).select('_id'),
        ]);

        const myCourseIds = myCourses.map(c => c._id);
        const activeJobIds = activeJobs.map(j => j._id);

        // ─── PARALLEL BATCH 2 ────────────────────────────────────────────────
        // Both depend on batch 1 results — fire simultaneously
        const [myCourseSkills, topJobSkills] = await Promise.all([
            CourseSkill.find({ courseId: { $in: myCourseIds } }).populate('skillId'),
            JobSkill.aggregate([
                { $match: { jobId: { $in: activeJobIds } } },
                { $group: { _id: "$skillId", demandCount: { $sum: 1 } } },
                { $sort: { demandCount: -1 } },
                { $limit: 25 }
            ]),
        ]);

        await Skill.populate(topJobSkills, { path: '_id', select: 'name' });

        // ─── COMPUTE ─────────────────────────────────────────────────────────
        const taughtSkillNamesRaw = myCourseSkills.map(cs => cs.skillId?.name || '').filter(Boolean);
        const taughtSkillsLower = [...new Set(taughtSkillNamesRaw.map(s => s.toLowerCase()))];
        const taughtSkillsActual = [...new Set(taughtSkillNamesRaw)];

        const marketDemand = topJobSkills
            .filter(js => js._id && js._id.name)
            .map(js => ({ name: js._id.name, demandCount: js.demandCount }));

        const missingSkills = marketDemand.filter(ms => !taughtSkillsLower.includes(ms.name.toLowerCase()));
        const coveredSkills  = marketDemand.filter(ms =>  taughtSkillsLower.includes(ms.name.toLowerCase()));

        res.json({
            success: true,
            gapData: { taughtSkills: taughtSkillsActual, marketDemand, missingSkills, coveredSkills }
        });
    } catch (error) {
        console.error("CURRICULUM GAP ERROR:", error);
        res.status(500).json({ success: false, message: 'Failed to aggregate curriculum gap data' });
    }
};
