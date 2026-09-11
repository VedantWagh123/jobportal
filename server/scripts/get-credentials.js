import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.js';
import Company from './models/Company.js';
import TrainingInstitute from './models/TrainingInstitute.js';
import SuperAdmin from './models/SuperAdmin.js';
import GovernmentAdmin from './models/GovernmentAdmin.js';

const fetchCredentials = async () => {
    await connectDB();
    
    console.log('\n--- 🔑 SUPER ADMIN PORTAL (Port 5174) ---');
    const superAdmin = await SuperAdmin.findOne();
    if (superAdmin) {
        console.log(`Email: ${superAdmin.email}`);
        console.log(`Password: (Hashed, try default: admin123 or check seedAdmin.js)`);
    } else {
        console.log('No Super Admin found');
    }

    console.log('\n--- 🏛️ STATE GOVT PORTAL (Port 5175) ---');
    const stateAdmin = await GovernmentAdmin.findOne();
    if (stateAdmin) {
        console.log(`Email: ${stateAdmin.email}`);
        console.log(`Password: (Hashed, try default: admin123 or check seedAdmin.js)`);
    } else {
        console.log('No State Admin found');
    }

    console.log('\n--- 🎓 TRAINING INSTITUTE PORTAL (Port 5176) ---');
    const institute = await TrainingInstitute.findOne({ isApproved: true });
    if (institute) {
        console.log(`Email: ${institute.email}`);
        console.log(`Password: (Hashed, try default password used during registration)`);
        console.log(`(Note: You can register a new one and then approve it via Super Admin)`);
    } else {
        console.log('No Approved Institute found');
    }

    console.log('\n--- 🏢 COMPANY / HR LOGIN (Job Portal - Port 5173 -> Recruiter Login) ---');
    const company = await Company.findOne();
    if (company) {
        console.log(`Email: ${company.email}`);
        console.log(`Password: (Hashed, try default used during registration)`);
    } else {
        console.log('No Company found');
    }

    console.log('\n--- 👨‍🎓 STUDENT / CANDIDATE (Job Portal - Port 5173) ---');
    console.log(`Students use Clerk Authentication (Google Login / Email OTP).`);
    console.log(`Just click on "Candidate Login" in Navbar and use your Google Account.`);
    
    console.log('\n----------------------------------------\n');
    process.exit(0);
};

fetchCredentials();
