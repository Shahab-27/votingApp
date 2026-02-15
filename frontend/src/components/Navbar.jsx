import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../auth/useAuth";

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    console.log("[Navbar] Render", { isAuthenticated, user });

    const handleLogout = () => {
        console.log("[Navbar] Logout clicked");
        setMenuOpen(false);
        logout();
    };

    const goToProfile = () => {
        setMenuOpen(false);
        const path = user?.role === "admin" ? "/admin" : "/profile";
        console.log("[Navbar] Navigate to profile/dashboard", { path });
        navigate(path);
    };

    const toggleMenu = () => {
        setMenuOpen((open) => !open);
    };

    const userInitial = user?.username?.[0]?.toUpperCase() || "?";

    return (
        <nav className="nav">
            <Link to="/candidates" className="nav__brand">VoteNow </Link>
            <Link to="/candidates" className="nav__link">Candidates</Link>
            {isAuthenticated && user?.role === "voter" && (
                <Link to="/vote" className="nav__link">Vote</Link>
            )}

            {!isAuthenticated && (
                <>
                    <Link to="/login" className="nav__link">Login</Link>
                    <Link to="/register" className="nav__link">Register</Link>
                </>
            )}

            {isAuthenticated && (
                <div className="nav__profile">
                    <button
                        type="button"
                        className="nav__profile-toggle"
                        onClick={toggleMenu}
                    >
                        <span className="nav__avatar">{userInitial}</span>
                        <span className="nav__profile-name">{user?.username}</span>
                    </button>

                    {menuOpen && (
                        <div className="nav__profile-menu">
                            <button type="button" onClick={goToProfile} className="nav__profile-item">
                                {user?.role === "admin" ? "Admin dashboard" : "Profile"}
                            </button>
                            {user?.role === "candidate" && (
                                <button
                                    type="button"
                                    onClick={() => { setMenuOpen(false); navigate("/update-profile"); }}
                                    className="nav__profile-item"
                                >
                                    Update profile
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => { setMenuOpen(false); navigate("/change-password"); }}
                                className="nav__profile-item"
                            >
                                Change password
                            </button>
                            <button type="button" onClick={handleLogout} className="nav__profile-item nav__profile-item--danger">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
