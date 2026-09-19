import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';

export const protectSuperAdmin = async (req, res, next) => {
    // Accept both Authorization: Bearer <token> and token: <token> header formats
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.token) {
        token = req.headers.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.superAdmin = await SuperAdmin.findById(decoded.id).select('-password');

        if (!req.superAdmin) {
            return res.status(401).json({ success: false, message: 'Not authorized, admin not found' });
        }

        next();
    } catch (error) {
        console.error('SuperAdmin Auth Error:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};
