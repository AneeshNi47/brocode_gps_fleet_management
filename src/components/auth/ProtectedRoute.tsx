// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../lib/erp-oauth";
import { JSX } from "react";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const loc = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={`/auth/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  }

  return children;
}