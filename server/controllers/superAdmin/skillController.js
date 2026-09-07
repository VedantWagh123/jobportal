import UnresolvedSkill from '../../models/UnresolvedSkill.js';
import Skill from '../../models/Skill.js';

// @desc    Get all unresolved skills
// @route   GET /api/super-admin/skills/unresolved
// @access  Private/SuperAdmin
export const getUnresolvedSkills = async (req, res) => {
    try {
        const skills = await UnresolvedSkill.find().sort({ frequency: -1 });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all Master Canonical Skills
// @route   GET /api/super-admin/skills/master
// @access  Private/SuperAdmin
export const getAllMasterSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve an unresolved skill as a canonical skill
// @route   POST /api/super-admin/skills/unresolved/:id/approve
// @access  Private/SuperAdmin
export const approveSkill = async (req, res) => {
    try {
        const unresolved = await UnresolvedSkill.findById(req.params.id);
        
        if (!unresolved) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        // Check if skill already exists in canonical list (case-insensitive)
        let skill = await Skill.findOne({ name: { $regex: new RegExp('^' + unresolved.normalizedName + '$', 'i') } });
        
        if (!skill) {
            skill = await Skill.create({
                name: unresolved.normalizedName,
                category: req.body.category || 'Other',
                description: `Added from AI extraction on ${new Date().toISOString()}`
            });
        }

        // Add raw name to aliases if it's not already there
        if (!skill.aliases) {
            skill.aliases = [];
        }
        if (!skill.aliases.includes(unresolved.rawName)) {
            skill.aliases.push(unresolved.rawName);
            await skill.save();
        }

        // Delete from unresolved list
        await UnresolvedSkill.findByIdAndDelete(req.params.id);

        res.json({ message: 'Skill approved and added to master list', skill });
    } catch (error) {
        console.error("Skill Approve Error:", error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Reject/Delete an unresolved skill
// @route   DELETE /api/super-admin/skills/unresolved/:id
// @access  Private/SuperAdmin
export const rejectSkill = async (req, res) => {
    try {
        const skill = await UnresolvedSkill.findByIdAndDelete(req.params.id);
        
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        res.json({ message: 'Skill rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
