import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import useAuth from "../auth/useAuth";

const Login = () => {
    const [aadhaarNo, setAadhaarNo] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { setUser, setIsAuthenticated } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = await loginUser({
                aadhaarNo,
                password
            });

            console.log(data.user.role);
            
            // backend should return user info
            setUser(data.user);
            setIsAuthenticated(true);
            // redirect based on role (role is in data.user, not data)
            const role = data.user?.role;
            // Defer navigate so React commits auth state before ProtectedRoute checks it
            setTimeout(() => {
                if (role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/profile");
                }
            }, 0);
        } catch (err) {
            setError("Invalid Aadhaar or password");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h2>Login</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Aadhaar Number</label>
                    <input
                        type="text"
                        value={aadhaarNo}
                        onChange={(e) => setAadhaarNo(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
