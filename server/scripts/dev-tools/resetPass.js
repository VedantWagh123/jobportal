
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import mongoose from 'mongoose';
import GovernmentAdmin from './models/GovernmentAdmin.js';
import bcrypt from 'bcryptjs';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const newPassword = process.env.DEFAULT_PASSWORD || 'ChangeMe123!';
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await GovernmentAdmin.updateOne(
            { email: 'mhgovt@gmail.com' },
            { $set: { passwordHash: hashedPassword } }
        );
        console.log('passwordHash reset for mhgovt@gmail.com');
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
});

