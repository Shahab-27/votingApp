import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../auth/useAuth";

const CandidatePayment = () => {
  const location = useLocation();
  const { user, setUser } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const sessionIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("session_id");
  }, [location.search]);

  const isSuccess = location.pathname.endsWith("/success");
  const isCancelled = location.pathname.endsWith("/cancelled");

  const startCheckout = async () => {
    setMessage("");
    setBusy(true);
    try {
      const res = await axiosInstance.post("/payments/candidate/checkout");
      const url = res.data?.url;
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (err) {
      setMessage(err.response?.data?.error || err.message || "Failed to start payment.");
      setBusy(false);
    }
  };

  const confirmPayment = async (sessionId) => {
    setMessage("");
    setBusy(true);
    try {
      await axiosInstance.post("/payments/candidate/confirm", { sessionId });
      setMessage("Payment confirmed. Your request will be sent for admin approval after you verify your email.");
      // refresh profile snapshot in auth context
      const profile = await axiosInstance.get("/voterprofile");
      if (profile.data?.user) setUser(profile.data.user);
    } catch (err) {
      setMessage(err.response?.data?.error || "Payment confirmation failed.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (isSuccess && sessionIdFromUrl) {
      confirmPayment(sessionIdFromUrl);
    } else if (isCancelled) {
      setMessage("Payment cancelled. You can try again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isCancelled, sessionIdFromUrl]);

  return (
    <div className="page page--narrow">
      <h2 className="page__title">Candidate payment</h2>

      {message && <p className={message.toLowerCase().includes("confirmed") ? "alert alert--success" : "alert alert--error"}>{message}</p>}

      <div className="card">
        <p className="muted-text">
          Status: <strong>{user?.paymentStatus === "paid" ? "Paid" : "Unpaid"}</strong>
        </p>
        <div className="profile-vote-actions">
          <button type="button" className="btn btn--primary" onClick={startCheckout} disabled={busy || user?.paymentStatus === "paid"}>
            {busy ? "Processing…" : user?.paymentStatus === "paid" ? "Paid" : "Pay now"}
          </button>
          <Link to="/profile" className="btn btn--ghost">
            Back to profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidatePayment;

