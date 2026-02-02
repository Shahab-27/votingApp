import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";
import Loader from "../components/Loader";



const ProtectedRoute = ({ children, role }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // ⏳ Wait until auth state is resolved
    if (loading) {
        return <Loader />;
    }

    // ❌ Not logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ❌ Role mismatch (admin / user)
    if (role && user?.role !== role) {
        return <Navigate to="/unauthorized" replace />;
    }
    

    // ✅ Allowed
    return children;
};

export default ProtectedRoute;
