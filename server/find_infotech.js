import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Company from './models/Company.js';
import bcrypt from 'bcrypt';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const hashedPassword = await bcrypt.hash('Vedant123', 10);
    await Company.updateMany({}, { password: hashedPassword });
    console.log('All company passwords reset to Vedant123');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
