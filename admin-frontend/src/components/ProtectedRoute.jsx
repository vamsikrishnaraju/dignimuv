// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    // redirect to login and remember attempted location
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
