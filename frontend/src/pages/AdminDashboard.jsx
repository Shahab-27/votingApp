import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AdminDashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [name, setName] = useState("");
    const [party, setParty] = useState("");
    const [address, setAddress] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchCandidates = async () => {
        try {
            const res = await axiosInstance.get("/allCandidates");
            setCandidates(res.data || []);
        } catch (err) {
            setMessage("Failed to load candidates");
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const addCandidate = async () => {
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
            setMessage("Candidate added successfully");
            fetchCandidates();
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to add candidate");
        }
    };

    const deleteCandidate = async (id) => {
        try {
            setMessage("");
            await axiosInstance.delete(`/${id}`);
            fetchCandidates();
        } catch (err) {
            setMessage("Delete failed");
        }
    };

    return (
        <div style={{ maxWidth: "700px", margin: "50px auto" }}>
            <h2>Admin Dashboard</h2>

            {message && <p>{message}</p>}

            <h3>Add Candidate</h3>
            <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                placeholder="Party"
                value={party}
                onChange={(e) => setParty(e.target.value)}
            />
            <input
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <button onClick={addCandidate}>Add</button>

            <h3>All Candidates</h3>
            {loading && <p>Loading...</p>}
            <ul>
                {candidates.map((c) => (
                    <li key={c._id}>
                        {c.name} — {c.party}
                        <button
                            style={{ marginLeft: "10px" }}
                            onClick={() => deleteCandidate(c._id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
