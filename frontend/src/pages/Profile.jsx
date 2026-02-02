import useAuth from "../auth/useAuth";

const Profile = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return <p>No user data available</p>;
    }

    return (
        <div style={{ maxWidth: "600px", margin: "50px auto" }}>
            <h2>User Profile</h2>

            <p><strong>ID:</strong> {user._id}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Voted:</strong> {user.isVoted ? "Yes" : "No"}</p>

            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default Profile;
