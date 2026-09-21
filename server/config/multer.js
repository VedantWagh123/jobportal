import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads', { recursive: true });
        }
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allowed file types (Images and Resumes)
    const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/jpg', 
        'image/webp',
        'image/svg+xml',
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Security Error: Invalid file type (${file.mimetype}). Only Images (JPG, PNG, WebP) and Resumes (PDF, DOC) are allowed.`), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB max size
    }
});

export default upload;