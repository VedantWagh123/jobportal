import jwt from 'jsonwebtoken';
import GovernmentAdmin from '../models/GovernmentAdmin.js';

// Middleware to protect Government Admin Routes
export const protectAdmin = async (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.json({ success: false, message: 'Not authorized, please login' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify the token belongs to an admin role
        if (decoded.role !== 'government_admin') {
            return res.json({ success: false, message: 'Not authorized for this role' });
        }

        const admin = await GovernmentAdmin.findById(decoded.id).select('-passwordHash');

        if (!admin) {
            return res.json({ success: false, message: 'Admin not found' });
        }

        if (!admin.isActive) {
            return res.json({ success: false, message: 'Admin account is inactive' });
        }

        req.admin = admin;
        next();

    } catch (error) {
        res.json({ success: false, message: 'Token failed or expired' });
    }
};
