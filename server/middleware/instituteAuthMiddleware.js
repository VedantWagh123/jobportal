import jwt from 'jsonwebtoken';
import TrainingInstitute from '../models/TrainingInstitute.js';

export const protectInstitute = async (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'institute') {
            return res.status(403).json({ success: false, message: 'Not authorized as an institute' });
        }

        const institute = await TrainingInstitute.findById(decoded.id).select('-password');

        if (!institute) {
            return res.status(404).json({ success: false, message: 'Institute not found' });
        }

        req.institute = institute;
        next();

    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};
