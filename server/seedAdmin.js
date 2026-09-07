import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import SuperAdmin from './models/SuperAdmin.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();
        
        const existingAdmin = await SuperAdmin.findOne({ email: 'admin@platform.gov' });
        
        if (existingAdmin) {
            console.log('Admin already exists!');
            process.exit(0);
        }

        const admin = await SuperAdmin.create({
            name: 'System Administrator',
            email: 'admin@platform.gov',
            password: 'password123'
        });

        console.log('Super Admin Created successfully!');
        console.log('Email: admin@platform.gov');
        console.log('Password: password123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
