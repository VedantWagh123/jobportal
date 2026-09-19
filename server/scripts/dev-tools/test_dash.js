import mongoose from 'mongoose';
import Course from './models/Course.js';
import Batch from './models/Batch.js';
import Enrollment from './models/Enrollment.js';
import JobApplication from './models/JobApplication.js';

// Load environment variables for the standalone script
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const instituteId = '6a9c1735a0864030c45b3524'; // Khamza institute ID
    
    const liveBatches = await Batch.find({ instituteId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('courseId', 'name')
        .populate('trainerId', 'name');
    console.log('LIVE BATCHES:', liveBatches.length);

    const batches = await Batch.find({ instituteId }, '_id');
    const batchIds = batches.map(b => b._id);
    
    const placementDataMap = new Map();
    const allInstituteCourses = await Course.find({ instituteId });
    allInstituteCourses.forEach(c => {
        placementDataMap.set(c._id.toString(), { name: c.name, enrolled: 0, placed: 0 });
    });

    const allEnrollments = await Enrollment.find({ batchId: { $in: batchIds } }).populate('batchId');
    const userIds = [...new Set(allEnrollments.map(e => e.userId))];
    const userApplications = await JobApplication.find({ userId: { $in: userIds } });

    const userAppMap = new Map();
    userApplications.forEach(app => {
        if (!userAppMap.has(app.userId)) userAppMap.set(app.userId, []);
        userAppMap.get(app.userId).push(app);
    });

    allEnrollments.forEach(enrollment => {
        if (enrollment.batchId && enrollment.batchId.courseId) {
            const courseIdStr = enrollment.batchId.courseId.toString();
            if (placementDataMap.has(courseIdStr)) {
                const data = placementDataMap.get(courseIdStr);
                data.enrolled += 1;
                const apps = userAppMap.get(enrollment.userId) || [];
                const isPlaced = apps.some(app => app.status === 'Hired');
                if (isPlaced) {
                    data.placed += 1;
                }
            }
        }
    });

    let placementData = Array.from(placementDataMap.values()).filter(d => d.enrolled > 0);
    if (placementData.length === 0) {
        placementData = Array.from(placementDataMap.values()).slice(0, 5);
    }
    
    console.log('PLACEMENT DATA:', placementData);

    process.exit();
}).catch(console.error);
