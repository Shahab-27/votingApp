import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children, role }) => {
    // ✅ FIRST read from the correct context
    const { isAuthenticated, user, loading } = useAuthContext();

    // ⏳ Wait until auth state is resolved
    if (loading) {
        return <Loader />;
    }

    // ❌ Not logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ❌ Role mismatch
    if (role && user?.role !== role) {
        return <Navigate to="/unauthorized" replace />;
    }

    // ✅ Allowed
    return children;
};

export default ProtectedRoute;
