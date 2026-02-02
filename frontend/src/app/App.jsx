import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import Candidates from "../pages/Candidates";
import Vote from "../pages/Vote";
import AdminDashboard from "../pages/AdminDashboard";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/candidates" element={<Candidates />} />

            {/* User protected routes */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute role="user">
                        <Profile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/vote"
                element={
                    <ProtectedRoute role="user">
                        <Vote />
                    </ProtectedRoute>
                }
            />

            {/* Admin protected routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default AppRoutes;
