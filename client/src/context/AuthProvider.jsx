import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { apiService } from "../api/apiService.js";

export const AuthProvider = ({ children }) => {
  // Checks for token in local storage
  const [token, setToken] = useState(localStorage.getItem("token"));
  // User data stored here
  const [user, setUser] = useState(null);
  // Starts as true so that the dashbaord doesn't load until user is signed in
  const [loading, setLoading] = useState(true);

  const login = async ({ token, data }) => {
    localStorage.setItem("token", token);

    setToken(token);
    setUser(data);
    setLoading(false);
  };

  const logout = async () => {
    console.log("Logging out!");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setLoading(false);
  };

  useEffect(() => {
    const authorize = async () => {
      if (token && !user) {
        try {
          const result = await apiService.getMe();
          if (result && result.data) {
            setUser(result.data);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Authorization error:", err.message);
          logout();
        }
      } else if (!token) {
        setUser(null);
      }

      setLoading(false);
    };
    authorize();
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
