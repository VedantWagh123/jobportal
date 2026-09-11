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
import intelligenceRoutes from './routes/intelligenceRoutes.js'
import { startJobProcessor } from './services/jobProcessor.js'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { notFound, errorHandler } from './middleware/errorHandler.js'


// Initialize Express
const app = express()

// Connect to database
connectDB()
await connectCloudinary()

// Middlewares

// 1. Security Headers
app.use(helmet())

// 2. Rate Limiting (100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
})
app.use('/api/', apiLimiter) // Apply to all API routes

// 3. Smart CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Client
  'http://localhost:5174', // Admin
  'http://localhost:5175', // Institute Admin
  'http://localhost:5176', // State Admin
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the explicitly allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Check for Vercel production domains dynamically
    if (/vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Reject other origins
    return callback(new Error('CORS policy violation: This origin is not allowed.'));
  },
  credentials: true, // Allow cookies if needed
};

app.use(cors(corsOptions))
app.use(express.json())
app.use(clerkMiddleware())

// Routes
app.use('/uploads', express.static('uploads'))
app.get('/', (req, res) => res.send("API Working"))
// Removed /debug-sentry as it is a security risk in production
app.post('/webhooks', clerkWebhooks)
app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/state-admin', stateAdminRoutes)
app.use('/api/institute', instituteRoutes)
app.use('/api/intelligence', intelligenceRoutes)

// Super Admin
app.use('/api/super-admin', superAdminRoutes)

// Error Handling Middlewares
app.use(notFound)
app.use(errorHandler)
// Port
const PORT = process.env.PORT || 5000

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startJobProcessor();
});