import mongoose from 'mongoose';
import dotenv from 'dotenv';
import JobSkill from './models/JobSkill.js';
import connectDB from './config/db.js';

dotenv.config();

const test = async () => {
    try {
        await connectDB();
        
        const res = await JobSkill.aggregate([
            { $group: { _id: '$skillId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
            { $lookup: { from: 'skills', localField: '_id', foreignField: '_id', as: 'skill' } },
            { $unwind: '$skill' },
            { $project: { _id: 0, skillId: '$_id', name: '$skill.name', category: '$skill.category', count: 1 } }
        ]);
        console.log(res);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

test();
