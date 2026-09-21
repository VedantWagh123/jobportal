import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

let razorpayInstance = null;

const getRazorpay = () => {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret'
        });
    }
    return razorpayInstance;
};

async function testOrder() {
    try {
        const options = {
            amount: 10 * 100, // ₹10 in paise
            currency: 'INR',
            receipt: `receipt_testUser_${Date.now()}`
        };

        const order = await getRazorpay().orders.create(options);
        console.log("Success:", order);
    } catch (error) {
        console.error("Error creating premium order:", error);
        let errorMsg = 'Failed to create order';
        if (error.error && error.error.description) {
            errorMsg = error.error.description;
        } else if (error.message) {
            errorMsg = error.message;
        } else if (typeof error === 'object') {
            errorMsg = JSON.stringify(error);
        }
        console.log("ErrorMsg:", errorMsg);
    }
}

testOrder();
