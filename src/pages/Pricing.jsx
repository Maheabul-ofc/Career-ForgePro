import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { checkSubscription, createCheckout, openCustomerPortal } from "../api";

const Pricing = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState({ subscribed: false, tier: "free" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription()
        .then(({ data }) => setSubscription(data))
        .catch(() => {});
    }
  }, [user]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data } = await createCheckout();
      window.open(data.url, "_blank");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data } = await openCustomerPortal();
      window.open(data.url, "_blank");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to open portal");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "1 Resume Analysis",
        "Basic keyword matching",
        "ATS score report",
      ],
      cta: subscription.tier === "free" ? "Current Plan" : null,
      active: subscription.tier === "free",
    },
    {
      name: "Pro",
      price: "$12",
      period: "/month",
      features: [
        "Unlimited Resume Analyses",
        "AI-powered resume rewriting",
        "Cover letter generation",
        "Premium PDF templates",
        "Priority support",
      ],
      cta: subscription.tier === "pro" ? "Manage Subscription" : "Upgrade to Pro",
      active: subscription.tier === "pro",
      highlight: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-white text-center mb-4">
        Choose Your Plan
      </h1>
      <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
        Start free and upgrade when you need unlimited AI-powered resume optimization
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-slate-800 rounded-2xl p-8 border ${
              plan.highlight
                ? "border-indigo-500 ring-1 ring-indigo-500/20"
                : "border-slate-700"
            } relative`}
          >
            {plan.active && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                Your Plan
              </span>
            )}
            <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-slate-400">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-green-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {plan.cta && (
              <button
                onClick={
                  plan.active && subscription.tier === "pro"
                    ? handleManage
                    : plan.highlight
                    ? handleUpgrade
                    : undefined
                }
                disabled={loading || (plan.active && subscription.tier === "free")}
                className={`w-full py-3 rounded-lg font-semibold text-sm disabled:opacity-50 ${
                  plan.highlight && !plan.active
                    ? "gradient-accent text-white"
                    : plan.active && subscription.tier === "pro"
                    ? "bg-slate-700 hover:bg-slate-600 text-white"
                    : "bg-slate-700 text-slate-400 cursor-default"
                }`}
              >
                {loading ? "Loading..." : plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
