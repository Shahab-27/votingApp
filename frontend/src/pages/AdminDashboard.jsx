import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import uploadImageViaBackend from "../api/cloudinary.api";
import { updateCandidate } from "../api/candidate.api";
import Chart from "chart.js/auto";

const AdminDashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [pendingCandidateUsers, setPendingCandidateUsers] = useState([]);
    const [name, setName] = useState("");
    const [party, setParty] = useState("");
    const [address, setAddress] = useState("");
    const [age, setAge] = useState("");
    const [mobile, setMobile] = useState("");
    const [candidateImageFile, setCandidateImageFile] = useState(null);
    const [partyImageFile, setPartyImageFile] = useState(null);
    const [message, setMessage] = useState("");
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        party: "",
        address: "",
        age: "",
        mobile: "",
    });
    const [editCandidateImageFile, setEditCandidateImageFile] = useState(null);
    const [editPartyImageFile, setEditPartyImageFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [remarksModal, setRemarksModal] = useState({
        open: false,
        action: null, // "approve" | "reject"
        user: null,
    });
    const [remarksText, setRemarksText] = useState("");

    // Chart.js refs
    const lineChartCanvasRef = useRef(null);
    const barChartCanvasRef = useRef(null);
    const lineChartInstanceRef = useRef(null);
    const barChartInstanceRef = useRef(null);
    const timeSeriesRef = useRef({
        labels: [],
        partyData: {},
    });

    const getPaletteColor = (index) => {
        const colors = [
            "#0d9488",
            "#2563eb",
            "#f97316",
            "#a855f7",
            "#22c55e",
            "#e11d48",
            "#1d4ed8",
        ];
        return colors[index % colors.length];
    };

    const fetchCandidates = async () => {
        try {
            const res = await axiosInstance.get("/allCandidates");
            const list = res.data || [];
            setCandidates(list);
            updateCharts(list);
        } catch (err) {
            setMessage("Failed to load candidates.");
            setCandidates([]);
        }
    };

    const fetchPendingCandidateUsers = async () => {
        try {
            const res = await axiosInstance.get("/admin/candidate-approvals");
            setPendingCandidateUsers(res.data?.candidates || []);
        } catch (err) {
            // If endpoint not accessible (non-admin), keep empty without noisy error
            setPendingCandidateUsers([]);
        }
    };

    const updateCharts = (candidateList) => {
        if (!candidateList) return;

        // Update bar chart (votes per candidate)
        if (barChartInstanceRef.current && barChartCanvasRef.current) {
            const labels = candidateList.map((c) => c.name);
            const data = candidateList.map((c) => c.voteCount ?? 0);
            const backgroundColors = labels.map((_, idx) => {
                const base = getPaletteColor(idx);
                // add alpha channel to base hex (fallback: reuse base)
                return base.endsWith(")") ? base : base + "33";
            });

            barChartInstanceRef.current.data.labels = labels;
            barChartInstanceRef.current.data.datasets = [
                {
                    label: "Votes per candidate",
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: candidateList.map((_, idx) => getPaletteColor(idx)),
                    borderWidth: 1,
                },
            ];
            barChartInstanceRef.current.update();
        }

        // Update line chart (party vote share over time)
        if (lineChartInstanceRef.current && lineChartCanvasRef.current) {
            const timestamp = new Date().toLocaleTimeString();
            const partyTotals = {};

            candidateList.forEach((c) => {
                const party = c.party || "Unknown";
                const votes = c.voteCount ?? 0;
                partyTotals[party] = (partyTotals[party] || 0) + votes;
            });

            const ts = timeSeriesRef.current;
            const existingParties = Object.keys(ts.partyData);
            const newParties = Object.keys(partyTotals);
            const allParties = Array.from(new Set([...existingParties, ...newParties]));

            ts.labels.push(timestamp);

            allParties.forEach((party) => {
                if (!ts.partyData[party]) {
                    ts.partyData[party] = Array(ts.labels.length - 1).fill(0);
                }
                ts.partyData[party].push(partyTotals[party] || 0);
            });

            // Keep the last 20 points to avoid overcrowding
            if (ts.labels.length > 20) {
                ts.labels.shift();
                allParties.forEach((party) => {
                    ts.partyData[party].shift();
                });
            }

            lineChartInstanceRef.current.data.labels = ts.labels;
            lineChartInstanceRef.current.data.datasets = allParties.map((party, idx) => {
                const color = getPaletteColor(idx);
                return {
                    label: party,
                    data: ts.partyData[party],
                    borderColor: color,
                    backgroundColor: color + "33",
                    tension: 0.3,
                    fill: false,
                    pointRadius: 3,
                };
            });

            lineChartInstanceRef.current.update();
        }
    };

    useEffect(() => {
        // Initialize charts once
        if (lineChartCanvasRef.current && !lineChartInstanceRef.current) {
            lineChartInstanceRef.current = new Chart(lineChartCanvasRef.current, {
                type: "line",
                data: {
                    labels: [],
                    datasets: [],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                        tooltip: { enabled: true },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Time",
                            },
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Total votes",
                            },
                        },
                    },
                },
            });
        }

        if (barChartCanvasRef.current && !barChartInstanceRef.current) {
            barChartInstanceRef.current = new Chart(barChartCanvasRef.current, {
                type: "bar",
                data: {
                    labels: [],
                    datasets: [],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                        tooltip: { enabled: true },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Candidates",
                            },
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Votes",
                            },
                        },
                    },
                },
            });
        }

        return () => {
            if (lineChartInstanceRef.current) {
                lineChartInstanceRef.current.destroy();
                lineChartInstanceRef.current = null;
            }
            if (barChartInstanceRef.current) {
                barChartInstanceRef.current.destroy();
                barChartInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        fetchCandidates();
        fetchPendingCandidateUsers();

        // Poll for latest vote data so charts and list stay up to date
        const intervalId = setInterval(() => {
            fetchCandidates();
        }, 5000);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const approveCandidateUser = async (userId) => {
        try {
            setMessage("");
            await axiosInstance.post(`/admin/candidates/${userId}/approve`, {
                remarks: remarksText,
            });
            setMessage("Candidate approved.");
            fetchPendingCandidateUsers();
        } catch (err) {
            setMessage(err.response?.data?.error || "Approve failed.");
        }
    };

    const disapproveCandidateUser = async (userId) => {
        try {
            setMessage("");
            await axiosInstance.post(`/admin/candidates/${userId}/disapprove`, {
                remarks: remarksText,
            });
            setMessage("Candidate rejected.");
            fetchPendingCandidateUsers();
        } catch (err) {
            setMessage(err.response?.data?.error || "Reject failed.");
        }
    };

    const openRemarksModal = (action, user) => {
        setRemarksText("");
        setRemarksModal({ open: true, action, user });
    };

    const closeRemarksModal = () => {
        setRemarksModal({ open: false, action: null, user: null });
        setRemarksText("");
    };

    const confirmRemarksAction = async () => {
        if (!remarksModal.open || !remarksModal.user || !remarksModal.action) return;
        const userId = remarksModal.user._id;
        if (remarksModal.action === "reject" && !remarksText.trim()) {
            setMessage("Please enter remarks for rejection.");
            return;
        }
        if (remarksModal.action === "approve") {
            await approveCandidateUser(userId);
        } else {
            await disapproveCandidateUser(userId);
        }
        closeRemarksModal();
    };

    const resetAddForm = () => {
        setName("");
        setParty("");
        setAddress("");
        setAge("");
        setMobile("");
        setCandidateImageFile(null);
        setPartyImageFile(null);
    };

    const addCandidate = async (e) => {
        e?.preventDefault();
        try {
            setMessage("");
            setSaving(true);

            let candidateImageUrl = null;
            let partyImageUrl = null;
            if (candidateImageFile) {
                candidateImageUrl = await uploadImageViaBackend(candidateImageFile);
            }
            if (partyImageFile) {
                partyImageUrl = await uploadImageViaBackend(partyImageFile);
            }

            await axiosInstance.post("/registerCandidate", {
                name,
                party,
                address: address || "N/A",
                age: age ? Number(age) : undefined,
                mobile: mobile || undefined,
                candidateImage: candidateImageUrl || undefined,
                partyImage: partyImageUrl || undefined,
            });

            resetAddForm();
            setMessage("Candidate added successfully.");
            fetchCandidates();
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to add candidate.");
        } finally {
            setSaving(false);
        }
    };

    const deleteCandidate = async (id) => {
        try {
            setMessage("");
            await axiosInstance.delete(`/${id}`);
            setMessage("Candidate deleted.");
            fetchCandidates();
        } catch (err) {
            setMessage(err.response?.data?.error || "Delete failed.");
        }
    };

    const openEdit = (c) => {
        setEditing(c._id);
        setEditForm({
            name: c.name || "",
            party: c.party || "",
            address: c.address || "",
            age: c.age ?? "",
            mobile: c.mobile || "",
        });
        setEditCandidateImageFile(null);
        setEditPartyImageFile(null);
    };

    const closeEdit = () => {
        setEditing(null);
    };

    const saveEdit = async (e) => {
        e?.preventDefault();
        if (!editing) return;
        try {
            setMessage("");
            setSaving(true);

            let candidateImageUrl = undefined;
            let partyImageUrl = undefined;
            if (editCandidateImageFile) {
                candidateImageUrl = await uploadImageViaBackend(editCandidateImageFile);
            }
            if (editPartyImageFile) {
                partyImageUrl = await uploadImageViaBackend(editPartyImageFile);
            }

            const payload = {
                ...editForm,
                address: editForm.address || "N/A",
                age: editForm.age ? Number(editForm.age) : undefined,
                mobile: editForm.mobile || undefined,
            };
            if (candidateImageUrl !== undefined) payload.candidateImage = candidateImageUrl;
            if (partyImageUrl !== undefined) payload.partyImage = partyImageUrl;

            await updateCandidate(editing, payload);
            setMessage("Candidate updated successfully.");
            closeEdit();
            fetchCandidates();
        } catch (err) {
            setMessage(err.response?.data?.error || "Update failed.");
        } finally {
            setSaving(false);
        }
    };

    const currentEdit = candidates.find((c) => c._id === editing);

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1 className="admin-title">Admin Dashboard</h1>
                <p className="admin-subtitle">Manage candidates and party logos</p>
            </header>

            {message && (
                <div className={`alert ${message.includes("success") || message.includes("deleted") || message.includes("updated") ? "alert--success" : "alert--error"}`}>
                    {message}
                </div>
            )}

            <section className="admin-card">
                <h2 className="admin-card__title">Candidate approval requests</h2>
                <p className="admin-subtitle">Candidates who verified email and are awaiting admin approval.</p>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Aadhaar</th>
                                <th>Submitted</th>
                                <th className="admin-table__actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingCandidateUsers.map((u) => (
                                <tr key={u._id}>
                                    <td>
                                        <strong>{u.username}</strong>
                                        {u.aadhaarDocUrl && (
                                            <a className="admin-table__meta" href={u.aadhaarDocUrl} target="_blank" rel="noreferrer">
                                                View Aadhaar doc
                                            </a>
                                        )}
                                    </td>
                                    <td>{u.email || "—"}</td>
                                    <td>{u.aadhaarNo || "—"}</td>
                                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}</td>
                                    <td className="admin-table__actions">
                                        <button type="button" className="btn btn--primary btn--sm" onClick={() => openRemarksModal("approve", u)}>
                                            Approve
                                        </button>
                                        <button type="button" className="btn btn--danger btn--sm" onClick={() => openRemarksModal("reject", u)}>
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pendingCandidateUsers.length === 0 && (
                    <p className="admin-empty">No pending candidate approvals.</p>
                )}
            </section>

            {remarksModal.open && (
                <div className="modal-overlay" onClick={closeRemarksModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">
                                {remarksModal.action === "approve" ? "Approve candidate" : "Reject candidate"}
                            </h3>
                            <button type="button" className="modal__close" onClick={closeRemarksModal} aria-label="Close">
                                ×
                            </button>
                        </div>
                        <div className="modal__body">
                            <p className="muted-text" style={{ marginTop: 0 }}>
                                Candidate: <strong>{remarksModal.user?.username}</strong> ({remarksModal.user?.email || "—"})
                            </p>
                            <div className="form-group">
                                <label>
                                    Remarks {remarksModal.action === "reject" ? "(required)" : "(optional)"}
                                </label>
                                <textarea
                                    rows={4}
                                    value={remarksText}
                                    onChange={(e) => setRemarksText(e.target.value)}
                                    placeholder={
                                        remarksModal.action === "reject"
                                            ? "Reason for rejection (e.g. document unclear, mismatch, etc.)"
                                            : "Optional note to candidate (e.g. approved; proceed to next step)"
                                    }
                                />
                            </div>
                        </div>
                        <div className="modal__actions">
                            <button type="button" className="btn btn--ghost" onClick={closeRemarksModal}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn--primary" onClick={confirmRemarksAction}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="admin-card admin-card--form">
                <h2 className="admin-card__title">Add new candidate</h2>
                <form onSubmit={addCandidate} className="admin-form">
                    <div className="admin-form__row">
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Party</label>
                            <input
                                placeholder="Party name"
                                value={party}
                                onChange={(e) => setParty(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="admin-form__row">
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <div className="form-group form-group--sm">
                            <label>Age</label>
                            <input
                                type="number"
                                min="18"
                                placeholder="Age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                        </div>
                        <div className="form-group form-group--sm">
                            <label>Mobile</label>
                            <input
                                type="tel"
                                placeholder="Mobile"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="admin-form__row admin-form__row--images">
                        <div className="form-group form-group--file">
                            <label>Candidate photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCandidateImageFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="form-group form-group--file">
                            <label>Party logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPartyImageFile(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn--primary" disabled={saving}>
                        {saving ? "Adding…" : "Add candidate"}
                    </button>
                </form>
            </section>

            <section className="admin-card admin-card--charts">
                <h2 className="admin-card__title">Voting analytics</h2>
                <p className="admin-subtitle">Live view of vote trends and candidate performance.</p>
                <div className="admin-charts">
                    <div className="admin-chart">
                        <h3 className="section-title">Party vote share over time</h3>
                        <div className="admin-chart__canvas">
                            <canvas ref={lineChartCanvasRef} aria-label="Party vote share over time" />
                        </div>
                    </div>
                    <div className="admin-chart">
                        <h3 className="section-title">Votes per candidate</h3>
                        <div className="admin-chart__canvas">
                            <canvas ref={barChartCanvasRef} aria-label="Votes per candidate" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="admin-card">
                <h2 className="admin-card__title">All candidates</h2>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Party</th>
                                <th>Photo</th>
                                <th>Party logo</th>
                                <th className="admin-table__actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((c) => (
                                <tr key={c._id}>
                                    <td>
                                        <strong>{c.name}</strong>
                                        {c.address && <span className="admin-table__meta">{c.address}</span>}
                                    </td>
                                    <td>{c.party}</td>
                                    <td>
                                        {c.candidateImage ? (
                                            <img src={c.candidateImage} alt={c.name} className="admin-thumb" />
                                        ) : (
                                            <span className="admin-table__empty">—</span>
                                        )}
                                    </td>
                                    <td>
                                        {c.partyImage ? (
                                            <img src={c.partyImage} alt={c.party} className="admin-thumb admin-thumb--logo" />
                                        ) : (
                                            <span className="admin-table__empty">—</span>
                                        )}
                                    </td>
                                    <td className="admin-table__actions">
                                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(c)}>
                                            Edit
                                        </button>
                                        <button type="button" className="btn btn--danger btn--sm" onClick={() => deleteCandidate(c._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {candidates.length === 0 && (
                    <p className="admin-empty">No candidates yet. Add one above.</p>
                )}
            </section>

            {editing && currentEdit && (
                <div className="modal-overlay" onClick={closeEdit}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3 className="modal__title">Edit candidate</h3>
                            <button type="button" className="modal__close" onClick={closeEdit} aria-label="Close">
                                ×
                            </button>
                        </div>
                        <form onSubmit={saveEdit} className="admin-form">
                            <div className="admin-form__row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Party</label>
                                    <input
                                        value={editForm.party}
                                        onChange={(e) => setEditForm((f) => ({ ...f, party: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    value={editForm.address}
                                    onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                                />
                            </div>
                            <div className="admin-form__row">
                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        min="18"
                                        value={editForm.age}
                                        onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mobile</label>
                                    <input
                                        type="tel"
                                        value={editForm.mobile}
                                        onChange={(e) => setEditForm((f) => ({ ...f, mobile: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="admin-form__row admin-form__row--images">
                                <div className="form-group form-group--file">
                                    <label>Candidate photo</label>
                                    {currentEdit.candidateImage && (
                                        <img src={currentEdit.candidateImage} alt="" className="admin-thumb admin-thumb--prev" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEditCandidateImageFile(e.target.files?.[0] || null)}
                                    />
                                    <span className="form-hint">{editCandidateImageFile ? "New file selected" : "Leave empty to keep current"}</span>
                                </div>
                                <div className="form-group form-group--file">
                                    <label>Party logo</label>
                                    {currentEdit.partyImage && (
                                        <img src={currentEdit.partyImage} alt="" className="admin-thumb admin-thumb--logo admin-thumb--prev" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEditPartyImageFile(e.target.files?.[0] || null)}
                                    />
                                    <span className="form-hint">{editPartyImageFile ? "New file selected" : "Leave empty to keep current"}</span>
                                </div>
                            </div>
                            <div className="modal__actions">
                                <button type="button" className="btn btn--ghost" onClick={closeEdit}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn--primary" disabled={saving}>
                                    {saving ? "Saving…" : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
