import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import useAuth from "../auth/useAuth";

const Login = () => {
    const navigate = useNavigate();
    const { setUser, setIsAuthenticated } = useAuth();
    const [aadhaarNo, setAadhaarNo] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = await loginUser({
                aadhaarNo,
                password
            });

            const path = data.user?.role === "admin" ? "/admin" : "/profile";
            // Update auth context and navigate within SPA
            setUser(data.user);
            setIsAuthenticated(true);
            navigate(path, { replace: true });
        } catch (err) {
            setError("Invalid Aadhaar or password");
        }
    };

    return (
        <div className="page auth-page">
            <h2 className="page__title">Login</h2>

            {error && <p className="alert alert--error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Aadhaar number</label>
                    <input
                        type="text"
                        value={aadhaarNo}
                        onChange={(e) => setAadhaarNo(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn--primary">Login</button>
            </form>

            <div className="login-links">
                <Link to="/forgot-password" className="login-links__left">Forgot password?</Link>
                <Link to="/register" className="login-links__right">Not a voter?</Link>
            </div>
        </div>
    );
};

export default Login;
