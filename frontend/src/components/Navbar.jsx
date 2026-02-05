import { Link } from "react-router-dom";
import useAuth from "../auth/useAuth";

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <nav className="nav">
            <Link to="/candidates" className="nav__link">Candidates</Link>

            {!isAuthenticated && (
                <>
                    <Link to="/login" className="nav__link">Login</Link>
                    <Link to="/register" className="nav__link">Register</Link>
                </>
            )}

            {isAuthenticated && user?.role === "voter" && (
                <>
                    <Link to="/profile" className="nav__link">Profile</Link>
                    <Link to="/vote" className="nav__link">Vote</Link>
                    <button type="button" className="nav__logout" onClick={logout}>Logout</button>
                </>
            )}
            {isAuthenticated && user?.role === "admin" && (
                <>
                    <Link to="/admin" className="nav__link">Admin</Link>
                    <button type="button" className="nav__logout" onClick={logout}>Logout</button>
                </>
            )}
        </nav>
    );
};

export default Navbar;
