import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Job from './models/Job.js';
import Skill from './models/Skill.js';
import JobSkill from './models/JobSkill.js';

mongoose.connect(`${process.env.MONGODB_URI}/job-portal`)
  .then(async () => {
    try {
      const jobs = await Job.find({});
      console.log('Available Jobs:', jobs.map(j => j.title));
      
      const job = jobs.find(j => j.title.includes('Generative AI'));
      if (!job) {
        console.log('Generative AI Job not found');
        process.exit(1);
      }
      console.log('Found Job:', job.title, job._id);

      const skillNames = ['Python', 'Generative AI', 'LLMs', 'LangChain', 'Prompt Engineering', 'RAG', 'Vector Databases', 'PyTorch'];
      
      for (const name of skillNames) {
        // Find or create skill
        let skill = await Skill.findOne({ name: new RegExp('^' + name + '$', 'i') });
        if (!skill) {
          skill = await Skill.create({ name, type: 'Hard' });
          console.log('Created skill:', name);
        }
        
        // Check if job already has this skill
        const existingJobSkill = await JobSkill.findOne({ jobId: job._id, skillId: skill._id });
        if (!existingJobSkill) {
          await JobSkill.create({ jobId: job._id, skillId: skill._id, importance: 'High' });
          console.log('Linked skill to job:', name);
        } else {
            console.log('Skill already linked:', name);
        }
      }
      
      console.log('Done!');
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })
  .catch(err => console.error(err));
