import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, logoutUser } from "../api/auth.api";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: () => {},
  setIsAuthenticated: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log("AUTH CONTEXT RENDER → loading:", loading);

  // 🔁 Rehydrate auth state (on app load / refresh)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(); // backend validates cookie
        setUser(data.user);              // ✅ ONLY user object
        setIsAuthenticated(true);
        console.log("AUTH REHYDRATED:", data.user);
      } catch (error) {
        console.log("NO ACTIVE SESSION");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        console.log("🔥 SETTING LOADING FALSE");
        setLoading(false);
      }
    };

    fetchProfile(); // ✅ ALWAYS call, server decides auth
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
