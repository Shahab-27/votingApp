import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { getProfile, verifyEmailCode, resendVerificationEmail } from "../api/auth.api";
import { removeVote } from "../api/vote.api";
import axiosInstance from "../api/axiosInstance";
import { getSelfCandidateProfile, uploadCandidateProfileImage } from "../api/candidate.api";

const Profile = () => {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [voteMessage, setVoteMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState(false);
    const [verifyCode, setVerifyCode] = useState("");
    const [verifyMessage, setVerifyMessage] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    // Approved candidate: complete profile to appear in candidates list
    const [selfCandidate, setSelfCandidate] = useState(null);
    const [profileForm, setProfileForm] = useState({ name: "", party: "", address: "", age: "", mobile: "" });
    const [candidateImageFile, setCandidateImageFile] = useState(null);
    const [partyImageFile, setPartyImageFile] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfileUser(data?.user ?? null);
            if (data?.user) setUser(data.user);
        } catch (err) {
            setProfileUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // Prefer latest user from auth context, fall back to last fetched profile
    const displayUser = user || profileUser;
    const isVoter = displayUser?.role === "voter";
    const isCandidate = displayUser?.role === "candidate";
    const canVote = isVoter || isCandidate;
    const canResubmit =
        isCandidate &&
        displayUser?.emailVerified &&
        displayUser?.paymentStatus === "paid" &&
        displayUser?.approvalStatus === "rejected";
    // Show candidate profile form only when unpaid (fill details before payment). After payment, form disappears.
    const canFillCandidateProfile =
        isCandidate &&
        displayUser?.emailVerified &&
        displayUser?.paymentStatus === "unpaid";
    const isApprovedCandidate =
        isCandidate &&
        displayUser?.emailVerified &&
        displayUser?.paymentStatus === "paid" &&
        displayUser?.approvalStatus === "approved";

    // Load candidate profile for form when candidate + email verified (unpaid: to fill; paid: for Update Profile page)
    useEffect(() => {
        if (!isCandidate || !displayUser?.emailVerified) return;
        const load = async () => {
            try {
                const c = await getSelfCandidateProfile();
                setSelfCandidate(c ?? null);
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
                        name: displayUser?.username || "",
                        party: "",
                        address: "",
                        age: "",
                        mobile: "",
                    });
                }
            } catch {
                setSelfCandidate(null);
            }
        };
        load();
    }, [isCandidate, displayUser?.emailVerified, displayUser?.username]);

    const handleRemoveVote = async () => {
        setVoteMessage("");
        setRemoving(true);
        try {
            await removeVote();
            setVoteMessage("Vote removed successfully.");
            await fetchProfile();
        } catch (err) {
            setVoteMessage(err.response?.data?.error || "Failed to remove vote.");
        } finally {
            setRemoving(false);
        }
    };


    const handleSubmitCandidateProfile = async (e) => {
        e.preventDefault();
        setProfileMessage("");
        setProfileSaving(true);
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
            setProfileMessage("Profile saved. You now appear in the candidates list.");
            const c = await getSelfCandidateProfile();
            setSelfCandidate(c ?? null);
        } catch (err) {
            setProfileMessage(err.response?.data?.error || "Failed to save profile.");
        } finally {
            setProfileSaving(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setVerifyMessage("");
        setVerifying(true);
        try {
            await verifyEmailCode(verifyCode);
            setVerifyMessage("Email verified successfully.");
            setVerifyCode("");
            await fetchProfile();
        } catch (err) {
            setVerifyMessage(err.response?.data?.error || "Verification failed.");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="page page--narrow profile-page">
                <p className="muted-text">Loading profile…</p>
            </div>
        );
    }

    if (!displayUser) {
        return (
            <div className="page page--narrow profile-page">
                <p className="muted-text">No user data available.</p>
            </div>
        );
    }

    return (
        <div className="page page--narrow profile-page">
            <h2 className="page__title">Profile</h2>

            <dl className="profile-grid">
                <dt>Name</dt>
                <dd>{displayUser.username ?? "—"}</dd>
                <dt>Aadhaar number</dt>
                <dd>{displayUser.aadhaarNo != null ? String(displayUser.aadhaarNo).replace(/(\d{4})(?=\d)/g, "$1 ") : "—"}</dd>
                <dt>Role</dt>
                <dd>{displayUser.role}</dd>
                {isCandidate && (
                    <>
                        <dt>Email / candidate status</dt>
                        <dd>
                            {!displayUser.emailVerified && "Email not verified"}
                            {displayUser.emailVerified && displayUser.approvalStatus === "rejected" && (
                                <span className="profile-status-tag profile-status-tag--danger">Not approved</span>
                            )}
                            {displayUser.emailVerified &&
                                displayUser.approvalStatus !== "rejected" &&
                                displayUser.paymentStatus !== "paid" && (
                                <>
                                    <span>Email verified</span>
                                    <span className="profile-status-tag profile-status-tag--warn">Payment required</span>
                                </>
                            )}
                            {displayUser.emailVerified &&
                                displayUser.approvalStatus === "pending" &&
                                displayUser.paymentStatus === "paid" && (
                                    <span className="profile-status-tag">
                                        Payment done, pending admin approval
                                    </span>
                                )
                            }
                            {displayUser.emailVerified &&
                                displayUser.approvalStatus === "approved" &&
                                displayUser.paymentStatus === "paid" &&
                                "Verified"}
                        </dd>
                        <dt>Candidate email</dt>
                        <dd>{displayUser.email || "—"}</dd>
                        <dt>Aadhaar document</dt>
                        <dd>
                            {displayUser.aadhaarDocUrl ? (
                                <a href={displayUser.aadhaarDocUrl} target="_blank" rel="noreferrer">
                                    View uploaded document
                                </a>
                            ) : (
                                "—"
                            )}
                        </dd>
                        {displayUser.paymentStatus === "paid" && (
                            <>
                                <dt>Payment receipt</dt>
                                <dd>
                                    {displayUser.stripeReceiptUrl ? (
                                        <a href={displayUser.stripeReceiptUrl} target="_blank" rel="noreferrer">
                                            Download receipt
                                        </a>
                                    ) : (
                                        <span className="muted-text">Receipt will appear after confirmation.</span>
                                    )}
                                </dd>
                            </>
                        )}
                    </>
                )}
                <dt>Voted</dt>
                <dd>{displayUser.isVoted ? "Yes" : "No"}</dd>
            </dl>

            {canResubmit && (
                <section className="card">
                    <h3 className="section-title">Application rejected</h3>
                    {displayUser.approvalRemarks && (
                        <p className="alert alert--error">
                            {displayUser.approvalRemarks}
                        </p>
                    )}
                    <div className="profile-vote-actions">
                        <Link to="/update-profile" className="btn btn--primary">
                            Update profile
                        </Link>
                    </div>
                </section>
            )}

            {canFillCandidateProfile && (
                <section className="card">
                    <h3 className="section-title">Complete your candidate profile</h3>
                    <p className="profile-vote-desc">
                        Fill in your details below. After saving, proceed to payment to submit your application for admin approval.
                    </p>
                    {profileMessage && (
                        <p className={profileMessage.includes("saved") ? "alert alert--success" : "alert alert--error"}>
                            {profileMessage}
                        </p>
                    )}
                    <form onSubmit={handleSubmitCandidateProfile} className="admin-form" style={{ marginTop: 12 }}>
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
                        <button type="submit" className="btn btn--primary" disabled={profileSaving}>
                            {profileSaving ? "Saving…" : "Save and proceed to payment"}
                        </button>
                    </form>
                </section>
            )}

            {isApprovedCandidate && (
                <section className="card">
                    <h3 className="section-title">Your candidate profile</h3>
                    <p className="profile-vote-desc">
                        You appear in the candidates list. To update your details, use <strong>Update profile</strong> from the profile menu above.
                    </p>
                </section>
            )}

            {canVote && (
                <section className="card profile-vote-section">
                    <h3 className="section-title">Voting</h3>
                    <p className="profile-vote-desc">View all candidates and cast or remove your vote.</p>
                    <div className="profile-vote-actions">
                        <Link to="/candidates" className="btn btn--ghost">
                            View candidates (full info)
                        </Link>
                        <button
                            type="button"
                            className="btn btn--primary"
                            onClick={() => {
                                if (!displayUser.isVoted) {
                                    navigate("/vote");
                                } else {
                                    handleRemoveVote();
                                }
                            }}
                            disabled={removing}
                        >
                            {displayUser.isVoted ? (removing ? "Removing…" : "Remove vote") : "Cast your vote"}
                        </button>
                    </div>
                    {voteMessage && (
                        <p className={voteMessage.includes("success") ? "alert alert--success" : "alert alert--error"}>{voteMessage}</p>
                    )}
                </section>
            )}

            {isCandidate && !displayUser.emailVerified && (
                <section className="card">
                    <h3 className="section-title">Verify email</h3>
                    <p className="profile-vote-desc">
                        Enter the 6-digit code sent to your email to complete candidate verification.
                    </p>
                    {verifyMessage && (
                        <p className={verifyMessage.includes("success") ? "alert alert--success" : "alert alert--error"}>
                            {verifyMessage}
                        </p>
                    )}
                    <form onSubmit={handleVerifyEmail} className="profile-verify-form">
                        <div className="form-group profile-verify-row">
                            <div className="profile-verify-input">
                                <label>Verification code</label>
                                <input
                                    type="text"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <div className="profile-verify-actions">
                                <button type="submit" className="btn btn--primary" disabled={verifying}>
                                    {verifying ? "Verifying…" : "Verify email"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--ghost"
                                    disabled={resending}
                                    onClick={async () => {
                                        setVerifyMessage("");
                                        setResending(true);
                                        try {
                                            const res = await resendVerificationEmail();
                                            setVerifyMessage(res.message || "Verification code resent.");
                                        } catch (err) {
                                            setVerifyMessage(err.response?.data?.error || "Failed to resend code.");
                                        } finally {
                                            setResending(false);
                                        }
                                    }}
                                >
                                    {resending ? "Resending…" : "Resend code"}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            )}

            {isCandidate && displayUser.emailVerified && displayUser.paymentStatus !== "paid" && (
                <section className="card">
                    <h3 className="section-title">Candidate payment</h3>
                    <p className="profile-vote-desc">
                        Your email is verified. Please proceed to payment to submit your request for admin approval.
                    </p>
                    <div className="profile-vote-actions">
                        <Link to="/candidate-payment" className="btn btn--primary">
                            Proceed to payment
                        </Link>
                    </div>
                </section>
            )}

            <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
                Logout
            </button>
        </div>
    );
};

export default Profile;
