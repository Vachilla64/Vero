import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("vero_token") || null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.get("/api/user/profile");
      setUser(res.data);
      localStorage.setItem("vero_user", JSON.stringify(res.data));
    } catch (e) {
      console.error("Failed to refresh user profile", e);
    }
  };

  // Initialize axios interceptor to attach token and handle global auth errors
  useEffect(() => {
    const resInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403 && error.response.data?.error === 'Invalid or expired token') {
          // Token expired, log user out globally
          setToken(null);
          setUser(null);
          localStorage.removeItem("vero_token");
          localStorage.removeItem("vero_user");
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const savedUser = localStorage.getItem("vero_user");
      if (savedUser && savedUser !== "undefined") {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Corrupted local storage data. Clearing...", e);
          localStorage.removeItem("vero_user");
          localStorage.removeItem("vero_token");
        }
      }
      refreshProfile(); // Fetch fresh profile (premium status, lookup count)
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
    setIsLoading(false);

    return () => {
      api.interceptors.response.eject(resInterceptor);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { token: newToken, user: userData } = res.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("vero_token", newToken);
    localStorage.setItem("vero_user", JSON.stringify(userData));
  };

  const register = async (email, password, name) => {
    const res = await api.post("/api/auth/register", { email, password, name });
    const { token: newToken, user: userData } = res.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("vero_token", newToken);
    localStorage.setItem("vero_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("vero_token");
    localStorage.removeItem("vero_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
