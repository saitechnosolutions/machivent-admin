  // src/routes/ProtectedRoute.jsx
  import { useContext } from "react";
  import { Navigate } from "react-router-dom";
  import { AuthContext } from "../context/AuthContext";

  const ProtectedRoute = ({ children }) => {
    const { admin, loading } = useContext(AuthContext);

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!admin) return <Navigate to="/login" />;

    return children;
  };

  export default ProtectedRoute;
