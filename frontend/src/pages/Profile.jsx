import { useState } from "react";
import useAuth from "../auth/useAuth";
import { changePassword } from "../api/auth.api";

const Profile = () => {
    const { user, logout } = useAuth();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [pwMessage, setPwMessage] = useState("");

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMessage("");
        try {
            await changePassword({ oldPassword, newPassword });
            setPwMessage("Password updated.");
            setOldPassword("");
            setNewPassword("");
        } catch (err) {
            setPwMessage(err.response?.data?.error || "Failed to update password.");
        }
    };

    if (!user) {
        return <p className="muted-text">No user data available.</p>;
    }

    return (
        <div className="page page--narrow">
            <h2 className="page__title">Profile</h2>

            <dl className="profile-grid">
                <dt>Name</dt>
                <dd>{user.username ?? "—"}</dd>
                <dt>Role</dt>
                <dd>{user.role}</dd>
                <dt>Voted</dt>
                <dd>{user.isVoted ? "Yes" : "No"}</dd>
            </dl>

            <section className="card">
                <h3 className="section-title">Change password</h3>
                {pwMessage && <p className={pwMessage.includes("updated") ? "success" : "error"}>{pwMessage}</p>}
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label>Current password</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="button--primary">Update password</button>
                </form>
            </section>

            <button type="button" className="button--small" onClick={logout}>Logout</button>
        </div>
    );
};

export default Profile;
