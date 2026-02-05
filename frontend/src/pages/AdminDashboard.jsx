import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AdminDashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [name, setName] = useState("");
    const [party, setParty] = useState("");
    const [address, setAddress] = useState("");
    const [message, setMessage] = useState("");

    const fetchCandidates = async () => {
        try {
            const res = await axiosInstance.get("/allCandidates");
            setCandidates(res.data || []);
        } catch (err) {
            setMessage("Failed to load candidates.");
            setCandidates([]);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const addCandidate = async (e) => {
        e?.preventDefault();
        try {
            setMessage("");
            await axiosInstance.post("/registerCandidate", {
                name,
                party,
                address: address || "N/A"
            });
            setName("");
            setParty("");
            setAddress("");
            setMessage("Candidate added.");
            fetchCandidates();
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to add candidate.");
        }
    };

    const deleteCandidate = async (id) => {
        try {
            setMessage("");
            await axiosInstance.delete(`/${id}`);
            fetchCandidates();
        } catch (err) {
            setMessage(err.response?.data?.error || "Delete failed.");
        }
    };

    return (
        <div className="page page--narrow">
            <h2 className="page__title">Admin dashboard</h2>

            {message && <p className={message.includes("added") ? "success" : "error"}>{message}</p>}

            <section className="card">
                <h3 className="section-title">Add candidate</h3>
                <form onSubmit={addCandidate}>
                    <div className="form-group">
                        <input
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            placeholder="Party"
                            value={party}
                            onChange={(e) => setParty(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            placeholder="Address (optional)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="button--primary">Add</button>
                </form>
            </section>

            <h3 className="section-title">All candidates</h3>
            <ul className="list">
                {candidates.map((c) => (
                    <li key={c._id} className="list-item">
                        <div className="list-item__primary"><strong>{c.name}</strong></div>
                        <div className="list-item__secondary">{c.party}</div>
                        <button type="button" className="button--small" onClick={() => deleteCandidate(c._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
