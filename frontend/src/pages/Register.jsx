import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

const Register = () => {
    const [form, setForm] = useState({
        username: "",
        aadhaarNo: "",
        password: "",
        role: "voter"
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        try {
            const res = await axiosInstance.post("/register", {
                data: {
                    ...form,
                    aadhaarNo: String(form.aadhaarNo).replace(/\D/g, "").slice(0, 12) || form.aadhaarNo
                }
            });
            const { UserData } = res.data;
            if (UserData) {
                // Token set in HTTP-only cookie by backend; full reload to rehydrate auth
                const path = UserData?.role === "admin" ? "/admin" : "/profile";
                window.location.href = path;
            } else {
                window.location.href = "/login";
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || "Registration failed";
            setError(msg);
        }
    };

    return (
        <div className="page container">
            <h2 className="page__title">Register</h2>

            {error && <p className="error">{error}</p>}

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
                    <label>Role</label>
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="voter">Voter</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit" className="button--primary">Register</button>
            </form>
        </div>
    );
};

export default Register;
