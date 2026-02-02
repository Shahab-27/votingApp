import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, logoutUser } from "../api/auth.api";

const AuthContext = createContext({
  user: null,
  setUser: () => {}
});


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // 🔁 Rehydrate auth state on page refresh
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setUser(data);
                setIsAuthenticated(true);
            } catch (error) {
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // 🚪 Logout handler
    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed");
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                setUser,
                setIsAuthenticated,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    return useContext(AuthContext);
};
