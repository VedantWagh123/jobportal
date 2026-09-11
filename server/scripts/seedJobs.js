import 'dotenv/config';
import connectDB from './config/db.js';
import Company from './models/Company.js';
import Job from './models/Job.js';
import bcrypt from 'bcrypt';

const seedJobs = async () => {
    try {
        await connectDB();
        console.log("Connected to DB, starting seed...");

        // Create 2 mock companies if they don't exist
        const companiesData = [
            { name: 'TCS', email: 'hr@tcs.com', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg', password: 'password123' },
            { name: 'Infosys', email: 'hr@infosys.com', image: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg', password: 'password123' },
            { name: 'Reliance', email: 'hr@reliance.com', image: 'https://upload.wikimedia.org/wikipedia/en/9/99/Reliance_Industries_Logo.svg', password: 'password123' }
        ];

        const companies = [];
        for (let cd of companiesData) {
            let company = await Company.findOne({ email: cd.email });
            if (!company) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(cd.password, salt);
                company = await Company.create({ ...cd, password: hashedPassword });
                console.log(`Created company: ${cd.name}`);
            }
            companies.push(company);
        }

        const jobTitles = [
            "Software Engineer", "Data Analyst", "Welder", "Electrician", "Customer Support Executive",
            "Plumber", "Frontend Developer", "Backend Developer", "Sales Manager", "Marketing Executive",
            "Graphic Designer", "Mechanical Engineer", "Civil Engineer", "Accountant", "HR Executive",
            "Data Entry Operator", "Delivery Partner", "Nurse", "Pharmacist", "Security Guard"
        ];
        
        const categories = ["IT", "Construction", "Healthcare", "Sales", "Manufacturing"];
        const levels = ["Beginner level", "Intermediate level", "Senior level"];
        const locations = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"];

        for (let i = 0; i < 20; i++) {
            const randomCompany = companies[Math.floor(Math.random() * companies.length)];
            
            const jobData = {
                title: jobTitles[i],
                description: `<p>We are looking for a skilled ${jobTitles[i]} to join our growing team. This is a great opportunity to build your career with a leading company.</p>`,
                location: locations[Math.floor(Math.random() * locations.length)],
                category: categories[Math.floor(Math.random() * categories.length)],
                level: levels[Math.floor(Math.random() * levels.length)],
                salary: Math.floor(Math.random() * 50000) + 15000,
                date: Date.now(),
                visible: true,
                companyId: randomCompany._id
            };

            await Job.create(jobData);
            console.log(`Created job: ${jobTitles[i]}`);
        }

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding jobs:", error);
        process.exit(1);
    }
};

seedJobs();
