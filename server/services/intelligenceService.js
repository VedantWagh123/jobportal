import Job from '../models/Job.js';
import JobSkill from '../models/JobSkill.js';
import Skill from '../models/Skill.js';
import District from '../models/District.js';
import TrainingInstitute from '../models/TrainingInstitute.js';
import CourseSkill from '../models/CourseSkill.js';
import Batch from '../models/Batch.js';
import Enrollment from '../models/Enrollment.js';
import CurriculumAlert from '../models/CurriculumAlert.js';

class IntelligenceService {
    
    // Helper to get district IDs for a state filter
    static async getValidDistrictIds(stateFilter) {
        if (!stateFilter) return null;
        const regex = new RegExp(`^${stateFilter}$`, 'i');
        const districts = await District.find({ state: regex }).select('_id').lean();
        return districts.map(d => d._id);
    }

    // 1. OVERVIEW
    static async getOverviewStats(filters = {}) {
        const districtIds = await this.getValidDistrictIds(filters.state);
        
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
        const districtIds = await this.getValidDistrictIds(filters.state);
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
        const districtIds = await this.getValidDistrictIds(filters.state);
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
        
        const districts = await District.find(districtFilter).lean();
        const data = [];

        for (const dist of districts) {
            const distId = dist._id;

            const jobsInDistrict = await Job.find({ districtId: distId, visible: true }, 'vacancies').lean();
            const jobCount = jobsInDistrict.reduce((sum, j) => sum + (j.vacancies || 1), 0);
            
            const institutes = await TrainingInstitute.find({ districtId: distId }, '_id').lean();
            const instIds = institutes.map(i => i._id);
            
            const batches = await Batch.find({ instituteId: { $in: instIds }, status: { $in: ['Planning', 'Active'] } }, 'capacity _id').lean();
            const batchIds = batches.map(b => b._id);
            const capacityCount = batches.reduce((sum, b) => sum + (b.capacity || 0), 0);
            
            const enrollmentsCount = await Enrollment.countDocuments({ batchId: { $in: batchIds } });

            data.push({
                districtId: distId,
                districtName: dist.name,
                state: dist.state,
                jobs: jobCount,
                institutes: instIds.length,
                capacity: capacityCount,
                enrollments: enrollmentsCount
            });
        }
        
        return data.sort((a, b) => b.jobs - a.jobs);
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

        const supplyGapTable = gapTable.slice(0, 5).map(g => ({
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
            kpis,
            supplyVsDemand,
            demandTrend,
            gapDistribution,
            industryWiseDemand,
            topDistrictsByGap,
            supplyGapTable,
            activeAlerts
        };
    }
}

export default IntelligenceService;
