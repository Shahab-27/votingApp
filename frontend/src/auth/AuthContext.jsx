import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, logoutUser } from "../api/auth.api";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: () => {},
  setIsAuthenticated: () => {},
  setLoading: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Rehydrate from cookie (sent automatically with withCredentials)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data.user);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        setUser,
        setIsAuthenticated,
        setLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook
export const useAuthContext = () => {
  return useContext(AuthContext);
};
