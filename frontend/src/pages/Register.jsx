import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../auth/useAuth";
import uploadAadhaarDoc from "../api/aadhaar.api";

const Register = () => {
    const [form, setForm] = useState({
        username: "",
        aadhaarNo: "",
        password: "",
        role: "voter",
        email: "",
    });
    const [aadhaarFile, setAadhaarFile] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser, setIsAuthenticated } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        try {
            let aadhaarDocUrl;
            if (form.role === "candidate" && aadhaarFile) {
                aadhaarDocUrl = await uploadAadhaarDoc(aadhaarFile);
            }

            const res = await axiosInstance.post("/register", {
                data: {
                    ...form,
                    aadhaarNo: String(form.aadhaarNo).replace(/\D/g, "").slice(0, 12) || form.aadhaarNo,
                    aadhaarDocUrl,
                }
            });
            const { UserData } = res.data;
            if (UserData) {
                // Update auth context and navigate within SPA
                setUser(UserData);
                setIsAuthenticated(true);
                const path =
                    UserData?.role === "admin"
                        ? "/admin"
                        : "/profile";
                navigate(path, { replace: true });
            } else {
                navigate("/login", { replace: true });
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || "Registration failed";
            setError(msg);
        }
    };

    return (
        <div className="page auth-page">
            <h2 className="page__title">Create account</h2>

            {error && <p className="alert alert--error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name</label>
                    <input name="username" placeholder="Full name" value={form.username} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Aadhaar number (12 digits)</label>
                    <input name="aadhaarNo" placeholder="Aadhaar number" value={form.aadhaarNo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Password (letters and numbers, min 6)</label>
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="voter">Voter</option>
                        <option value="admin">Admin</option>
                        <option value="candidate">Candidate</option>
                    </select>
                </div>
                {form.role === "candidate" && (
                    <>
                        <div className="form-group">
                            <label>Aadhaar document (image/pdf)</label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                            />
                        </div>
                    </>
                )}
                <button type="submit" className="btn btn--primary">Register</button>
            </form>
        </div>
    );
};

export default Register;
