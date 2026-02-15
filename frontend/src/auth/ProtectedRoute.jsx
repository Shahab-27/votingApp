import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const ProtectedRoute = ({ children, role }) => {
    const { isAuthenticated, user, loading } = useAuthContext();

    // Not logged in
    if (!isAuthenticated) {
        console.warn("[ProtectedRoute] not authenticated, redirecting to /login", { role });
        return <Navigate to="/login" replace />;
    }

    // Role mismatch
    if (role) {
        const allowedRoles = Array.isArray(role) ? role : [role];
        if (!allowedRoles.includes(user?.role)) {
        console.warn("[ProtectedRoute] role mismatch, redirecting to /login", {
                expectedRole: role,
                actualRole: user?.role
            });
            return <Navigate to="/login" replace />;
        }
    }

    // Allowed
    console.log("[ProtectedRoute] access granted", { role, user });
    return children;
};

export default ProtectedRoute;
