// src/routes/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { admin } = useContext(AuthContext);

  // If already logged in, redirect to dashboard
  if (admin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PublicRoute;
