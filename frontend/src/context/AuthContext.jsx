import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("vero_token") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize axios interceptor to attach token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // In a real app, you might verify the token here with a /me endpoint
      // For this prototype, if we have a token, we parse the user from local storage
      const savedUser = localStorage.getItem("vero_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    setIsLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post("http://localhost:8080/api/auth/login", { email, password });
    const { token: newToken, user: userData } = res.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("vero_token", newToken);
    localStorage.setItem("vero_user", JSON.stringify(userData));
  };

  const register = async (email, password, name) => {
    const res = await axios.post("http://localhost:8080/api/auth/register", { email, password, name });
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
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
