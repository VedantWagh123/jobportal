import UnresolvedSkill from '../models/UnresolvedSkill.js';
import Skill from '../models/Skill.js';
import JobSkill from '../models/JobSkill.js';

// @desc    Get all unresolved skills
// @route   GET /api/government-admin/intelligence/unresolved-skills
// @access  Admin
export const getUnresolvedSkills = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'pending', sort = 'newest' } = req.query;

        const query = { status };

        if (search) {
            query.$or = [
                { rawName: { $regex: search, $options: 'i' } },
                { normalizedName: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        if (sort === 'newest') sortOptions.createdAt = -1;
        else if (sort === 'oldest') sortOptions.createdAt = 1;
        else if (sort === 'confidence') sortOptions.confidence = -1;
        else sortOptions.createdAt = -1; // default

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const unresolvedSkills = await UnresolvedSkill.find(query)
            .populate('jobId', 'title companyId date')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await UnresolvedSkill.countDocuments(query);

        res.json({
            success: true,
            unresolvedSkills,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Error fetching unresolved skills:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Approve an unresolved skill
// @route   POST /api/government-admin/intelligence/unresolved-skills/:id/approve
// @access  Admin
export const approveSkill = async (req, res) => {
    try {
        const { id } = req.params;

        const unresolvedSkill = await UnresolvedSkill.findById(id);

        if (!unresolvedSkill) {
            return res.status(404).json({ success: false, message: 'Unresolved Skill not found' });
        }

        if (unresolvedSkill.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Skill already ${unresolvedSkill.status}` });
        }

        // Duplicate protection: Check if Skill already exists in Master by normalizedName or aliases
        let skillMaster = await Skill.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${unresolvedSkill.normalizedName}$`, 'i') } },
                { aliases: { $regex: new RegExp(`^${unresolvedSkill.normalizedName}$`, 'i') } },
                { name: { $regex: new RegExp(`^${unresolvedSkill.rawName}$`, 'i') } }
            ]
        });

        // If it doesn't exist, create it
        if (!skillMaster) {
            skillMaster = new Skill({
                name: unresolvedSkill.normalizedName,
                aliases: [unresolvedSkill.rawName],
                category: 'Uncategorized' // Admin can update this later
            });
            await skillMaster.save();
        } else {
            // Add rawName to aliases if not already there
            if (!skillMaster.aliases.some(alias => alias.toLowerCase() === unresolvedSkill.rawName.toLowerCase()) && 
                skillMaster.name.toLowerCase() !== unresolvedSkill.rawName.toLowerCase()) {
                skillMaster.aliases.push(unresolvedSkill.rawName);
                await skillMaster.save();
            }
        }

        // Mark UnresolvedSkill as reviewed
        unresolvedSkill.status = 'reviewed';
        await unresolvedSkill.save();

        // Create JobSkill mapping if the job still exists and isn't already mapped
        if (unresolvedSkill.jobId) {
            const existingJobSkill = await JobSkill.findOne({
                jobId: unresolvedSkill.jobId,
                skillId: skillMaster._id
            });

            if (!existingJobSkill) {
                await JobSkill.create({
                    jobId: unresolvedSkill.jobId,
                    skillId: skillMaster._id,
                    extractedViaAI: true
                });
            }
        }

        res.json({
            success: true,
            message: 'Skill approved and added to Master',
            skill: skillMaster
        });

    } catch (error) {
        console.error('Error approving skill:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reject an unresolved skill
// @route   POST /api/government-admin/intelligence/unresolved-skills/:id/reject
// @access  Admin
export const rejectSkill = async (req, res) => {
    try {
        const { id } = req.params;

        const unresolvedSkill = await UnresolvedSkill.findById(id);

        if (!unresolvedSkill) {
            return res.status(404).json({ success: false, message: 'Unresolved Skill not found' });
        }

        if (unresolvedSkill.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Skill already ${unresolvedSkill.status}` });
        }

        unresolvedSkill.status = 'rejected';
        await unresolvedSkill.save();

        res.json({
            success: true,
            message: 'Skill rejected successfully'
        });

    } catch (error) {
        console.error('Error rejecting skill:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
