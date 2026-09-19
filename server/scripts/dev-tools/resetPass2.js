
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import GovernmentAdmin from './models/GovernmentAdmin.js';
import bcrypt from 'bcryptjs';

(async () => {
    try {
        await connectDB();
        
        await GovernmentAdmin.deleteOne({ email: 'maharashtra.govt@gov.in' });
        console.log('Deleted duplicate account.');

        const newPassword = process.env.DEFAULT_PASSWORD || 'ChangeMe123!';
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await GovernmentAdmin.updateOne(
            { email: 'mhgovt@gmail.com' },
            { $set: { passwordHash: hashedPassword } }
        );
        console.log('passwordHash reset for mhgovt@gmail.com in job-portal DB');
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
})();

