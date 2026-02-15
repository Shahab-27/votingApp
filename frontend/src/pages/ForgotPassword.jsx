import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestForgotPassword, resetPassword } from "../api/auth.api";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await requestForgotPassword(email);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await resetPassword({ email, code: otp, newPassword });
            navigate("/login", { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page auth-page">
            <h2 className="page__title">Forgot password</h2>

            {error && <p className="alert alert--error">{error}</p>}

            {step === 1 ? (
                <form onSubmit={handleRequestOtp}>
                    <p className="muted-text">Enter your email address. We will send you an OTP to verify and reset your password.</p>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn--primary" disabled={loading}>
                        {loading ? "Sending…" : "Send OTP"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <p className="muted-text">Enter the 6-digit OTP sent to your email and your new password.</p>
                    <div className="form-group">
                        <label>OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="6-digit code"
                            maxLength={6}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New password (letters and numbers, min 6)</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm new password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn--primary" disabled={loading}>
                        {loading ? "Updating…" : "Update password"}
                    </button>
                    <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => { setStep(1); setError(""); }}
                    >
                        Use different email
                    </button>
                </form>
            )}

            <div className="login-links" style={{ marginTop: "1rem" }}>
                <Link to="/login">Back to login</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
