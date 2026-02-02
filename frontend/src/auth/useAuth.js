import { useAuthContext } from "./AuthContext";

const useAuth = () => {
    return useAuthContext();
};

export default useAuth;
