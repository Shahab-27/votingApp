import { useState } from "react";
import { loginUser } from "../api/auth.api";

const Login = () => {
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

            // Use full page reload so auth state is rehydrated from token - avoids React timing issues
            const path = data.user?.role === "admin" ? "/admin" : "/profile";
            window.location.href = path;
        } catch (err) {
            setError("Invalid Aadhaar or password");
        }
    };

    return (
        <div className="page container">
            <h2 className="page__title">Login</h2>

            {error && <p className="error">{error}</p>}

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

                <button type="submit" className="button--primary">Login</button>
            </form>
        </div>
    );
};

export default Login;
