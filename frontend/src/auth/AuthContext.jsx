import { createContext, useContext, useState } from "react";
import { logoutUser } from "../api/auth.api";

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
  const [loading, setLoading] = useState(false);

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
