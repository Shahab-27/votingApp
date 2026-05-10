import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { getFeed, likePost, unlikePost } from "../api/feed.api";

const DUMMY_FEED = [
    {
        _id: "dummy-1",
        image: "https://images.pexels.com/photos/1550351/pexels-photo-1550351.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Stronger local schools, better teachers, and transparent funding for every child.",
        candidate: { name: "Ananya Rao", party: "People's Reform Party", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
    {
        _id: "dummy-2",
        image: "https://images.pexels.com/photos/1464210/pexels-photo-1464210.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Clean drinking water and 24/7 electricity for every neighbourhood.",
        candidate: { name: "Rahul Deshmukh", party: "Jan Vikas Morcha", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
    {
        _id: "dummy-3",
        image: "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "More jobs through small business loans and startup support.",
        candidate: { name: "Sara Thomas", party: "Progress Alliance", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
    {
        _id: "dummy-4",
        image: "https://images.pexels.com/photos/1007025/pexels-photo-1007025.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Safer streets with better lighting and modern CCTV coverage.",
        candidate: { name: "Imran Qureshi", party: "Citizen First Front", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
    {
        _id: "dummy-5",
        image: "https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Digital services at every ward office to cut queues and corruption.",
        candidate: { name: "Meera Banerjee", party: "Digital India Bloc", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
    {
        _id: "dummy-6",
        image: "https://images.pexels.com/photos/7103192/pexels-photo-7103192.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Affordable healthcare and free annual checkups at local clinics.",
        candidate: { name: "Vikram Shetty", party: "Jan Seva Party", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
    {
        _id: "dummy-7",
        image: "https://images.pexels.com/photos/3183171/pexels-photo-3183171.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "More green parks and playgrounds for families and children.",
        candidate: { name: "Priya Nair", party: "Green Future Forum", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
    {
        _id: "dummy-8",
        image: "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Transparent budgets published online every quarter.",
        candidate: { name: "Arjun Malhotra", party: "Accountability League", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
    {
        _id: "dummy-9",
        image: "https://images.pexels.com/photos/3184303/pexels-photo-3184303.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Skill training for youth to prepare for future jobs.",
        candidate: { name: "Neha Kulkarni", party: "Youth Progress Party", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
    {
        _id: "dummy-10",
        image: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Better public transport with safer, cleaner buses.",
        candidate: { name: "Dev Patel", party: "Public Transit Coalition", candidateImage: "" },
        likeCount: 0,
        userLiked: false,
        isDummy: true,
    },
];

const Feed = () => {
    const { isAuthenticated } = useAuth();
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [togglingLikeId, setTogglingLikeId] = useState(null);

    const fetchFeed = async () => {
        try {
            setError("");
            const list = await getFeed();
            const safeList = Array.isArray(list) ? list : [];
            setFeed(safeList.length > 0 ? safeList : DUMMY_FEED);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load feed.");
            setFeed([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleLikeToggle = async (post) => {
        if (post.isDummy || !isAuthenticated || togglingLikeId) return;
        const id = post._id;
        setTogglingLikeId(id);
        try {
            const data = post.userLiked ? await unlikePost(id) : await likePost(id);
            setFeed((prev) =>
                prev.map((p) =>
                    p._id === id
                        ? { ...p, userLiked: data.liked, likeCount: data.likeCount }
                        : p
                )
            );
        } catch (_) {
            // keep UI state
        } finally {
            setTogglingLikeId(null);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <h1 className="page__title">Feed</h1>
                <p className="muted-text">Loading…</p>
            </div>
        );
    }

    return (
        <div className="page">
            <h1 className="page__title">Feed</h1>
            <p className="muted-text" style={{ marginTop: 0 }}>
                Campaign posters and manifestos from candidates. Like posts to show support.
            </p>
            {error && (
                <div className="alert alert--error" role="alert">
                    {error}
                </div>
            )}
            {feed.length === 0 && !error && (
                <p className="muted-text">No posts in the feed yet. Approved campaigns will appear here.</p>
            )}
            <div className="feed-list">
                {feed.map((post) => (
                    <article key={post._id} className="feed-card">
                        <div className="feed-card__header">
                            {post.candidate?.candidateImage ? (
                                <img
                                    src={post.candidate.candidateImage}
                                    alt=""
                                    className="feed-card__avatar"
                                />
                            ) : (
                                <div className="feed-card__avatar feed-card__avatar--placeholder">
                                    {post.candidate?.name?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                            <div className="feed-card__meta">
                                <strong className="feed-card__name">{post.candidate?.name || "Candidate"}</strong>
                                <span className="feed-card__party">{post.candidate?.party || ""}</span>
                            </div>
                        </div>
                        <div className="feed-card__image-wrap">
                            <img src={post.image} alt="" className="feed-card__image" />
                        </div>
                        {post.caption && (
                            <p className="feed-card__caption">{post.caption}</p>
                        )}
                        <div className="feed-card__actions">
                            <button
                                type="button"
                                className={`feed-card__like ${post.userLiked ? "feed-card__like--active" : ""}`}
                                onClick={() => handleLikeToggle(post)}
                                disabled={post.isDummy || !isAuthenticated || togglingLikeId === post._id}
                                title={
                                    post.isDummy
                                        ? "Sample post"
                                        : isAuthenticated
                                            ? (post.userLiked ? "Unlike" : "Like")
                                            : "Log in to like"
                                }
                            >
                                {post.userLiked ? "♥" : "♡"} {post.likeCount ?? 0}
                            </button>
                        </div>
                    </article>
                ))}
            </div>
            {!isAuthenticated && (
                <p className="muted-text" style={{ marginTop: "1rem" }}>
                    <Link to="/login">Log in</Link> to like posts.
                </p>
            )}
        </div>
    );
};

export default Feed;
