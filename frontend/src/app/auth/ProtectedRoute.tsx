import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const from = `${location.pathname}${location.search}`;
      navigate("/login", { replace: true, state: { from } });
    }
  }, [isAuthenticated, isLoading, location.pathname, location.search, navigate]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

