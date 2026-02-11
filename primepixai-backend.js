// ============================================
// BACKEND SERVER EXAMPLE FOR STRIPE PAYMENTS
// ============================================
// This is a simple Node.js/Express server example
// You can deploy this to Vercel, Netlify, Railway, or Render for FREE

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from your website

// Configure file upload (for customer photos)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ============================================
// ENDPOINT: Create Payment Intent
// ============================================
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, packageName, customerEmail, customerName, rushService } = req.body;

        // Create a PaymentIntent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: 'usd',
            metadata: {
                package: packageName,
                customerEmail: customerEmail,
                customerName: customerName,
                rushService: rushService ? 'Yes' : 'No'
            },
            receipt_email: customerEmail
        });

        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// ENDPOINT: Handle Photo Upload & Order Confirmation
// ============================================
app.post('/process-order', upload.single('photo'), async (req, res) => {
    try {
        const { email, name, packageName, rushService, paymentIntentId } = req.body;
        const photo = req.file;

        // Verify payment was successful
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        // Here you would:
        // 1. Save the photo to cloud storage (AWS S3, Cloudinary, etc.)
        // 2. Add order to your database
        // 3. Send confirmation email to customer
        // 4. Notify yourself of new order

        // Example: Send confirmation email
        await sendConfirmationEmail(email, name, packageName, rushService);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENDPOINT: Stripe Webhook (handles payment events)
// ============================================
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET';

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment successful:', paymentIntent.id);
            // Send order processing notification
            break;
        case 'payment_intent.payment_failed':
            console.log('Payment failed');
            break;
    }

    res.json({received: true});
});

// ============================================
// HELPER: Send Confirmation Email
// ============================================
async function sendConfirmationEmail(email, name, packageName, rushService) {
    // Configure your email service (Gmail, SendGrid, Mailgun, etc.)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-app-password' // Use app-specific password
        }
    });

    const mailOptions = {
        from: 'PrimePix AI <hello@primepixai.com>',
        to: email,
        subject: `Order Confirmed - ${packageName}`,
        html: `
            <h2>Thank you for your order, ${name}!</h2>
            <p>We've received your order for <strong>${packageName}</strong>.</p>
            <p><strong>Rush Service:</strong> ${rushService ? 'Yes (24-hour turnaround)' : 'No (Standard delivery)'}</p>
            <p>We'll begin processing your AI-generated images and will send them to this email within the specified timeframe.</p>
            <p>Remember: You have up to 2 free edits to ensure your satisfaction!</p>
            <hr>
            <p><em>Questions? Reply to this email or contact us at hello@primepixai.com</em></p>
        `
    };

    await transporter.sendMail(mailOptions);
}

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ============================================
// DEPLOYMENT INSTRUCTIONS:
// ============================================
/*
1. Install dependencies:
   npm install express stripe cors multer nodemailer

2. Add your Stripe SECRET key (starts with sk_test_...)
   Get it from: https://dashboard.stripe.com/test/apikeys

3. Deploy to free hosting:
   - Vercel: npm i -g vercel && vercel
   - Railway: railway.app (connect GitHub)
   - Render: render.com (free tier)
   - Netlify Functions: netlify.com

4. Update your website's JavaScript to use your server URL:
   Replace 'YOUR_SERVER_URL' with your actual server address

5. Set up Stripe webhook:
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Add endpoint: https://YOUR_SERVER_URL/webhook
   - Select events: payment_intent.succeeded, payment_intent.payment_failed
   - Copy webhook secret and add it to code above

6. Configure email service:
   - Use Gmail, SendGrid, or Mailgun
   - Add credentials in sendConfirmationEmail function
*/
