import Lecture from '../../models/Lecture.js';
import Course from '../../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import { getIO } from '../../config/socket.js';

export const getCloudinarySignature = async (req, res) => {
    try {
        const timestamp = Math.round((new Date).getTime() / 1000);
        
        // Optional: you can define a specific folder or eager transformations
        const paramsToSign = {
            timestamp: timestamp,
            folder: 'jobportal_lectures'
        };

        const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_SECRET_KEY.trim());

        res.json({
            success: true,
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_NAME.trim(),
            apiKey: process.env.CLOUDINARY_API_KEY.trim()
        });
    } catch (error) {
        console.error("Signature Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate signature' });
    }
};

export const getCourseLectures = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        // Ensure course belongs to institute
        const course = await Course.findOne({ _id: courseId, instituteId: req.institute._id });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
        }

        const lectures = await Lecture.find({ courseId }).sort({ lectureNumber: 1 });
        res.json({ success: true, lectures });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching lectures' });
    }
};

export const addLecture = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, lectureNumber, type, duration, status, video } = req.body;

        // Validation
        if (duration > 20) {
            return res.status(400).json({ success: false, message: 'Lecture duration cannot exceed 20 minutes' });
        }

        const course = await Course.findOne({ _id: courseId, instituteId: req.institute._id });
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found or unauthorized' });
        }

        const lecture = new Lecture({
            instituteId: req.institute._id,
            courseId,
            lectureNumber,
            title,
            description,
            type,
            duration,
            status,
            video
        });

        await lecture.save();

        // Emit socket event if socket.io is initialized
        try {
            const io = getIO();
            if (io) {
                // Emit to a specific course room or globally (better to use rooms if implemented, else global with courseId)
                io.emit('lecture:created', { courseId, lecture });
            }
        } catch (e) {
            // Ignore socket errors to prevent breaking the main flow
            console.error("Socket error on lecture create:", e.message);
        }

        res.status(201).json({ success: true, lecture, message: 'Lecture added successfully' });
    } catch (error) {
        console.error("Add lecture error:", error);
        res.status(500).json({ success: false, message: 'Server error adding lecture' });
    }
};

export const updateLecture = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const { title, description, lectureNumber, type, duration, status, video } = req.body;

        if (duration > 20) {
            return res.status(400).json({ success: false, message: 'Lecture duration cannot exceed 20 minutes' });
        }

        const lecture = await Lecture.findOne({ _id: lectureId, courseId, instituteId: req.institute._id });
        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        lecture.title = title || lecture.title;
        lecture.description = description !== undefined ? description : lecture.description;
        lecture.lectureNumber = lectureNumber || lecture.lectureNumber;
        lecture.type = type || lecture.type;
        lecture.duration = duration || lecture.duration;
        lecture.status = status || lecture.status;
        
        if (video) {
            lecture.video = video;
        }

        await lecture.save();

        try {
            const io = getIO();
            if (io) io.emit('lecture:updated', { courseId, lecture });
        } catch (e) {}

        res.json({ success: true, lecture, message: 'Lecture updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error updating lecture' });
    }
};

export const deleteLecture = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;

        const lecture = await Lecture.findOne({ _id: lectureId, courseId, instituteId: req.institute._id });
        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        if (lecture.video?.publicId) {
            try {
                await cloudinary.uploader.destroy(lecture.video.publicId, { resource_type: lecture.video.resourceType || 'video' });
            } catch (e) {
                console.error("Cloudinary delete error:", e);
                // Continue deletion even if cloudinary fails
            }
        }

        await lecture.deleteOne();

        try {
            const io = getIO();
            if (io) io.emit('lecture:deleted', { courseId, lectureId });
        } catch (e) {}

        res.json({ success: true, message: 'Lecture deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error deleting lecture' });
    }
};
