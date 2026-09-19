import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const District = mongoose.model('District', new mongoose.Schema({ name: String, state: String }));
        
        const districts = await District.find().lean();
        console.log(JSON.stringify(districts, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDb();
