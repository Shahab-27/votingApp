import { useEffect, useState } from "react";
import { getAllCandidates } from "../api/candidate.api";

const Candidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const data = await getAllCandidates();
                setCandidates(data);
            } catch (err) {
                setError("Failed to load candidates");
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    if (loading) return <p>Loading candidates...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: "600px", margin: "50px auto" }}>
            <h2>Candidate List</h2>

            {candidates.length === 0 && <p>No candidates available</p>}

            <ul>
                {candidates.map((candidate, index) => (
                    <li key={index}>
                        <strong>{candidate.name}</strong> — {candidate.party}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Candidates;
