// 1. Load environment variables from your secure custom path
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'API Keys', 'stripe.env') });

// 2. Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// 4. Validate that the Stripe secret key was loaded before initializing Stripe.
//    dotenv silently fails if the path or format is wrong, so this guards against it.
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    console.error(
        '[Stripe] STRIPE_SECRET_KEY is missing. Check that "Back End/API Keys/stripe.env" exists and is formatted as KEY=value (no spaces around "=").'
    );
    process.exit(1);
}

// 5. Initialize Stripe using the secure secret key from your env file
const stripe = new Stripe(STRIPE_SECRET_KEY);

// 6. Test route to make sure the server is running properly
app.get('/', (_req, res) => {
    res.send('MakerPods Backend Server is running securely!');
});

// 7. Sanity-check that Stripe is reachable. Returns whether the API key is valid
//    so the front end can confirm the back end is wired up correctly.
app.get('/api/stripe/health', async (_req, res) => {
    try {
        const balance = await stripe.balance.retrieve();
        res.json({
            ok: true,
            account: balance.object === 'balance' ? 'connected' : 'unknown',
            livemode: balance.livemode,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
        });
    } catch (err) {
        console.error('[Stripe] health check failed:', err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// 8. Create a PaymentIntent for one-off charges (subscriptions, fees, etc.)
//    Body: { amount: number (in cents), currency?: string, description?: string }
app.post('/api/stripe/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', description } = req.body || {};

        if (!Number.isInteger(amount) || amount <= 0) {
            return res.status(400).json({ error: 'amount must be a positive integer (in cents)' });
        }

        const intent = await stripe.paymentIntents.create({
            amount,
            currency,
            description,
            automatic_payment_methods: { enabled: true },
        });

        res.json({
            clientSecret: intent.client_secret,
            paymentIntentId: intent.id,
        });
    } catch (err) {
        console.error('[Stripe] create-payment-intent failed:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 9. Create a Stripe Checkout Session for subscriptions / hosted checkout.
//    Body: { priceId?: string, planName?: string, amount?: number, currency?: string, successUrl: string, cancelUrl: string }
app.post('/api/stripe/create-checkout-session', async (req, res) => {
    try {
        const {
            priceId,
            planName = 'MakerPods Subscription',
            amount,
            currency = 'usd',
            successUrl,
            cancelUrl,
        } = req.body || {};

        if (!successUrl || !cancelUrl) {
            return res.status(400).json({ error: 'successUrl and cancelUrl are required' });
        }

        let line_items;
        if (priceId) {
            line_items = [{ price: priceId, quantity: 1 }];
        } else if (Number.isInteger(amount) && amount > 0) {
            line_items = [{
                price_data: {
                    currency,
                    product_data: { name: planName },
                    unit_amount: amount,
                    recurring: { interval: 'month' },
                },
                quantity: 1,
            }];
        } else {
            return res.status(400).json({ error: 'Either priceId or amount (in cents) is required' });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items,
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        console.error('[Stripe] create-checkout-session failed:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 10. Webhook endpoint for Stripe events. Configure your Stripe dashboard to
//     POST to /api/stripe/webhook and forward the signing secret via
//     STRIPE_WEBHOOK_SECRET in stripe.env.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            // No secret configured — accept the payload as-is (development only).
            event = JSON.parse(req.body.toString('utf8'));
        }
    } catch (err) {
        console.error('[Stripe] webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('[Stripe] webhook event received:', event.type);
    res.json({ received: true });
});

// 11. Start listening for requests
app.listen(PORT, () => {
    console.log(`MakerPods server is active and listening on port ${PORT}`);
    console.log(`[Stripe] connected with publishable key ${process.env.STRIPE_PUBLISHABLE_KEY || '(missing)'}`);
});

// 11. Create a Stripe Identity Verification Session for Sign Up Pt 5
app.post('/api/stripe/create-verification-session', async (req, res) => {
    try {
        const { successUrl, cancelUrl } = req.body || {};

        if (!successUrl || !cancelUrl) {
            return res.status(400).json({ error: 'successUrl and cancelUrl are required' });
        }

        const session = await stripe.identity.verificationSessions.create({
            type: 'document',
            metadata: { user_id: 'makerpods_test_user' },
            options: {
                document: {
                    require_matching_selfie: true,
                },
            },
            return_url: successUrl,
        });

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        console.error('[Stripe] create-verification-session failed:', err.message);
        res.status(500).json({ error: err.message });
    }
});