import mongoose from 'mongoose';
import Job from '../models/Job.js';
import JobSkill from '../models/JobSkill.js';
import Skill from '../models/Skill.js';
import District from '../models/District.js';
import TrainingInstitute from '../models/TrainingInstitute.js';
import CourseSkill from '../models/CourseSkill.js';
import Batch from '../models/Batch.js';
import Enrollment from '../models/Enrollment.js';
import CurriculumAlert from '../models/CurriculumAlert.js';
import Trainer from '../models/Trainer.js';
import Equipment from '../models/Equipment.js';
import JobApplication from '../models/JobApplication.js';

class IntelligenceService {
    
    // Helper to get district IDs for a state filter
    static async getValidDistrictIds(stateFilter) {
        if (!stateFilter) return null;
        const regex = new RegExp(`^${stateFilter}$`, 'i');
        const districts = await District.find({ state: regex }).select('_id').lean();
        return districts.map(d => d._id);
    }

    // Helper to get registered states from DB dynamically
    static async getRegisteredStates() {
        const statesFromDistricts = await District.distinct('state');
        const validStates = statesFromDistricts
            .filter(Boolean)
            .map(s => s.trim())
            .filter(s => s.length > 0);
            
        const uniqueMap = new Map();
        validStates.forEach(s => {
            const key = s.toLowerCase();
            if (!uniqueMap.has(key)) {
                const formatted = s.charAt(0).toUpperCase() + s.slice(1);
                uniqueMap.set(key, formatted);
            }
        });
        
        // If DB has no districts yet, fallback to default state
        if (uniqueMap.size === 0) {
            uniqueMap.set('maharashtra', 'Maharashtra');
        }
        
        return Array.from(uniqueMap.values()).sort();
    }

    // 1. OVERVIEW
    static async getOverviewStats(filters = {}) {
        let districtIds = await this.getValidDistrictIds(filters.state);
        
        if (filters.districtId) {
            districtIds = [filters.districtId];
        }
        
        const jobFilter = { visible: true };
        const instFilter = {};
        const districtFilter = {};
        
        if (districtIds) {
            jobFilter.districtId = { $in: districtIds };
            instFilter.districtId = { $in: districtIds };
            districtFilter._id = { $in: districtIds };
        }

        // Institutes in the state
        const institutes = await TrainingInstitute.find(instFilter, '_id').lean();
        const instIds = institutes.map(i => i._id);

        // Batches in those institutes
        const batchFilter = { status: { $in: ['Planning', 'Active'] } };
        if (districtIds) {
            batchFilter.instituteId = { $in: instIds };
        }

        const [
            totalJobs,
            totalDistricts,
            totalInstitutes,
            batches
        ] = await Promise.all([
            Job.find(jobFilter, 'vacancies').lean(),
            District.countDocuments(districtFilter),
            TrainingInstitute.countDocuments(instFilter),
            Batch.find(batchFilter, 'capacity _id').lean()
        ]);

        const batchIds = batches.map(b => b._id);
        const totalEnrollments = await Enrollment.countDocuments({ batchId: { $in: batchIds } });

        const totalCapacity = batches.reduce((sum, b) => sum + (b.capacity || 0), 0);
        const totalVacancies = totalJobs.reduce((sum, j) => sum + (j.vacancies || 1), 0);

        return {
            totalJobs: totalJobs.length,
            totalVacancies,
            totalInstitutes,
            activeBatches: batches.length,
            trainingCapacity: totalCapacity,
            totalEnrollments
        };
    }

    // 2. DEMAND INTELLIGENCE
    static async getDemandStats(filters = {}) {
        let districtIds = await this.getValidDistrictIds(filters.state);
        
        if (filters.districtId) {
            districtIds = [filters.districtId];
        }

        const jobMatch = { 'job.visible': true };
        const jobFilter = { visible: true };
        
        if (districtIds) {
            jobMatch['job.districtId'] = { $in: districtIds };
            jobFilter.districtId = { $in: districtIds };
        }

        // Top Demanded Skills
        const topSkillsAgg = await JobSkill.aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            { $unwind: '$job' },
            { $match: jobMatch },
            {
                $group: {
                    _id: '$skillId',
                    demandCount: { $sum: { $ifNull: ['$job.vacancies', 1] } }
                }
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'skillInfo'
                }
            },
            { $unwind: '$skillInfo' },
            {
                $project: {
                    skillId: '$_id',
                    skillName: '$skillInfo.name',
                    demandCount: 1,
                    _id: 0
                }
            },
            { $sort: { demandCount: -1 } },
            { $limit: 20 }
        ]);

        // Top Roles
        const topRolesAgg = await Job.aggregate([
            { $match: jobFilter },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: { $ifNull: ['$vacancies', 1] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return {
            topSkills: topSkillsAgg,
            topRoles: topRolesAgg.map(r => ({ roleName: r._id, demandCount: r.count }))
        };
    }

    // 2.5 DEMAND TREND (Historical)
    static async getDemandTrend(filters = {}) {
        const districtIds = await this.getValidDistrictIds(filters.state);
        const matchStage = { visible: true };
        if (districtIds) {
            matchStage.districtId = { $in: districtIds };
        }

        const jobs = await Job.find(matchStage, 'vacancies date').lean();
        
        // Initialize last 6 months (including current)
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: d.toLocaleString('default', { month: 'short' }),
                year: d.getFullYear(),
                monthIndex: d.getMonth(),
                demand: 0
            });
        }

        // Aggregate real data
        jobs.forEach(j => {
            const d = new Date(j.date);
            const jMonth = d.getMonth();
            const jYear = d.getFullYear();
            
            const targetMonth = months.find(m => m.monthIndex === jMonth && m.year === jYear);
            if (targetMonth) {
                targetMonth.demand += (j.vacancies || 1);
            }
        });

        return months.map(m => ({ name: m.month, demand: m.demand }));
    }

    // 3. SUPPLY INTELLIGENCE
    static async getSupplyStats(filters = {}) {
        let districtIds = await this.getValidDistrictIds(filters.state);
        
        if (filters.districtId) {
            districtIds = [filters.districtId];
        }

        const matchStage = { status: { $in: ['Planning', 'Active'] } };
        
        if (districtIds) {
            const institutes = await TrainingInstitute.find({ districtId: { $in: districtIds } }, '_id').lean();
            const instIds = institutes.map(i => i._id);
            matchStage.instituteId = { $in: instIds };
        }

        const supplyBySkillAgg = await Batch.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'courseskills',
                    localField: 'courseId',
                    foreignField: 'courseId',
                    as: 'courseSkills'
                }
            },
            { $unwind: '$courseSkills' },
            {
                $lookup: {
                    from: 'traininginstitutes',
                    localField: 'instituteId',
                    foreignField: '_id',
                    as: 'institute'
                }
            },
            { $unwind: { path: '$institute', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { skillId: '$courseSkills.skillId', instituteId: '$instituteId' },
                    instituteName: { $first: '$institute.name' },
                    capacity: { $sum: '$capacity' }
                }
            },
            {
                $group: {
                    _id: '$_id.skillId',
                    supplyCapacity: { $sum: '$capacity' },
                    providers: {
                        $push: {
                            instituteId: '$_id.instituteId',
                            instituteName: { $ifNull: ['$instituteName', 'Unknown Institute'] },
                            capacity: '$capacity'
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'skills',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'skillInfo'
                }
            },
            { $unwind: '$skillInfo' },
            {
                $project: {
                    skillId: '$_id',
                    skillName: '$skillInfo.name',
                    supplyCapacity: 1,
                    providers: 1,
                    _id: 0
                }
            },
            { $sort: { supplyCapacity: -1 } }
        ]);

        return {
            topSuppliedSkills: supplyBySkillAgg
        };
    }

    // 4. GAP INTELLIGENCE
    static async getGapIntelligence(filters = {}) {
        const demand = await this.getDemandStats(filters);
        const supply = await this.getSupplyStats(filters);

        const demandMap = new Map();
        demand.topSkills.forEach(d => demandMap.set(d.skillId.toString(), { name: d.skillName, demand: d.demandCount }));

        const supplyMap = new Map();
        supply.topSuppliedSkills.forEach(s => supplyMap.set(s.skillId.toString(), { name: s.skillName, supply: s.supplyCapacity }));

        const allSkillIds = new Set([...demandMap.keys(), ...supplyMap.keys()]);
        const gapData = [];

        allSkillIds.forEach(id => {
            const d = demandMap.get(id) || { name: supplyMap.get(id).name, demand: 0 };
            const s = supplyMap.get(id) || { name: demandMap.get(id).name, supply: 0 };
            
            const demandCount = d.demand;
            const supplyCount = s.supply;
            const gap = demandCount - supplyCount;
            
            let status = 'Balanced';
            if (gap > 0) status = 'Shortage';
            if (gap < 0) status = 'Oversupply';

            gapData.push({
                skillId: id,
                skillName: d.name,
                demand: demandCount,
                supply: supplyCount,
                gap,
                status
            });
        });

        gapData.sort((a, b) => b.gap - a.gap);

        return gapData;
    }

    // 5. DISTRICT INTELLIGENCE
    static async getDistrictIntelligence(filters = {}) {
        const districtFilter = {};
        if (filters.state) {
            districtFilter.state = new RegExp(`^${filters.state}$`, 'i');
        }
        if (filters.districtId) {
            districtFilter._id = filters.districtId;
        }
        
        const districts = await District.find(districtFilter).lean();
        const dataMap = new Map();

        for (const dist of districts) {
            const distId = dist._id;
            const normName = dist.name ? dist.name.trim() : 'Unknown';
            const normKey = normName.toLowerCase();

            const jobsInDistrict = await Job.find({ districtId: distId, visible: true }, 'vacancies').lean();
            const jobCount = jobsInDistrict.reduce((sum, j) => sum + (j.vacancies || 1), 0);
            
            const institutes = await TrainingInstitute.find({ districtId: distId }, '_id').lean();
            const instIds = institutes.map(i => i._id);
            
            const batches = await Batch.find({ instituteId: { $in: instIds }, status: { $in: ['Planning', 'Active'] } }, 'capacity _id').lean();
            const batchIds = batches.map(b => b._id);
            const capacityCount = batches.reduce((sum, b) => sum + (b.capacity || 0), 0);
            
            const enrollmentsCount = await Enrollment.countDocuments({ batchId: { $in: batchIds } });

            if (dataMap.has(normKey)) {
                const existing = dataMap.get(normKey);
                existing.jobs += jobCount;
                existing.jobPosts += jobsInDistrict.length;
                existing.institutes += instIds.length;
                existing.capacity += capacityCount;
                existing.enrollments += enrollmentsCount;
            } else {
                const formattedName = normName.charAt(0).toUpperCase() + normName.slice(1);
                dataMap.set(normKey, {
                    districtId: distId,
                    districtName: formattedName,
                    state: dist.state,
                    jobs: jobCount,
                    jobPosts: jobsInDistrict.length,
                    institutes: instIds.length,
                    capacity: capacityCount,
                    enrollments: enrollmentsCount
                });
            }
        }
        
        return Array.from(dataMap.values()).sort((a, b) => b.jobs - a.jobs);
    }

    // 5.5 DISTRICT DIGITAL TWIN (Detailed Ecosystem Chain)
    static async getDistrictDigitalTwin(districtId) {
        let dist = null;
        if (districtId && districtId !== 'all') {
            const cleanInput = decodeURIComponent(districtId).replace(/\s*\(\d+.*?\)/, '').trim();
            
            if (mongoose.Types.ObjectId.isValid(cleanInput)) {
                dist = await District.findById(cleanInput).lean();
            }
            
            if (!dist) {
                dist = await District.findOne({ name: new RegExp(`^${cleanInput}$`, 'i') }).lean();
            }
            
            if (!dist) {
                dist = await District.findOne({ name: new RegExp(cleanInput, 'i') }).lean();
            }
        }
        
        if (!dist && districtId !== 'all') {
            dist = await District.findOne().lean();
        }

        const distId = dist ? dist._id : null;
        const districtName = dist ? (dist.name.charAt(0).toUpperCase() + dist.name.slice(1)) : 'State Overall';
        const stateName = dist ? dist.state : 'Maharashtra';

        let matchingDistIds = [distId].filter(Boolean);
        if (dist && dist.name) {
            const sameNameDists = await District.find({ name: new RegExp(`^${dist.name}$`, 'i') }, '_id').lean();
            matchingDistIds = sameNameDists.map(d => d._id);
        }

        const jobFilter = matchingDistIds.length > 0 ? { districtId: { $in: matchingDistIds }, visible: true } : { visible: true };
        const jobs = await Job.find(jobFilter, '_id title category vacancies companyId').lean();
        const jobIds = jobs.map(j => j._id);
        const totalVacancies = jobs.reduce((sum, j) => sum + (j.vacancies || 1), 0);

        // Top Industries in District
        const categoryMap = {};
        jobs.forEach(j => {
            const cat = j.category || 'Technology';
            categoryMap[cat] = (categoryMap[cat] || 0) + (j.vacancies || 1);
        });
        const topIndustries = Object.entries(categoryMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // Institutes in District
        const instFilter = matchingDistIds.length > 0 ? { districtId: { $in: matchingDistIds } } : {};
        const institutes = await TrainingInstitute.find(instFilter, '_id name type').lean();
        const instIds = institutes.map(i => i._id);

        // 1. Filter out garbage skills by using a master logical list
        const MASTER_LOGICAL_SKILLS = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'C++', 'C#', 
            'SQL', 'MongoDB', 'Mongodb', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 
            'Data Analysis', 'Data Science', 'Communication', 'Leadership', 
            'Project Management', 'Problem Solving', 'Cloud Computing', 'UI/UX Design',
            'Cybersecurity', 'Database Security', 'DevOps', 'TypeScript', 'HTML/CSS', 
            'Mobile Development', 'Agile', 'Scrum', 'Marketing', 'Sales', 'Data Modeling', 
            'Business Analysis', 'Programming'
        ];
        
        const masterLower = MASTER_LOGICAL_SKILLS.map(s => s.toLowerCase());

        // Pre-fetch matching Skill IDs by fetching all and filtering in memory (safest method against CastErrors)
        const allSkillsDocs = await Skill.find({}, 'name _id').lean();
        const masterSkillIds = allSkillsDocs
            .filter(doc => masterLower.includes(doc.name.toLowerCase()))
            .map(doc => doc._id);

        // 2. Get actioned skills to hide them from the dashboard
        const actionedSkills = dist?.actionedSkills || [];

        const [
            jobSkillsAgg,
            batches,
            trainerCount,
            equipmentCount
        ] = await Promise.all([
            JobSkill.aggregate([
                { $match: { jobId: { $in: jobIds }, skillId: { $in: masterSkillIds } } },
                { $lookup: { from: 'skills', localField: 'skillId', foreignField: '_id', as: 'skill' } },
                { $unwind: '$skill' },
                // Match against master list AND ensure it's not already actioned
                { $match: { 
                    'skill.name': { $nin: actionedSkills } 
                }},
                { $group: { _id: '$skillId', count: { $sum: 1 }, name: { $first: '$skill.name' }, category: { $first: '$skill.category' } } },
                { $sort: { count: -1 } },
                { $limit: 6 },
                { $project: { _id: 0, skillId: '$_id', name: 1, category: 1, count: 1 } }
            ]),
            Batch.find({ instituteId: { $in: instIds } }, 'capacity _id courseId').lean(),
            Trainer.countDocuments({ instituteId: { $in: instIds } }),
            Equipment.countDocuments({ instituteId: { $in: instIds } })
        ]);

        const batchIds = batches.map(b => b._id);
        const totalCapacity = batches.reduce((sum, b) => sum + (b.capacity || 0), 0);
        const courseIds = [...new Set(batches.map(b => b.courseId).filter(Boolean))];

        // Placements (Hired Candidates)
        const placementsCount = await Enrollment.countDocuments({
            batchId: { $in: batchIds },
            placementStatus: 'Hired'
        });

        // Net Shortage Calculation
        const netGap = totalVacancies - totalCapacity;
        const gapStatus = netGap > 50 ? 'Critical Shortage' : netGap > 0 ? 'Moderate Shortage' : 'Balanced';

        // Gap Intelligence for specific district
        const districtGapData = await this.getGapIntelligence({ districtId: distId });
        // Filter out non-shortages and take top 5
        const topShortages = districtGapData.filter(g => g.gap > 0).slice(0, 5);

        return {
            districtId: distId,
            districtName,
            state: stateName,
            totalJobs: jobs.length,
            totalVacancies,
            totalInstitutes: institutes.length,
            totalCapacity,
            trainersCount: trainerCount,
            equipmentCount,
            placementsCount,
            netGap,
            gapStatus,
            topIndustries,
            topSkills: jobSkillsAgg,
            institutesList: institutes.slice(0, 5),
            courseCount: courseIds.length,
            topShortages // Added this for popup
        };
    }

    // 6. DASHBOARD ANALYTICS (Aggregate for Frontend)
    static async getDashboardAnalytics(filters = {}) {
        const kpis = await this.getOverviewStats(filters);
        const demand = await this.getDemandStats(filters);
        const demandTrend = await this.getDemandTrend(filters);
        const supply = await this.getSupplyStats(filters);
        const gapTable = await this.getGapIntelligence(filters);
        const districts = await this.getDistrictIntelligence(filters);

        const top5Skills = demand.topSkills.slice(0, 5);
        const supplyVsDemand = top5Skills.map(ds => {
            const ss = supply.topSuppliedSkills.find(s => s.skillId.toString() === ds.skillId.toString());
            return {
                name: ds.skillName,
                demand: ds.demandCount,
                supply: ss ? ss.supplyCapacity : 0,
                providers: ss ? ss.providers : []
            };
        });

        let highShortage = 0, moderateShortage = 0, sufficientSupply = 0;
        gapTable.forEach(g => {
            if (g.gap > 50) highShortage++;
            else if (g.gap > 0) moderateShortage++;
            else sufficientSupply++;
        });
        const totalGapSkills = gapTable.length || 1;
        const gapDistribution = [
            { name: 'High Shortage', value: Math.round((highShortage / totalGapSkills) * 100), color: '#EF4444' },
            { name: 'Moderate Shortage', value: Math.round((moderateShortage / totalGapSkills) * 100), color: '#F59E0B' },
            { name: 'Sufficient Supply', value: Math.round((sufficientSupply / totalGapSkills) * 100), color: '#10B981' }
        ];

        const colors = ['#3B82F6', '#6366F1', '#F43F5E', '#10B981', '#F472B6', '#9CA3AF'];
        const totalRoles = demand.topRoles.reduce((sum, r) => sum + r.demandCount, 0) || 1;
        const industryWiseDemand = demand.topRoles.slice(0, 6).map((r, i) => ({
            name: r.roleName || 'Others',
            value: Math.round((r.demandCount / totalRoles) * 100),
            color: colors[i % colors.length]
        }));

        const topDistrictsByGap = districts.map(d => ({
            name: `${d.districtName} (${d.state})`,
            gap: d.jobs > d.capacity ? `+${d.jobs - d.capacity}` : 'Balanced',
            gapValue: d.jobs - d.capacity
        }))
        .filter(d => d.gapValue > 0)
        .sort((a, b) => b.gapValue - a.gapValue)
        .slice(0, 5);

        const supplyGapTable = gapTable.filter(g => g.gap > 0).map(g => ({
            skill: g.skillName,
            demand: g.demand,
            supply: g.supply,
            gap: g.gap > 0 ? `+${g.gap}` : g.gap.toString(),
            status: g.gap > 50 ? 'High Shortage' : g.gap > 0 ? 'Shortage' : 'Balanced',
            action: g.gap > 50 ? 'Increase training seats' : g.gap > 0 ? 'Start new batches' : 'Monitor'
        }));

        // Fetch curriculum alerts
        const activeAlerts = await CurriculumAlert.find({ status: 'Active' }).sort({ createdAt: -1 });

        return {
            kpis: {
                ...kpis,
                totalShortages: highShortage + moderateShortage
            },
            supplyVsDemand,
            demandTrend,
            gapDistribution,
            industryWiseDemand,
            topDistrictsByGap,
            supplyGapTable,
            districtDetails: districts,
            activeAlerts
        };
    }

    // 7. GET SKILL INTELLIGENCE (For Actionable Digital Twin Drill-Down)
    static async getSkillIntelligence(districtId, skillName) {
        let matchingDistIds = [];
        
        // Handle District resolution
        if (districtId && districtId !== 'all') {
            const mongoose = (await import('mongoose')).default;
            let dist;
            if (mongoose.Types.ObjectId.isValid(districtId)) {
                dist = await District.findById(districtId).lean();
            } else {
                dist = await District.findOne({ name: new RegExp(`^${districtId.trim()}$`, 'i') }).lean();
            }
            if (dist) {
                const sameNameDists = await District.find({ name: new RegExp(`^${dist.name}$`, 'i') }, '_id').lean();
                matchingDistIds = sameNameDists.map(d => d._id);
            }
        }
        
        // 1. Demand & Hiring Companies
        const jobFilter = { visible: true };
        if (matchingDistIds.length > 0) {
            jobFilter.districtId = { $in: matchingDistIds };
        }
        jobFilter.skills = { $regex: new RegExp(`^${skillName.trim()}$`, 'i') };
        
        const jobs = await Job.find(jobFilter)
            .populate('companyId', 'name image location')
            .lean();
            
        const demand = jobs.reduce((sum, j) => sum + (j.vacancies || 1), 0);
        
        const companiesMap = new Map();
        jobs.forEach(j => {
            if (j.companyId) {
                const cid = j.companyId._id.toString();
                if (!companiesMap.has(cid)) {
                    companiesMap.set(cid, {
                        _id: cid,
                        name: j.companyId.name,
                        image: j.companyId.image,
                        vacancies: 0,
                        roles: []
                    });
                }
                const comp = companiesMap.get(cid);
                comp.vacancies += (j.vacancies || 1);
                if (!comp.roles.includes(j.title)) {
                    comp.roles.push(j.title);
                }
            }
        });
        const companies = Array.from(companiesMap.values()).sort((a, b) => b.vacancies - a.vacancies);

        // 2. Supply & Relevant Training Centers
        const skill = await Skill.findOne({ name: { $regex: new RegExp(`^${skillName.trim()}$`, 'i') } });
        let supply = 0;
        const institutesMap = new Map();
        
        if (skill) {
            const courseSkills = await CourseSkill.find({ skillId: skill._id }).lean();
            const courseIds = courseSkills.map(cs => cs.courseId);
            
            if (courseIds.length > 0) {
                const batches = await Batch.find({ courseId: { $in: courseIds } })
                    .populate('instituteId', 'name type address districtId image')
                    .lean();
                    
                batches.forEach(b => {
                    if (b.instituteId) {
                        const distStr = b.instituteId.districtId?.toString();
                        if (matchingDistIds.length === 0 || matchingDistIds.some(id => id.toString() === distStr)) {
                            supply += (b.enrolledCount || 0);
                            
                            const instId = b.instituteId._id.toString();
                            if (!institutesMap.has(instId)) {
                                institutesMap.set(instId, {
                                    _id: instId,
                                    name: b.instituteId.name,
                                    type: b.instituteId.type,
                                    address: b.instituteId.address,
                                    image: b.instituteId.image,
                                    totalCapacity: 0,
                                    enrolledCount: 0
                                });
                            }
                            const inst = institutesMap.get(instId);
                            inst.totalCapacity += (b.capacity || 0);
                            inst.enrolledCount += (b.enrolledCount || 0);
                        }
                    }
                });
            }
        }
        
        const institutes = Array.from(institutesMap.values()).sort((a, b) => b.totalCapacity - a.totalCapacity);
        const gap = demand - supply;

        return {
            skillName,
            demand,
            supply,
            gap,
            companies,
            institutes
        };
    }
    // 8. FORECAST INTELLIGENCE (PREDICTIVE INSIGHTS)
    static async getForecastIntelligence(filters = {}) {
        let districtIds = await this.getValidDistrictIds(filters.state);
        
        if (filters.districtId) {
            districtIds = [filters.districtId];
        }

        const matchStage = { visible: true };
        if (districtIds) {
            matchStage.districtId = { $in: districtIds };
        }

        // Look back up to 12 months (or more if needed)
        const monthsHistory = 12;
        const now = new Date();
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsHistory + 1, 1).getTime();
        matchStage.date = { $gte: cutoffDate };

        // 1. Fetch all jobs in the period
        const jobs = await Job.find(matchStage, '_id vacancies date').lean();
        const jobIds = jobs.map(j => j._id);

        // 2. Fetch JobSkills for these jobs
        const jobSkills = await JobSkill.find({ jobId: { $in: jobIds } }).populate('skillId', 'name category').lean();

        // 3. Build monthly buckets
        const months = [];
        for (let i = monthsHistory - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: d.toLocaleString('default', { month: 'short' }),
                year: d.getFullYear(),
                monthIndex: d.getMonth(),
                timestamp: d.getTime()
            });
        }

        // Skill Demand Map: skillName -> { history: [0,0,0...], total: 0 }
        const skillData = new Map();

        // 4. Map jobs to their month index (0 to 11)
        const jobMonthMap = new Map();
        jobs.forEach(j => {
            const jd = new Date(j.date);
            const jMonth = jd.getMonth();
            const jYear = jd.getFullYear();
            
            const monthIdx = months.findIndex(m => m.monthIndex === jMonth && m.year === jYear);
            if (monthIdx !== -1) {
                jobMonthMap.set(j._id.toString(), { idx: monthIdx, vacancies: j.vacancies || 1 });
            }
        });

        // 5. Aggregate skill demand by month
        jobSkills.forEach(js => {
            if (!js.skillId || !js.skillId.name) return;
            const skillName = js.skillId.name;
            const jobInfo = jobMonthMap.get(js.jobId.toString());
            
            if (jobInfo) {
                if (!skillData.has(skillName)) {
                    skillData.set(skillName, { history: new Array(monthsHistory).fill(0), total: 0 });
                }
                const sd = skillData.get(skillName);
                sd.history[jobInfo.idx] += jobInfo.vacancies;
                sd.total += jobInfo.vacancies;
            }
        });

        // Current supply data (fetch once for efficiency)
        const supplyData = await this.getSupplyStats(filters);
        const supplyMap = new Map();
        supplyData.topSuppliedSkills.forEach(s => {
            supplyMap.set(s.skillName.toLowerCase(), s.supplyCapacity);
        });

        // 6. Forecasting Engine & Classification
        const emergingSkills = [];
        const decliningSkills = [];
        const collisionForecasts = [];

        // Helper for simple linear regression (y = mx + c)
        const calculateTrend = (history) => {
            const n = history.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            for (let i = 0; i < n; i++) {
                sumX += i;
                sumY += history[i];
                sumXY += i * history[i];
                sumXX += i * i;
            }
            const denominator = n * sumXX - sumX * sumX;
            if (denominator === 0) return { slope: 0, intercept: sumY / n || 0 };
            const slope = (n * sumXY - sumX * sumY) / denominator;
            const intercept = (sumY - slope * sumX) / n;
            return { slope, intercept };
        };

        skillData.forEach((data, skillName) => {
            const history = data.history; // Array of 12 months
            const recentHistory = history.slice(-3); // Last 3 months
            const pastHistory = history.slice(-6, -3); // Previous 3 months
            
            const recentTotal = recentHistory.reduce((a, b) => a + b, 0);
            const pastTotal = pastHistory.reduce((a, b) => a + b, 0);

            // Avoid division by zero
            const growthRate = pastTotal > 0 ? ((recentTotal - pastTotal) / pastTotal) * 100 : (recentTotal > 0 ? 100 : 0);

            // Time series forecasting (Linear Regression)
            const trend = calculateTrend(history);
            
            // Forecast for next 6 months (indices 12 to 17)
            const forecast6Months = [];
            let projectedDemandTotal = 0;
            for (let i = 0; i < 6; i++) {
                const projectedVal = Math.max(0, Math.round(trend.slope * (monthsHistory + i) + trend.intercept));
                forecast6Months.push(projectedVal);
                projectedDemandTotal += projectedVal;
            }

            // Supply mapping
            const currentSupply = supplyMap.get(skillName.toLowerCase()) || 0;
            const projectedSupplyTotal = currentSupply > 0 ? Math.round(currentSupply * 1.5) : 0; // naive projection for 6 months
            
            const currentDemand = history[history.length - 1];
            const previousDemand = history[history.length - 2];
            
            const skillForecastObj = {
                skill: skillName,
                currentDemand,
                previousDemand,
                growthPercentage: growthRate.toFixed(1),
                trendSlope: trend.slope.toFixed(2),
                history,
                forecast: forecast6Months,
                projectedDemand: projectedDemandTotal,
                currentSupply,
                projectedGap: projectedDemandTotal - projectedSupplyTotal
            };

            // Classification Rules
            // Emerging: positive slope, recent growth > 20%, sufficient data (total > 5 to avoid noise)
            if (trend.slope > 0.1 && growthRate > 10 && data.total > 5) {
                emergingSkills.push({
                    ...skillForecastObj,
                    reason: `Demand has grown by ${growthRate.toFixed(1)}% recently.`,
                    confidence: data.total > 50 ? 'High' : 'Medium'
                });
            }
            
            // Declining: negative slope, negative growth, meaningful past data
            if (trend.slope < -0.1 && growthRate < -10 && pastTotal > 10) {
                decliningSkills.push({
                    ...skillForecastObj,
                    reason: `Demand has declined by ${Math.abs(growthRate).toFixed(1)}% compared to the previous period.`,
                    confidence: pastTotal > 50 ? 'High' : 'Medium'
                });
            }

            // Collision (Shortage): projected demand significantly exceeds projected supply
            if (skillForecastObj.projectedGap > 20 && trend.slope > 0) {
                collisionForecasts.push({
                    ...skillForecastObj,
                    status: 'Projected Shortage'
                });
            }
        });

        // Sort arrays
        emergingSkills.sort((a, b) => b.trendSlope - a.trendSlope);
        decliningSkills.sort((a, b) => a.trendSlope - b.trendSlope); // Most negative first
        collisionForecasts.sort((a, b) => b.projectedGap - a.projectedGap);

        // Chart Data Generation (Overall Demand vs Supply)
        const overallChartData = [];
        
        // Historical Data (last 6 months for chart brevity)
        const totalMonthlySupply = Math.round(supplyData.topSuppliedSkills.reduce((a, b) => a + b.supplyCapacity, 0) / 12);
        for (let i = 6; i < monthsHistory; i++) {
            let demandSum = 0;
            skillData.forEach(data => demandSum += data.history[i]);
            overallChartData.push({
                name: months[i].month,
                isForecast: false,
                demand: demandSum,
                supply: totalMonthlySupply // Approximate monthly supply
            });
        }

        // Forecast Data (next 6 months)
        let lastSupply = overallChartData.length > 0 ? overallChartData[overallChartData.length - 1].supply : 0;
        
        for (let i = 1; i <= 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            let projectedDemand = 0;
            skillData.forEach(data => {
                const trend = calculateTrend(data.history);
                projectedDemand += Math.max(0, Math.round(trend.slope * (monthsHistory + i - 1) + trend.intercept));
            });
            
            overallChartData.push({
                name: d.toLocaleString('default', { month: 'short' }),
                isForecast: true,
                demand: projectedDemand,
                supply: lastSupply // static supply for projection
            });
        }

        return {
            monthsHistory,
            emergingSkills: emergingSkills.slice(0, 10),
            decliningSkills: decliningSkills.slice(0, 10),
            shortages: collisionForecasts.slice(0, 10),
            chartData: overallChartData,
            timestamp: new Date().toISOString()
        };
    }

    // 9. BRAIN DRAIN & MIGRATION ANALYSIS
    static async getMigrationAnalysis(filters = {}) {
        const stateFilter = filters.state || 'Maharashtra';
        const regex = new RegExp(`^${stateFilter}$`, 'i');
        
        // 1. Get all institutes in this state
        const districts = await District.find({ state: regex }).select('_id').lean();
        const districtIds = districts.map(d => d._id);
        
        const institutes = await TrainingInstitute.find({ districtId: { $in: districtIds } }).select('_id').lean();
        const instIds = institutes.map(i => i._id);
        
        if (instIds.length === 0) return { error: "No training institutes found for this state." };
        
        // 2. Get all Users trained in these institutes
        const enrollments = await Enrollment.find({ instituteId: { $in: instIds } }).select('userId').lean();
        const userIds = [...new Set(enrollments.map(e => e.userId))];
        
        if (userIds.length === 0) return { error: "No candidates trained in this state found." };
        
        // 3. Find Hired JobApplications for these users
        const hiredApps = await JobApplication.find({ 
            userId: { $in: userIds },
            status: 'Hired'
        }).populate({
            path: 'jobId',
            select: 'districtId location salary'
        }).lean();
        
        if (hiredApps.length === 0) return { error: "Migration analysis unavailable because verified placement destination data is insufficient." };
        
        // 4. Analyze placement destinations
        let retainedCount = 0;
        let migratedCount = 0;
        const destinationStates = {}; 
        
        let retainedSalarySum = 0;
        let retainedSalaryCount = 0;
        let migratedSalarySum = 0;
        let migratedSalaryCount = 0;
        
        hiredApps.forEach(app => {
            if (!app.jobId) return;
            const job = app.jobId;
            
            let isRetained = false;
            let destState = stateFilter;
            
            if (job.districtId && districtIds.some(id => id.toString() === job.districtId.toString())) {
                isRetained = true;
            } else if (job.location) {
                if (job.location.toLowerCase().includes(stateFilter.toLowerCase())) {
                    isRetained = true;
                } else {
                    const parts = job.location.split(',');
                    destState = parts.length > 1 ? parts[parts.length - 1].trim() : job.location.trim();
                }
            }
            
            const salary = Number(job.salary) || 0;
            
            if (isRetained) {
                retainedCount++;
                if (salary > 0) {
                    retainedSalarySum += salary;
                    retainedSalaryCount++;
                }
            } else {
                migratedCount++;
                destinationStates[destState] = (destinationStates[destState] || 0) + 1;
                if (salary > 0) {
                    migratedSalarySum += salary;
                    migratedSalaryCount++;
                }
            }
        });
        
        const totalPlaced = retainedCount + migratedCount;
        if (totalPlaced === 0) return { error: "Migration analysis unavailable because verified placement destination data is insufficient." };
        
        const destinationsArr = Object.keys(destinationStates).map(state => ({
            state,
            count: destinationStates[state],
            share: ((destinationStates[state] / totalPlaced) * 100).toFixed(1)
        })).sort((a, b) => b.count - a.count).slice(0, 5);
        
        return {
            totalTrained: userIds.length,
            totalPlaced,
            retainedCount,
            migratedCount,
            retentionRate: ((retainedCount / totalPlaced) * 100).toFixed(1),
            migrationRate: ((migratedCount / totalPlaced) * 100).toFixed(1),
            topDestinations: destinationsArr,
            salaryComparison: {
                retainedMedian: retainedSalaryCount > 0 ? Math.round(retainedSalarySum / retainedSalaryCount) : null,
                migratedMedian: migratedSalaryCount > 0 ? Math.round(migratedSalarySum / migratedSalaryCount) : null,
                hasReliableSalaryData: retainedSalaryCount > 2 && migratedSalaryCount > 2
            },
            timestamp: new Date().toISOString()
        };
    }

    // 10. DISTRICT & SECTOR DEEP-DIVE
    static async getSectorMatrix(filters = {}) {
        let districtIds = await this.getValidDistrictIds(filters.state);
        let matchStageJob = { visible: true };
        let matchStageSupply = { status: { $in: ['Planning', 'Active'] } };
        
        if (filters.districtId) {
            districtIds = [filters.districtId];
        }
        if (districtIds) {
            matchStageJob.districtId = { $in: districtIds };
        }
        if (filters.level) {
            matchStageJob.level = filters.level;
        }
        
        // 1. Get Demand by District and Sector (category)
        const demandAgg = await Job.aggregate([
            { $match: matchStageJob },
            {
                $group: {
                    _id: { districtId: '$districtId', sector: '$category' },
                    vacancies: { $sum: { $ifNull: ['$vacancies', 1] } }
                }
            }
        ]);
        
        // 2. Get Supply by District and Sector
        if (districtIds) {
            const institutes = await TrainingInstitute.find({ districtId: { $in: districtIds } }, '_id').lean();
            const instIds = institutes.map(i => i._id);
            matchStageSupply.instituteId = { $in: instIds };
        }
        
        const supplyAgg = await Batch.aggregate([
            { $match: matchStageSupply },
            {
                $lookup: {
                    from: 'courseskills',
                    localField: 'courseId',
                    foreignField: 'courseId',
                    as: 'courseSkills'
                }
            },
            { $unwind: '$courseSkills' },
            {
                $lookup: {
                    from: 'skills',
                    localField: 'courseSkills.skillId',
                    foreignField: '_id',
                    as: 'skill'
                }
            },
            { $unwind: '$skill' },
            {
                $lookup: {
                    from: 'traininginstitutes',
                    localField: 'instituteId',
                    foreignField: '_id',
                    as: 'institute'
                }
            },
            { $unwind: '$institute' },
            {
                $group: {
                    _id: { batchId: '$_id', districtId: '$institute.districtId', sector: '$skill.category' },
                    capacity: { $first: '$capacity' }
                }
            },
            {
                $group: {
                    _id: { districtId: '$_id.districtId', sector: '$_id.sector' },
                    capacity: { $sum: '$capacity' }
                }
            }
        ]);
        
        // Fetch district names
        const allDistricts = await District.find({}, '_id name').lean();
        const districtMap = new Map();
        allDistricts.forEach(d => districtMap.set(d._id.toString(), d.name));
        
        const matrixMap = new Map(); 
        
        demandAgg.forEach(d => {
            if (!d._id.districtId || !d._id.sector) return;
            const key = `${d._id.districtId}_${d._id.sector}`;
            matrixMap.set(key, {
                districtId: d._id.districtId,
                districtName: districtMap.get(d._id.districtId.toString()) || 'Unknown',
                sector: d._id.sector,
                demand: d.vacancies,
                supply: 0
            });
        });
        
        supplyAgg.forEach(s => {
            if (!s._id.districtId || !s._id.sector) return;
            const key = `${s._id.districtId}_${s._id.sector}`;
            if (matrixMap.has(key)) {
                matrixMap.get(key).supply = s.capacity;
            } else {
                matrixMap.set(key, {
                    districtId: s._id.districtId,
                    districtName: districtMap.get(s._id.districtId.toString()) || 'Unknown',
                    sector: s._id.sector,
                    demand: 0,
                    supply: s.capacity
                });
            }
        });
        
        const matrix = Array.from(matrixMap.values()).map(item => {
            item.gap = item.demand - item.supply;
            item.coverage = item.demand > 0 ? Math.min(100, Math.round((item.supply / item.demand) * 100)) : 100;
            item.status = item.gap > 50 ? 'Critical Shortage' : (item.gap > 0 ? 'Shortage' : 'Adequate');
            return item;
        });
        
        return {
            matrix,
            timestamp: new Date().toISOString()
        };
    }
}

export default IntelligenceService;
