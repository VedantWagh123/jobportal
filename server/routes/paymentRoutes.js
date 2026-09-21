import express from 'express';
import { requireAuth } from '@clerk/express';
import { 
    createPremiumOrder, 
    createFreeSubscription, 
    verifyPayment, 
    razorpayWebhook 
} from '../controllers/paymentController.js';

const router = express.Router();

// Protected routes (Require User Authentication)
router.post('/create-order', requireAuth(), createPremiumOrder);
router.post('/create-subscription', requireAuth(), createFreeSubscription);
router.post('/verify-payment', requireAuth(), verifyPayment);

// Webhook route (No auth, relies on Razorpay signature verification)
// Important: Use express.raw({type: 'application/json'}) if parsing issues occur
router.post('/webhook', razorpayWebhook);

export default router;
