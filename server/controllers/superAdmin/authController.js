import SuperAdmin from '../../models/SuperAdmin.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    return { accessToken, refreshToken };
};

// @desc    Auth super admin & get token
// @route   POST /api/super-admin/auth/login
// @access  Public
export const authSuperAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const superAdmin = await SuperAdmin.findOne({ email });

        if (superAdmin && (await superAdmin.matchPassword(password))) {
            const { accessToken, refreshToken } = generateToken(superAdmin._id);
            
            // Save refresh token to DB
            superAdmin.refreshTokens = superAdmin.refreshTokens || [];
            superAdmin.refreshTokens.push(refreshToken);
            await superAdmin.save();

            // Send refresh token in HttpOnly cookie
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                _id: superAdmin._id,
                name: superAdmin.name,
                email: superAdmin.email,
                token: accessToken,
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

// @desc    Refresh super admin token
// @route   POST /api/super-admin/auth/refresh
// @access  Public
export const refreshSuperAdminToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) return res.status(401).json({ message: 'Unauthorized - No Refresh Token' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const superAdmin = await SuperAdmin.findById(decoded.id);

        if (!superAdmin || !superAdmin.refreshTokens.includes(refreshToken)) {
            return res.status(401).json({ message: 'Unauthorized - Invalid Refresh Token' });
        }

        const accessToken = jwt.sign({ id: superAdmin._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ token: accessToken });
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized - Token Expired or Invalid' });
    }
};
