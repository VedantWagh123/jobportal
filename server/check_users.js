import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`);
        const User = mongoose.model('User', new mongoose.Schema({ _id: String, name: String, email: String }));
        
        const users = await User.find().lean();
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDb();
