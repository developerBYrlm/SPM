import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const RoleBaseRoutes = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Wait until user check is complete
  if (loading) return <div>Loading...</div>;

  // Go to login if user is not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Block user if role is not allowed
  if (!requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBaseRoutes;