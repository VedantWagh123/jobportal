import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';

export const protectSuperAdmin = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.superAdmin = await SuperAdmin.findById(decoded.id).select('-password');

            if (!req.superAdmin) {
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
