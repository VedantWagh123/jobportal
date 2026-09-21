import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../server/.env' });

const instituteSchema = new mongoose.Schema({}, { strict: false });
const TrainingInstitute = mongoose.model('TrainingInstitute', instituteSchema, 'traininginstitutes');

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");
    
    const institutes = await TrainingInstitute.find({}, { email: 1, name: 1 });
    console.log("Existing Institutes:", institutes);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkDb();
