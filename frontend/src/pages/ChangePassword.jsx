import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { changePassword } from "../api/auth.api";

const ChangePassword = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            await changePassword({ oldPassword, newPassword });
            setMessage("Password updated successfully.");
            setOldPassword("");
            setNewPassword("");
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    const path = user?.role === "admin" ? "/admin" : "/profile";

    return (
        <div className="page auth-page">
            <h2 className="page__title">Change password</h2>

            {message && (
                <p className={message.includes("success") ? "alert alert--success" : "alert alert--error"}>{message}</p>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Current password</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Current password"
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
                <button type="submit" className="btn btn--primary" disabled={loading}>
                    {loading ? "Updating…" : "Update password"}
                </button>
            </form>

            <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate(path)} style={{ marginTop: "1rem" }}>
                Back to {user?.role === "admin" ? "dashboard" : "profile"}
            </button>
        </div>
    );
};

export default ChangePassword;
