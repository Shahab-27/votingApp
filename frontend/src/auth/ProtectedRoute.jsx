import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const ProtectedRoute = ({ children, role }) => {
    const { isAuthenticated, user, loading } = useAuthContext();

    // While checking auth from backend, avoid flashing a loader screen.
    // Just don't render anything until we know the auth result.
    const hasValidAuth = isAuthenticated && user;
    if (loading && !hasValidAuth) {
        return null;
    }

    // Not logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role mismatch
    if (role && user?.role !== role) {
        return <Navigate to="/login" replace />;
    }

    // Allowed
    return children;
};

export default ProtectedRoute;
