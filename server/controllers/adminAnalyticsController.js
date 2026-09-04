import Job from '../models/Job.js';
import JobSkill from '../models/JobSkill.js';
import Skill from '../models/Skill.js';
import CourseSkill from '../models/CourseSkill.js';
import TrainingInstitute from '../models/TrainingInstitute.js';
import TrainingBatch from '../models/TrainingBatch.js';
import Enrollment from '../models/Enrollment.js';
import District from '../models/District.js';

export const getIntelligenceDashboard = async (req, res) => {
    try {
        // 1. Top KPIs
        const activeJobsCount = await Job.countDocuments({ visible: true });
        const districtsCount = await District.countDocuments();
        const institutesCount = await TrainingInstitute.countDocuments();
        
        const activeBatchStatuses = ['Planned', 'Ongoing'];
        const batchesCount = await TrainingBatch.countDocuments({ status: { $in: activeBatchStatuses } });
        
        const capacityAgg = await TrainingBatch.aggregate([
            { $match: { status: { $in: activeBatchStatuses } } },
            { $group: { _id: null, totalCapacity: { $sum: "$capacity" } } }
        ]);
        const trainingCapacity = capacityAgg.length > 0 ? capacityAgg[0].totalCapacity : 0;
        
        const enrollmentsCount = await Enrollment.countDocuments();

        // 2. Top Demanded Skills (Aggregation)
        const demandedSkillsAgg = await JobSkill.aggregate([
            { $group: { _id: "$skillId", jobCount: { $sum: 1 } } },
            { $sort: { jobCount: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'skills', localField: '_id', foreignField: '_id', as: 'skillInfo' } },
            { $unwind: "$skillInfo" },
            { $project: { _id: 1, name: "$skillInfo.name", jobCount: 1 } }
        ]);

        // 3. Training Supply per Skill
        // To find supply per skill, we need: Skill -> CourseSkill -> Course -> Batch -> Capacity
        const supplyVsDemand = [];
        let highShortageCount = 0;
        let moderateShortageCount = 0;
        let sufficientSupplyCount = 0;

        for (const skillReq of demandedSkillsAgg) {
            // Find courses teaching this skill
            const courseSkills = await CourseSkill.find({ skillId: skillReq._id });
            const courseIds = courseSkills.map(cs => cs.courseId);

            // Sum active batch capacity for these courses
            const batchAgg = await TrainingBatch.aggregate([
                { $match: { courseId: { $in: courseIds }, status: { $in: activeBatchStatuses } } },
                { $group: { _id: null, totalCapacity: { $sum: "$capacity" } } }
            ]);
            
            const supply = batchAgg.length > 0 ? batchAgg[0].totalCapacity : 0;
            const demand = skillReq.jobCount;
            const gap = Math.max(0, demand - supply);
            
            // Skill Gap Distribution Logic
            let status = '';
            let action = '';
            
            if (supply >= demand) {
                sufficientSupplyCount++;
                status = 'Sufficient Supply';
                action = 'Maintain current capacity';
            } else if (supply < demand * 0.5) {
                highShortageCount++;
                status = 'High Shortage';
                action = 'Increase training seats urgently';
            } else {
                moderateShortageCount++;
                status = 'Moderate Shortage';
                action = 'Consider additional batches';
            }

            supplyVsDemand.push({
                skillId: skillReq._id,
                skillName: skillReq.name,
                industryDemand: demand,
                trainingSupply: supply,
                calculatedGap: gap,
                status,
                recommendedAction: action
            });
        }

        const totalSkillsAnalyzed = highShortageCount + moderateShortageCount + sufficientSupplyCount;
        const skillGapDistribution = totalSkillsAnalyzed > 0 ? [
            { name: 'High Shortage', value: Math.round((highShortageCount / totalSkillsAnalyzed) * 100), color: '#EF4444' }, // Red
            { name: 'Moderate Shortage', value: Math.round((moderateShortageCount / totalSkillsAnalyzed) * 100), color: '#F59E0B' }, // Orange
            { name: 'Sufficient Supply', value: Math.round((sufficientSupplyCount / totalSkillsAnalyzed) * 100), color: '#10B981' } // Green
        ] : [];

        // 4. Industry-wise Job Demand
        const industryAgg = await Job.aggregate([
            { $match: { visible: true } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 }
        ]);
        const industryWiseDemand = industryAgg.map(i => ({ industry: i._id, value: i.count }));

        // 5. Geographic Intelligence (District-wise)
        const districtAgg = await District.find({});
        const geographicDemand = [];

        for (const dist of districtAgg) {
            const demand = await Job.countDocuments({ districtId: dist._id, visible: true });
            
            const institutes = await TrainingInstitute.find({ districtId: dist._id });
            const instIds = institutes.map(i => i._id);
            
            const dBatchAgg = await TrainingBatch.aggregate([
                { $match: { instituteId: { $in: instIds }, status: { $in: activeBatchStatuses } } },
                { $group: { _id: null, totalCapacity: { $sum: "$capacity" } } }
            ]);
            const supply = dBatchAgg.length > 0 ? dBatchAgg[0].totalCapacity : 0;
            
            if (demand > 0 || supply > 0) {
                geographicDemand.push({
                    districtId: dist._id,
                    districtName: dist.name,
                    state: dist.state,
                    demand,
                    supply,
                    gap: Math.max(0, demand - supply)
                });
            }
        }

        // Sort geographic by highest gap
        const topDistrictsByGap = [...geographicDemand].sort((a, b) => b.gap - a.gap).slice(0, 5);

        // 6. Dynamic AI Insights
        const aiInsights = [];
        if (supplyVsDemand.length > 0) {
            const highestDemandSkill = [...supplyVsDemand].sort((a,b) => b.industryDemand - a.industryDemand)[0];
            aiInsights.push({
                title: `High demand for ${highestDemandSkill.skillName}`,
                description: `Industry requires ${highestDemandSkill.industryDemand} jobs for this skill globally.`,
                type: 'trend'
            });

            const highestGapSkill = [...supplyVsDemand].sort((a,b) => b.calculatedGap - a.calculatedGap)[0];
            if (highestGapSkill.calculatedGap > 0) {
                aiInsights.push({
                    title: `Low training supply for ${highestGapSkill.skillName}`,
                    description: `Only ${highestGapSkill.trainingSupply} seats available against a demand of ${highestGapSkill.industryDemand}.`,
                    type: 'alert'
                });
            }
        }

        if (topDistrictsByGap.length > 0) {
            const topDist = topDistrictsByGap[0];
            aiInsights.push({
                title: `Opportunity in ${topDist.districtName}`,
                description: `${topDist.districtName} shows high demand (${topDist.demand}) but low training supply (${topDist.supply}).`,
                type: 'opportunity'
            });
        }

        res.json({
            success: true,
            analytics: {
                kpis: {
                    activeJobs: activeJobsCount,
                    districts: districtsCount,
                    institutes: institutesCount,
                    batches: batchesCount,
                    trainingCapacity,
                    enrollments: enrollmentsCount,
                    lastUpdated: new Date().toISOString()
                },
                topDemandedSkills: supplyVsDemand.map(s => ({ skill: s.skillName, demand: s.industryDemand })),
                supplyVsDemand,
                skillGapDistribution,
                industryWiseDemand,
                geographicDemand,
                topDistrictsByGap,
                aiInsights,
                supplyGapTable: supplyVsDemand
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate analytics dashboard data' });
    }
};
