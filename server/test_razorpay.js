import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret'
});

async function testSubscription() {
    try {
        const planId = process.env.RAZORPAY_PLAN_ID;
        console.log("Using Plan ID:", planId);

        const startAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

        const options = {
            plan_id: planId,
            customer_notify: 1,
            total_count: 120, 
            start_at: startAt,
            notes: {
                userId: "test_user_123"
            }
        };

        const subscription = await razorpay.subscriptions.create(options);
        console.log("Success! Subscription:", subscription);
    } catch (error) {
        console.error("Razorpay API Error:", JSON.stringify(error, null, 2));
    }
}

testSubscription();
