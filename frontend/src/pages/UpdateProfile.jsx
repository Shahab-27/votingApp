import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import axiosInstance from "../api/axiosInstance";
import { getProfile } from "../api/auth.api";
import { getSelfCandidateProfile, uploadCandidateProfileImage } from "../api/candidate.api";

const UpdateProfile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [profileForm, setProfileForm] = useState({ name: "", party: "", address: "", age: "", mobile: "" });
    const [candidateImageFile, setCandidateImageFile] = useState(null);
    const [partyImageFile, setPartyImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (user?.role !== "candidate") {
            navigate("/profile", { replace: true });
            return;
        }
        const load = async () => {
            try {
                const c = await getSelfCandidateProfile();
                if (c) {
                    setProfileForm({
                        name: c.name || "",
                        party: c.party || "",
                        address: c.address || "",
                        age: c.age ?? "",
                        mobile: c.mobile || "",
                    });
                } else {
                    setProfileForm({
                        name: user?.username || "",
                        party: "",
                        address: "",
                        age: "",
                        mobile: "",
                    });
                }
            } catch {
                setProfileForm({
                    name: user?.username || "",
                    party: "",
                    address: "",
                    age: "",
                    mobile: "",
                });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.role, user?.username, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setSaving(true);
        try {
            let candidateImageUrl = null;
            let partyImageUrl = null;
            if (candidateImageFile) candidateImageUrl = await uploadCandidateProfileImage(candidateImageFile);
            if (partyImageFile) partyImageUrl = await uploadCandidateProfileImage(partyImageFile);
            await axiosInstance.post("/candidate/self", {
                name: profileForm.name,
                party: profileForm.party,
                address: profileForm.address || "N/A",
                age: profileForm.age ? Number(profileForm.age) : undefined,
                mobile: profileForm.mobile || undefined,
                candidateImage: candidateImageUrl || undefined,
                partyImage: partyImageUrl || undefined,
            });
            const isPaid = user?.paymentStatus === "paid";
            const wasApprovedOrRejected = user?.approvalStatus === "approved" || user?.approvalStatus === "rejected";
            if (isPaid && wasApprovedOrRejected) {
                setMessage("Profile updated. Your application has been sent for admin approval again.");
                const data = await getProfile();
                if (data?.user) setUser(data.user);
            } else {
                setMessage("Profile updated successfully.");
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== "candidate") return null;
    if (loading) {
        return (
            <div className="page auth-page">
                <p className="muted-text">Loading…</p>
            </div>
        );
    }

    return (
        <div className="page auth-page">
            <h2 className="page__title">Update profile</h2>

            {message && (
                <p className={message.includes("updated") || message.includes("approval") ? "alert alert--success" : "alert alert--error"}>
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name *</label>
                    <input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Party *</label>
                    <input
                        value={profileForm.party}
                        onChange={(e) => setProfileForm((f) => ({ ...f, party: e.target.value }))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Address</label>
                    <input
                        value={profileForm.address}
                        onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))}
                    />
                </div>
                <div className="admin-form__row" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div className="form-group">
                        <label>Age</label>
                        <input
                            type="number"
                            min="18"
                            value={profileForm.age}
                            onChange={(e) => setProfileForm((f) => ({ ...f, age: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mobile</label>
                        <input
                            type="tel"
                            value={profileForm.mobile}
                            onChange={(e) => setProfileForm((f) => ({ ...f, mobile: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Candidate photo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCandidateImageFile(e.target.files?.[0] || null)}
                    />
                </div>
                <div className="form-group">
                    <label>Party logo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPartyImageFile(e.target.files?.[0] || null)}
                    />
                </div>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                    {saving ? "Saving…" : "Update profile"}
                </button>
            </form>

            <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => navigate("/profile")}
                style={{ marginTop: "1rem" }}
            >
                Back to profile
            </button>
        </div>
    );
};

export default UpdateProfile;
