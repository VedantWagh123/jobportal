import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const TrainingInstitute = mongoose.model('TrainingInstitute', new mongoose.Schema({ name: String, districtId: String }));
        
        const institutes = await TrainingInstitute.find().lean();
        console.log(JSON.stringify(institutes, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDb();
