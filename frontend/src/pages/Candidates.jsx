import { useEffect, useState } from "react";
import { getAllCandidates } from "../api/candidate.api";

const Candidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const data = await getAllCandidates();
                setCandidates(data || []);
            } catch (err) {
                setError("Failed to load candidates");
            }
        };

        fetchCandidates();
    }, []);

    return (
        <div className="page page--narrow">
            <h2 className="page__title">Candidate list</h2>

            {error && <p className="error">{error}</p>}

            {candidates.length === 0 && !error && (
                <p className="muted-text">No candidates available.</p>
            )}

            <ul className="list">
                {candidates.map((candidate) => (
                    <li key={candidate._id || candidate.aadhaarNo} className="list-item">
                        <div className="list-item__primary">
                            <strong>{candidate.name}</strong>
                        </div>
                        <div className="list-item__secondary">{candidate.party}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Candidates;
