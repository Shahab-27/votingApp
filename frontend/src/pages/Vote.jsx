import { useEffect, useState } from "react";
import { getAllCandidates } from "../api/candidate.api";
import { voteForCandidate } from "../api/vote.api";
import useAuth from "../auth/useAuth";

const Vote = () => {
    const [candidates, setCandidates] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const { user, setUser } = useAuth();

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const data = await getAllCandidates();
                setCandidates(data);
            } catch (err) {
                setMessage("Failed to load candidates");
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    const handleVote = async (candidateId) => {
        try {
            await voteForCandidate(candidateId);
            setMessage("Vote recorded successfully");

            // update local auth state
            setUser({ ...user, isVoted: true });
        } catch (err) {
            setMessage("You have already voted or are not allowed to vote");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: "600px", margin: "50px auto" }}>
            <h2>Vote for Your Candidate</h2>

            {message && <p>{message}</p>}

            <ul>
                {candidates.map((candidate, index) => (
                    <li key={index} style={{ marginBottom: "10px" }}>
                        <strong>{candidate.name}</strong> — {candidate.party}
                        <br />
                        <button
                            onClick={() => handleVote(candidate._id)}
                            disabled={user?.isVoted}
                        >
                            {user?.isVoted ? "Already Voted" : "Vote"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Vote;
