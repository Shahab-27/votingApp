import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import UpdateProfile from "../pages/UpdateProfile";
import Candidates from "../pages/Candidates";
import Vote from "../pages/Vote";
import AdminDashboard from "../pages/AdminDashboard";
import CandidatePayment from "../pages/CandidatePayment";

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
                    <ProtectedRoute role={["voter", "candidate"]}>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/vote"
                element={
                    <ProtectedRoute role="voter">
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

            {/* Candidate update profile */}
            <Route
                path="/update-profile"
                element={
                    <ProtectedRoute role="candidate">
                        <UpdateProfile />
                    </ProtectedRoute>
                }
            />

            {/* Candidate payment */}
            <Route
                path="/candidate-payment"
                element={
                    <ProtectedRoute role="candidate">
                        <CandidatePayment />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/candidate-payment/success"
                element={
                    <ProtectedRoute role="candidate">
                        <CandidatePayment />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/candidate-payment/cancelled"
                element={
                    <ProtectedRoute role="candidate">
                        <CandidatePayment />
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Login />} />
        </Routes>
    );
};

export default AppRoutes;
