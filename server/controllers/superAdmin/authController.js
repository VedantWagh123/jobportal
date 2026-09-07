import SuperAdmin from '../../models/SuperAdmin.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth super admin & get token
// @route   POST /api/super-admin/auth/login
// @access  Public
export const authSuperAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const superAdmin = await SuperAdmin.findOne({ email });

        if (superAdmin && (await superAdmin.matchPassword(password))) {
            res.json({
                _id: superAdmin._id,
                name: superAdmin.name,
                email: superAdmin.email,
                token: generateToken(superAdmin._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get super admin profile
// @route   GET /api/super-admin/auth/profile
// @access  Private/SuperAdmin
export const getSuperAdminProfile = async (req, res) => {
    try {
        const superAdmin = await SuperAdmin.findById(req.superAdmin._id);

        if (superAdmin) {
            res.json({
                _id: superAdmin._id,
                name: superAdmin.name,
                email: superAdmin.email,
            });
        } else {
            res.status(404).json({ message: 'Super Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
