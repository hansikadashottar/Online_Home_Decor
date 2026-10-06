import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

function isTokenExpired(token) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return false;
    }

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return decoded.exp ? decoded.exp * 1000 < Date.now() : false;
  } catch {
    return false;
  }
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [fullName, setFullName] = useState(localStorage.getItem("fullName"));
  const [email, setEmail] = useState(localStorage.getItem("email"));

  const logout = () => {
    ["token", "role", "userId", "fullName", "email"].forEach((key) =>
      localStorage.removeItem(key)
    );

    setToken(null);
    setRole(null);
    setUserId(null);
    setFullName(null);
    setEmail(null);
  };

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
  }, [token]);

  const login = (newToken, newRole, userData = {}) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);

    if (userData.userId !== undefined && userData.userId !== null) {
      localStorage.setItem("userId", userData.userId);
      setUserId(userData.userId);
    }

    if (userData.fullName) {
      localStorage.setItem("fullName", userData.fullName);
      setFullName(userData.fullName);
    }

    if (userData.email) {
      localStorage.setItem("email", userData.email);
      setEmail(userData.email);
    }

    setToken(newToken);
    setRole(newRole);
  };

  const updateUserData = (userData = {}) => {
    if (userData.userId !== undefined && userData.userId !== null) {
      localStorage.setItem("userId", userData.userId);
      setUserId(userData.userId);
    }

    if (userData.fullName) {
      localStorage.setItem("fullName", userData.fullName);
      setFullName(userData.fullName);
    }

    if (userData.email) {
      localStorage.setItem("email", userData.email);
      setEmail(userData.email);
    }
  };

  const isAuthenticated = Boolean(token && !isTokenExpired(token));

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        userId,
        fullName,
        email,
        isAuthenticated,
        login,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
