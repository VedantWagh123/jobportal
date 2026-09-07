import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config({ override: true })
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import stateAdminRoutes from './routes/stateAdmin/index.js'
import instituteRoutes from './routes/institute/index.js'
import { clerkMiddleware } from '@clerk/express'
import superAdminRoutes from './routes/superAdmin/index.js'


// Initialize Express
const app = express()

// Connect to database
connectDB()
await connectCloudinary()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

// Routes
app.use('/uploads', express.static('uploads'))
app.get('/', (req, res) => res.send("API Working"))
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.post('/webhooks', clerkWebhooks)
app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/state-admin', stateAdminRoutes)
app.use('/api/institute', instituteRoutes)

// Super Admin
app.use('/api/super-admin', superAdminRoutes)

// Port
const PORT = process.env.PORT || 5000

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})