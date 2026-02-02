import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const Register = () => {
    const [form, setForm] = useState({
        username: "",
        aadhaarNo: "",
        password: "",
        role: "voter"
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await axiosInstance.post("/register", {
                data: form
            });
            navigate("/login");
        } catch (err) {
            setError("Registration failed");
        }
    };

    return (
        <div className="container">
            <h2>Register</h2>

            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <input name="username" placeholder="Name" onChange={handleChange} required />
                <input name="aadhaarNo" placeholder="Aadhar Number" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

                <select name="role" onChange={handleChange}>
                    <option value="voter">User</option>
                    <option value="admin">Admin</option>
                </select>

                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
