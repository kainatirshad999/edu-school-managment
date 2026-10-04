import { createContext, useContext, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("eduflow_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async ({ email, password, role }) => {
    const { data } = await api.post("/auth/login", { email, password, role });
    localStorage.setItem("eduflow_token", data.token);
    localStorage.setItem("eduflow_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("eduflow_token");
    localStorage.removeItem("eduflow_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
