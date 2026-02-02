import { Link } from "react-router-dom";
import useAuth from "../auth/useAuth";

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
            <Link to="/candidates">Candidates</Link>{" | "}

            {!isAuthenticated && (
                <>
                    <Link to="/login">Login</Link>{" | "}
                    <Link to="/register">Register</Link>
                </>
            )}

            {isAuthenticated && user?.role === "user" && (
                <>
                    <Link to="/profile">Profile</Link>{" | "}
                    <Link to="/vote">Vote</Link>{" | "}
                    <button onClick={logout}>Logout</button>
                </>
            )}

            {isAuthenticated && user?.role === "admin" && (
                <>
                    <Link to="/admin">Admin Dashboard</Link>{" | "}
                    <button onClick={logout}>Logout</button>
                </>
            )}
        </nav>
    );
};

export default Navbar;
