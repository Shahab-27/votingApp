import AppRoutes from "./routes";
import { AuthProvider } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

const App = () => {
    return (
        <AuthProvider>
            <Navbar />
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;
