import TrainingInstitute from '../../models/TrainingInstitute.js';
import District from '../../models/District.js';
import InstituteNotification from '../../models/InstituteNotification.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

const generateToken = (id) => {
    return jwt.sign({ id, role: 'institute' }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const registerInstitute = async (req, res) => {
    const { name, email, password, districtId, type, accreditation } = req.body;

    try {
        const instituteExists = await TrainingInstitute.findOne({ email });
        if (instituteExists) {
            return res.status(400).json({ success: false, message: 'Institute with this email already exists' });
        }

        const institute = await TrainingInstitute.create({
            name, email, password, districtId, type, accreditation
        });

        if (institute) {
            res.status(201).json({
                success: true,
                institute: { _id: institute._id, name: institute.name, email: institute.email, type: institute.type },
                token: generateToken(institute._id)
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
            res.json({
                success: true,
                institute: { _id: institute._id, name: institute.name, email: institute.email, type: institute.type, districtId: institute.districtId, image: institute.image },
                token: generateToken(institute._id)
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
