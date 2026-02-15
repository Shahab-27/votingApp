import Stripe from "stripe";
import voter from "../models/voter.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const requireStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error("Stripe is not configured");
    err.statusCode = 500;
    throw err;
  }
};

export const createCandidateCheckoutSession = async (req, res) => {
  try {
    requireStripe();

    const userId = req.user.id;
    const user = await voter.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "candidate") return res.status(400).json({ error: "Only candidates can pay" });
    if (user.paymentStatus === "paid") return res.status(400).json({ error: "Payment already completed" });

    const frontendBaseUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const amountInr = Number(process.env.CANDIDATE_FEE_INR || 499);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Candidate registration fee" },
            unit_amount: Math.round(amountInr * 100),
          },
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      customer_email: user.email || undefined,
      metadata: {
        userId,
        purpose: "candidate_registration",
      },
      success_url: `${frontendBaseUrl}/candidate-payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBaseUrl}/candidate-payment/cancelled`,
    });

    user.stripeCheckoutSessionId = session.id;
    await user.save();

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("[createCandidateCheckoutSession] Error", error);
    return res.status(error?.statusCode || 500).json({ error: error?.message || "Internal Server Error" });
  }
};

export const confirmCandidateCheckoutSession = async (req, res) => {
  try {
    requireStripe();

    const userId = req.user.id;
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

    const user = await voter.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "candidate") return res.status(400).json({ error: "Only candidates can confirm payment" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) return res.status(404).json({ error: "Stripe session not found" });

    // Ensure this session belongs to the logged-in user
    if (String(session.client_reference_id) !== String(userId)) {
      return res.status(403).json({ error: "Session does not belong to this user" });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Try to fetch a receipt URL (charge receipt) for user download
    let receiptUrl = null;
    let chargeId = null;
    const paymentIntentId = session.payment_intent || null;
    if (paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ["latest_charge"],
      });
      const latestCharge = pi?.latest_charge || null;
      if (latestCharge && typeof latestCharge === "object") {
        receiptUrl = latestCharge.receipt_url || null;
        chargeId = latestCharge.id || null;
      } else if (typeof latestCharge === "string") {
        const charge = await stripe.charges.retrieve(latestCharge);
        receiptUrl = charge?.receipt_url || null;
        chargeId = charge?.id || null;
      }
    }

    user.paymentStatus = "paid";
    user.stripeCheckoutSessionId = session.id;
    user.stripePaymentIntentId = paymentIntentId;
    user.stripeChargeId = chargeId;
    user.stripeReceiptUrl = receiptUrl;
    await user.save();

    return res.status(200).json({ message: "Payment confirmed", receiptUrl });
  } catch (error) {
    console.error("[confirmCandidateCheckoutSession] Error", error);
    return res.status(error?.statusCode || 500).json({ error: error?.message || "Internal Server Error" });
  }
};

