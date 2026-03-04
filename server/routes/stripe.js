const express = require("express");
const protect = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

let stripe;
const getStripe = () => {
  if (!stripe) {
    const Stripe = require("stripe");
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// POST /api/stripe/create-checkout — Create a Stripe Checkout Session
router.post("/create-checkout", protect, async (req, res) => {
  try {
    const s = getStripe();
    const user = req.user;

    // Check if customer exists in Stripe
    const customers = await s.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await s.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.origin || process.env.FRONTEND_URL}/dashboard?subscription=success`,
      cancel_url: `${req.headers.origin || process.env.FRONTEND_URL}/dashboard?subscription=canceled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stripe/check-subscription — Check if user has active subscription
router.get("/check-subscription", protect, async (req, res) => {
  try {
    const s = getStripe();
    const user = req.user;

    const customers = await s.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return res.json({ subscribed: false, tier: "free" });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await s.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.json({ subscribed: false, tier: "free" });
    }

    const subscription = subscriptions.data[0];
    res.json({
      subscribed: true,
      tier: "pro",
      subscriptionEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("Subscription check error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/stripe/customer-portal — Create a Customer Portal session
router.post("/customer-portal", protect, async (req, res) => {
  try {
    const s = getStripe();
    const user = req.user;

    const customers = await s.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return res.status(400).json({ message: "No Stripe customer found" });
    }

    const portalSession = await s.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${req.headers.origin || process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error("Customer portal error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
