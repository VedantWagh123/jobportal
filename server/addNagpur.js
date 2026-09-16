
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import District from './models/District.js';

(async () => {
    try {
        await connectDB();
        await District.findOneAndUpdate(
            { name: 'Nagpur', state: 'Maharashtra' },
            { name: 'Nagpur', state: 'Maharashtra', country: 'India' },
            { upsert: true, new: true }
        );
        console.log('Nagpur inserted/updated in job-portal DB');
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
})();

