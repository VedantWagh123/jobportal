const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI + '/job-portal').then(async () => {
    const skills = await mongoose.connection.collection('skills').find({ name: { $in: ['indexing', 'queries', 'mongodb', 'transactions', 'normalization'] } }).toArray();
    console.log('Skills:', JSON.stringify(skills, null, 2));

    const skillIds = skills.map(s => s._id);
    const jobskills = await mongoose.connection.collection('jobskills').find({ skillId: { $in: skillIds } }).toArray();
    console.log('JobSkills Count:', jobskills.length);
    console.log('JobSkills:', JSON.stringify(jobskills, null, 2));

    const jobIds = jobskills.map(js => js.jobId);
    const jobs = await mongoose.connection.collection('jobs').find({ _id: { $in: jobIds } }).toArray();
    console.log('Jobs with these skills:', JSON.stringify(jobs, null, 2));
    
    // Check all jobs total vacancies
    const allJobs = await mongoose.connection.collection('jobs').find({}).toArray();
    const totalVacancies = allJobs.reduce((sum, j) => sum + (j.vacancies || 1), 0);
    console.log('Total Vacancies across all jobs:', totalVacancies);
    
    process.exit(0);
});
