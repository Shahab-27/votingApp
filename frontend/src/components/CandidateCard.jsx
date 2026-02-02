const CandidateCard = ({ candidate, onVote, disabled }) => {
    return (
        <div className="card">
            <h4>{candidate.name}</h4>
            <p>{candidate.party}</p>

            {onVote && (
                <button onClick={() => onVote(candidate._id)} disabled={disabled}>
                    {disabled ? "Already Voted" : "Vote"}
                </button>
            )}
        </div>
    );
};

export default CandidateCard;
