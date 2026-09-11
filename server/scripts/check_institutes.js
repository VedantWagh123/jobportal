import mongoose from 'mongoose';
import 'dotenv/config'; // Make sure to load env
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';
mongoose.connect(uri).then(async () => {
    const institutes = await mongoose.connection.db.collection('traininginstitutes').find({}).toArray();
    console.log('Total institutes:', institutes.length);
    for (const inst of institutes) {
        let districtName = 'None';
        let districtState = 'None';
        if (inst.districtId) {
            const d = await mongoose.connection.db.collection('districts').findOne({ _id: inst.districtId });
            if (d) {
                districtName = d.name;
                districtState = d.state;
            }
        }
        console.log(`- ${inst.name}: District: ${districtName} (${districtState})`);
    }
    process.exit(0);
});
