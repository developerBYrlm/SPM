import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

const userContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user login
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          return;
        }

        const response = await axios.get(
          "https://spm-1-u37a.onrender.com/api/auth/verify",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.user) setUser(response.data.user);
        else setUser(null);
      } catch (error) {
        console.error(error);
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // Save user after login
  const login = (userData) => setUser(userData);

  // Remove user and token
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <userContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </userContext.Provider>
  );
};

export const useAuth = () => useContext(userContext);
export default AuthContext;