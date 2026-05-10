import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { uploadCandidateProfileImage } from "../api/candidate.api";
import { createCampaign, getMyCampaigns, toggleCampaign, deleteCampaign } from "../api/feed.api";

const AddCampaign = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const [caption, setCaption] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [myCampaigns, setMyCampaigns] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);
    const [actioningId, setActioningId] = useState(null);

    const fetchMyCampaigns = async () => {
        try {
            const list = await getMyCampaigns();
            setMyCampaigns(Array.isArray(list) ? list : []);
        } catch (_) {
            setMyCampaigns([]);
        } finally {
            setLoadingCampaigns(false);
        }
    };

    useEffect(() => {
        fetchMyCampaigns();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        if (!imageFile) {
            setMessage("Please select an image for your campaign.");
            return;
        }
        setSubmitting(true);
        try {
            const imageUrl = await uploadCandidateProfileImage(imageFile);
            if (!imageUrl) {
                setMessage("Image upload failed. Please try again.");
                setSubmitting(false);
                return;
            }
            await createCampaign(imageUrl, caption);
            setMessage("Campaign submitted for admin approval. It will appear in the feed once approved.");
            setImageFile(null);
            setCaption("");
            fetchMyCampaigns();
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to submit campaign.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (campaign) => {
        if (campaign.status !== "approved") return;
        setActioningId(campaign._id);
        try {
            const res = await toggleCampaign(campaign._id);
            const newActive = res?.isActive ?? !campaign.isActive;
            setMyCampaigns((prev) =>
                prev.map((c) => (c._id === campaign._id ? { ...c, isActive: newActive } : c))
            );
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to update campaign.");
        } finally {
            setActioningId(null);
        }
    };

    const handleDelete = async (campaign) => {
        if (!window.confirm("Delete this campaign? This cannot be undone.")) return;
        setActioningId(campaign._id);
        try {
            await deleteCampaign(campaign._id);
            setMyCampaigns((prev) => prev.filter((c) => c._id !== campaign._id));
            setMessage("Campaign deleted.");
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to delete campaign.");
        } finally {
            setActioningId(null);
        }
    };

    if (user?.role !== "candidate") {
        navigate("/profile", { replace: true });
        return null;
    }

    return (
        <div className="page page--narrow">
            <h1 className="page__title">Add campaign</h1>
            <p className="muted-text" style={{ marginTop: 0 }}>
                Upload a poster or manifesto image and add a caption. Your post will be sent for admin approval before it appears in the feed.
            </p>
            {message && (
                <div
                    className={`alert ${message.includes("approval") || message.includes("deleted") ? "alert--success" : "alert--error"}`}
                    role="alert"
                >
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit} className="card">
                <div className="form-group">
                    <label>Campaign image *</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Caption (optional)</label>
                    <textarea
                        rows={4}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Describe your campaign or message..."
                    />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button type="submit" className="btn btn--primary" disabled={submitting}>
                        {submitting ? "Submitting…" : "Submit for approval"}
                    </button>
                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => navigate("/feed")}
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <section className="card" style={{ marginTop: "1.5rem" }}>
                <h3 className="section-title">Your campaigns</h3>
                <p className="muted-text" style={{ marginTop: -6, marginBottom: 12 }}>
                    Manage your existing campaigns. Turn off to hide from feed; delete to remove permanently.
                </p>
                {loadingCampaigns ? (
                    <p className="muted-text">Loading…</p>
                ) : myCampaigns.length === 0 ? (
                    <p className="muted-text">No campaigns yet. Add one above.</p>
                ) : (
                    <div className="feed-list">
                        {myCampaigns.map((c) => (
                            <article key={c._id} className="feed-card">
                                <div className="feed-card__header">
                                    {c.image && (
                                        <img src={c.image} alt="" className="feed-card__avatar" style={{ objectFit: "cover" }} />
                                    )}
                                    <div className="feed-card__meta" style={{ flex: 1 }}>
                                        <strong className="feed-card__name">
                                            {c.status === "pending" && "⏳ Pending"}
                                            {c.status === "approved" && (c.isActive !== false ? "✓ Live" : "○ Off")}
                                            {c.status === "rejected" && "✗ Rejected"}
                                        </strong>
                                        <span className="feed-card__party">{c.caption ? (c.caption.slice(0, 50) + (c.caption.length > 50 ? "…" : "")) : "No caption"}</span>
                                    </div>
                                </div>
                                <div className="feed-card__image-wrap">
                                    <img src={c.image} alt="" className="feed-card__image" />
                                </div>
                                {c.caption && <p className="feed-card__caption">{c.caption}</p>}
                                <div className="feed-card__actions" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                    {c.status === "approved" && (
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--sm"
                                            onClick={() => handleToggle(c)}
                                            disabled={actioningId === c._id}
                                        >
                                            {actioningId === c._id ? "…" : c.isActive !== false ? "Turn off" : "Turn on"}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn--danger btn--sm"
                                        onClick={() => handleDelete(c)}
                                        disabled={actioningId === c._id}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AddCampaign;
