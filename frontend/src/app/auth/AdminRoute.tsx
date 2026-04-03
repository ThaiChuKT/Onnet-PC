import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, isAuthenticated, isLoading, navigate]);

  if (isLoading) return null;
  if (!isAuthenticated || !isAdmin) return null;
  return <>{children}</>;
}

