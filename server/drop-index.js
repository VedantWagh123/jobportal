import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from './config/db.js';

const dropIndex = async () => {
    await connectDB();
    try {
        const db = mongoose.connection.db;
        await db.collection('employerfeedbacks').dropIndex('employerId_1_candidateId_1_courseId_1');
        console.log('Old index dropped successfully');
    } catch (e) {
        console.error('Error dropping index or it doesn\'t exist', e.message);
    }
    
    try {
        const db = mongoose.connection.db;
        await db.collection('employerfeedbacks').dropIndex('applicationId_1');
        console.log('Old applicationId index dropped successfully');
    } catch(e) {
         console.error('Error dropping applicationId index or it doesn\'t exist', e.message);
    }
    
    process.exit(0);
};

dropIndex();
