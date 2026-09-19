require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const User = require('./models/User.js').default || require('./models/User.js');
    const users = await User.find({ resume: { $exists: true, $ne: '' } });
    if (users.length > 0) {
        users.forEach(u => console.log(`User: ${u.name}, Resume: ${u.resume}`));
    } else {
        console.log("No resumes found.");
    }
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
