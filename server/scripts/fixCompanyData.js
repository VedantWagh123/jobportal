import 'dotenv/config';
import connectDB from './config/db.js';
import Job from './models/Job.js';
import JobApplication from './models/JobApplication.js';
import Company from './models/Company.js';

const fixData = async () => {
    try {
        await connectDB();
        
        // Find the first company (usually the one the user created)
        const firstCompany = await Company.findOne({ name: 'infotech' });
        if (!firstCompany) {
            console.log("Could not find infotech company");
            process.exit(1);
        }
        
        const companyId = firstCompany._id;
        
        // Update all jobs to belong to this company
        const resultJobs = await Job.updateMany({}, { companyId: companyId });
        console.log(`Assigned ${resultJobs.modifiedCount} jobs to ${firstCompany.name}`);
        
        // Update all job applications to belong to this company
        const resultApps = await JobApplication.updateMany({}, { companyId: companyId });
        console.log(`Assigned ${resultApps.modifiedCount} applications to ${firstCompany.name}`);
        
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

fixData();
