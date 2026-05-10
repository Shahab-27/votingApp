import { useEffect, useState } from "react";
import { getAllCandidates } from "../api/candidate.api";
import { voteForCandidate, removeVote } from "../api/vote.api";
import useAuth from "../auth/useAuth";

const Vote = () => {
    const [candidates, setCandidates] = useState([]);
    const [message, setMessage] = useState("");
    const [removing, setRemoving] = useState(false);
    const { user, setUser } = useAuth();
    const canVote = user?.role === "voter" || user?.role === "candidate";

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
            setMessage("");
            await voteForCandidate(candidateId);
            setMessage("Vote recorded successfully.");
            if (user) {
                setUser({ ...user, isVoted: true });
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "You have already voted or are not allowed to vote.");
        }
    };

    const handleRemoveVote = async () => {
        try {
            setMessage("");
            setRemoving(true);
            await removeVote();
            setMessage("Vote removed successfully.");
            if (user) {
                setUser({ ...user, isVoted: false });
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to remove vote.");
        } finally {
            setRemoving(false);
        }
    };

    // Extra safety: block any unexpected roles (admins, etc.)
    if (!canVote) {
        return (
            <div className="page vote-page">
                <h2 className="page__title">Cast your vote</h2>
                <p className="muted-text">You are not allowed to access the voting page.</p>
            </div>
        );
    }

    return (
        <div className="page vote-page">
            <h2 className="page__title">Cast your vote</h2>

            {message && (
                <p className={message.includes("success") ? "alert alert--success" : "alert alert--error"}>
                    {message}
                </p>
            )}

            {user?.isVoted && (
                <div className="vote-page__remove">
                    <span className="muted-text">You have already voted.</span>
                    <button
                        type="button"
                        className="btn btn--danger"
                        onClick={handleRemoveVote}
                        disabled={removing}
                    >
                        {removing ? "Removing…" : "Remove your vote"}
                    </button>
                </div>
            )}

            {candidates.length === 0 && !message && (
                <p className="muted-text">No candidates available to vote.</p>
            )}

            {candidates.map((candidate) => (
                <div key={candidate._id} className="vote-card">
                    <div className="vote-card__media">
                        {candidate.candidateImage ? (
                            <img
                                src={candidate.candidateImage}
                                alt={candidate.name}
                                className="vote-card__avatar"
                            />
                        ) : (
                            <div className="vote-card__avatar vote-card__avatar--placeholder">
                                {candidate.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                        )}
                        {candidate.partyImage && (
                            <img
                                src={candidate.partyImage}
                                alt=""
                                className="vote-card__party-logo"
                            />
                        )}
                        <div className="vote-card__info">
                            <div className="vote-card__name">{candidate.name}</div>
                            <p className="vote-card__party">{candidate.party}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => handleVote(candidate._id)}
                        disabled={user?.isVoted}
                    >
                        {user?.isVoted ? "Already voted" : "Vote"}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Vote;
