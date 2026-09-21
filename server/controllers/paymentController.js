import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret'
});

// Create One-Time Order for Premium Plan (₹10)
export const createPremiumOrder = async (req, res) => {
    try {
        const userId = req.auth.userId; // Assuming Clerk middleware sets req.auth
        
        if (!userId) {
            return res.json({ success: false, message: 'Unauthorized' });
        }

        const options = {
            amount: 10 * 100, // ₹10 in paise
            currency: 'INR',
            receipt: `receipt_${userId}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        res.json({ success: true, order });
    } catch (error) {
        console.error('Error creating premium order:', error);
        res.json({ success: false, message: 'Failed to create order' });
    }
};

// Create Subscription for Free Plan (Trial)
export const createFreeSubscription = async (req, res) => {
    try {
        const userId = req.auth.userId;
        
        if (!userId) {
            return res.json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Check if user already has an active subscription
        if (user.subscriptionId) {
            return res.json({ success: false, message: 'User already has a subscription' });
        }

        // Ensure you have a plan ID from your Razorpay dashboard set in env
        const planId = process.env.RAZORPAY_PLAN_ID;
        
        if (!planId) {
            // Dummy response if plan ID is not set
            return res.json({ success: false, message: 'Razorpay Plan ID not configured in server env' });
        }

        // Create subscription with a 30 day trial
        // 30 days from now in UNIX timestamp
        const startAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

        const options = {
            plan_id: planId,
            customer_notify: 1,
            total_count: 120, // max billing cycles (e.g., 10 years)
            start_at: startAt,
            notes: {
                userId: userId
            }
        };

        const subscription = await razorpay.subscriptions.create(options);
        
        res.json({ success: true, subscription });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.json({ success: false, message: 'Failed to create subscription' });
    }
};

// Verify Payment Signature
export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            razorpay_subscription_id 
        } = req.body;
        
        const userId = req.auth.userId;

        let body = '';

        if (razorpay_subscription_id) {
             // Verification for Subscription
             body = razorpay_payment_id + "|" + razorpay_subscription_id;
        } else if (razorpay_order_id) {
             // Verification for Order
             body = razorpay_order_id + "|" + razorpay_payment_id;
        } else {
             return res.json({ success: false, message: 'Invalid payment details' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is verified
            const user = await User.findById(userId);
            
            if (user) {
                user.isPremium = true;
                if (razorpay_subscription_id) {
                    user.subscriptionId = razorpay_subscription_id;
                }
                await user.save();
                return res.json({ success: true, message: 'Payment verified successfully' });
            }
            return res.json({ success: false, message: 'User not found' });
            
        } else {
            return res.json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.json({ success: false, message: 'Payment verification failed' });
    }
};

// Webhook to handle recurring payments
export const razorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';
        const signature = req.headers['x-razorpay-signature'];
        
        const body = JSON.stringify(req.body);
        
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');
            
        if (expectedSignature === signature) {
            // Process events
            const event = req.body.event;
            const payload = req.body.payload;
            
            if (event === 'subscription.charged') {
                const subscriptionId = payload.subscription.entity.id;
                // Find user and ensure premium is true
                await User.findOneAndUpdate({ subscriptionId: subscriptionId }, { isPremium: true });
            } else if (event === 'subscription.halted' || event === 'subscription.cancelled') {
                const subscriptionId = payload.subscription.entity.id;
                // Revoke premium access if subscription fails/cancelled
                await User.findOneAndUpdate({ subscriptionId: subscriptionId }, { isPremium: false });
            }
            
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false });
    }
};
