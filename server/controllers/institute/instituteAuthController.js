import TrainingInstitute from '../../models/TrainingInstitute.js';
import District from '../../models/District.js';
import InstituteNotification from '../../models/InstituteNotification.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { getIO } from '../../config/socket.js';
import SuperAdminNotification from '../../models/SuperAdminNotification.js';

const generateToken = (id) => {
    const accessToken = jwt.sign({ id, role: 'institute' }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ id, role: 'institute' }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    return { accessToken, refreshToken };
};

export const registerInstitute = async (req, res) => {
    let { name, email, password, districtId, type, accreditation } = req.body;

    try {
        const instituteExists = await TrainingInstitute.findOne({ email });
        if (instituteExists) {
            return res.status(400).json({ success: false, message: 'Institute with this email already exists' });
        }

        if (districtId && !districtId.match(/^[0-9a-fA-F]{24}$/)) {
            let dist = await District.findOne({ name: { $regex: new RegExp(`^${districtId.trim()}$`, 'i') } });
            if (!dist) {
                dist = await District.create({ name: districtId.trim(), state: 'Maharashtra' });
            }
            districtId = dist._id;
        }

        const institute = await TrainingInstitute.create({
            name, email, password, districtId, type, accreditation
        });

        // Notify Super Admin
        await SuperAdminNotification.create({
            type: 'New_Institute',
            title: 'New Institute Registration',
            message: `${name} has registered and is pending approval.`,
            link: '/admin/institutes'
        });

        // Emit real-time WebSockets event to Super Admin
        try {
            const io = getIO();
            io.to('super_admin_room').emit('admin_notification', { 
                message: `New institute registered: ${name}`, 
                type: 'institute' 
            });
        } catch (err) {
            console.error("Socket error:", err.message);
        }

        if (institute) {
            const { accessToken, refreshToken } = generateToken(institute._id);
            institute.refreshTokens = [refreshToken];
            await institute.save();
            
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({
                success: true,
                institute: { _id: institute._id, name: institute.name, email: institute.email, type: institute.type },
                token: accessToken
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid institute data' });
        }
    } catch (error) {
        console.error('Register Institute Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

export const loginInstitute = async (req, res) => {
    const { email, password } = req.body;

    try {
        const institute = await TrainingInstitute.findOne({ email }).populate('districtId', 'name state');

        if (institute && (await institute.matchPassword(password))) {
            if (!institute.isApproved) {
                return res.status(403).json({ success: false, message: 'Your account is pending Super Admin approval.' });
            }
            const { accessToken, refreshToken } = generateToken(institute._id);
            institute.refreshTokens = institute.refreshTokens || [];
            institute.refreshTokens.push(refreshToken);
            await institute.save();

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({
                success: true,
                institute: { _id: institute._id, name: institute.name, email: institute.email, type: institute.type, districtId: institute.districtId, image: institute.image },
                token: accessToken
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Institute Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

export const getInstituteProfile = async (req, res) => {
    try {
        const institute = await TrainingInstitute.findById(req.institute._id).select('-password').populate('districtId', 'name state');
        if (institute) {
            res.json({ success: true, institute });
        } else {
            res.status(404).json({ success: false, message: 'Institute not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};

export const updateInstituteProfile = async (req, res) => {
    try {
        const { name, phone, address, location, description } = req.body;
        
        const institute = await TrainingInstitute.findById(req.institute._id);
        if (institute) {
            institute.name = name || institute.name;
            if (phone !== undefined) institute.phone = phone;
            if (address !== undefined) institute.address = address;
            if (description !== undefined) institute.description = description;

            if (location) {
                const dist = await District.findOne({ name: { $regex: new RegExp(`^${location.trim()}$`, 'i') } });
                if (dist) {
                    institute.districtId = dist._id;
                } else {
                    return res.status(400).json({ success: false, message: `District '${location}' not found in database.` });
                }
            }

            if (req.file) {
                if (institute.image && institute.image.includes('cloudinary')) {
                    try {
                        const publicId = institute.image.split('/').slice(-1)[0].split('.')[0];
                        await cloudinary.uploader.destroy(publicId);
                    } catch (e) {
                        console.warn("Could not delete old image", e.message);
                    }
                }
                
                try {
                    const imageUpload = await cloudinary.uploader.upload(req.file.path);
                    institute.image = imageUpload.secure_url;
                } catch (error) {
                    console.warn("Cloudinary upload failed, using local file instead.", error.message);
                    institute.image = `http://localhost:5000/uploads/${req.file.filename}`;
                }
            }

            const updatedInstitute = await institute.save();

            // Create notification for profile update
            await InstituteNotification.create({
                instituteId: updatedInstitute._id,
                type: 'Success',
                title: 'Profile Updated',
                message: 'Your institute profile information was successfully updated.'
            });

            res.json({ 
                success: true, 
                message: 'Profile updated successfully',
                institute: updatedInstitute
            });
        } else {
            res.status(404).json({ success: false, message: 'Institute not found' });
        }
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};

export const getPublicDistricts = async (req, res) => {
    try {
        const districts = await District.find().select('name state').sort({ name: 1 }).lean();
        res.json({ success: true, districts });
    } catch (error) {
        console.error('Error fetching public districts:', error);
        res.status(500).json({ success: false, message: 'Server error fetching districts' });
    }
};

export const refreshInstituteToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;
        if (!refreshToken) return res.status(401).json({ success: false, message: 'Unauthorized - No Refresh Token' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const institute = await TrainingInstitute.findById(decoded.id);

        if (!institute || !institute.refreshTokens.includes(refreshToken)) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Invalid Refresh Token' });
        }

        const accessToken = jwt.sign({ id: institute._id, role: 'institute' }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ success: true, token: accessToken });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized - Token Expired or Invalid' });
    }
};
