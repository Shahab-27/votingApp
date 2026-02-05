import { useEffect, useState } from "react";
import { getAllCandidates } from "../api/candidate.api";
import { voteForCandidate } from "../api/vote.api";
import useAuth from "../auth/useAuth";

const Vote = () => {
    const [candidates, setCandidates] = useState([]);
    const [message, setMessage] = useState("");

    const { user, setUser } = useAuth();

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const data = await getAllCandidates();
                setCandidates(data || []);
            } catch (err) {
                setMessage("Failed to load candidates.");
            }
        };

        fetchCandidates();
    }, []);

    const handleVote = async (candidateId) => {
        try {
            await voteForCandidate(candidateId);
            setMessage("Vote recorded successfully.");

            // update local auth state
            if (user) {
                setUser({ ...user, isVoted: true });
            }
        } catch (err) {
            setMessage("You have already voted or are not allowed to vote.");
        }
    };

    return (
        <div className="page page--narrow">
            <h2 className="page__title">Cast your vote</h2>

            {message && <p className="info">{message}</p>}

            <ul className="list">
                {candidates.map((candidate) => (
                    <li key={candidate._id || candidate.aadhaarNo} className="list-item">
                        <div className="list-item__primary">
                            <strong>{candidate.name}</strong>
                        </div>
                        <div className="list-item__secondary">{candidate.party}</div>
                        <button
                            className="button button--primary button--small"
                            onClick={() => handleVote(candidate._id)}
                            disabled={user?.isVoted}
                        >
                            {user?.isVoted ? "Already voted" : "Vote"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Vote;

