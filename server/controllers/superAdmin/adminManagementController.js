import GovernmentAdmin from '../../models/GovernmentAdmin.js';
import bcrypt from 'bcryptjs';

// @desc    Get all state admins
// @route   GET /api/super-admin/admins
// @access  Private/SuperAdmin
export const getAdmins = async (req, res) => {
    try {
        const admins = await GovernmentAdmin.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching admins' });
    }
};

// @desc    Create a new state admin
// @route   POST /api/super-admin/admins
// @access  Private/SuperAdmin
export const createAdmin = async (req, res) => {
    const { name, email, password, scope } = req.body;

    try {
        const adminExists = await GovernmentAdmin.findOne({ email });

        if (adminExists) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const admin = await GovernmentAdmin.create({
            name,
            email,
            passwordHash,
            scope: scope || 'state'
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                scope: admin.scope,
                isActive: admin.isActive,
            });
        } else {
            res.status(400).json({ message: 'Invalid admin data' });
        }
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ message: 'Server error creating admin' });
    }
};

// @desc    Delete/Deactivate a state admin
// @route   DELETE /api/super-admin/admins/:id
// @access  Private/SuperAdmin
export const deleteAdmin = async (req, res) => {
    try {
        const admin = await GovernmentAdmin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await GovernmentAdmin.findByIdAndDelete(req.params.id);
        res.json({ message: 'Admin removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting admin' });
    }
};
