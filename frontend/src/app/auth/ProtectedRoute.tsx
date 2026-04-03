import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

