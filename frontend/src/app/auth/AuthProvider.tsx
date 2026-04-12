import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/http";
import { clearAccessToken, getAccessToken, setAccessToken } from "../api/authStorage";
import type { AuthResponse, ProfileResponse, RegisterResponse } from "./types";

type AuthContextValue = {
  token: string | null;
  user: ProfileResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshMe: () => Promise<ProfileResponse | null>;
  login: (args: { email: string; password: string }) => Promise<ProfileResponse>;
  register: (args: { fullName: string; email: string; phone: string; password: string }) => Promise<RegisterResponse>;
  verifyEmail: (args: { email: string; code: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return getAccessToken();
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearAccessToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const currentToken = getAccessToken();
    if (!currentToken) {
      setUser(null);
      return null;
    }
    const me = await apiGet<ProfileResponse>("/users/me");
    setUser(me);
    return me;
  }, []);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const auth = await apiPost<AuthResponse, { email: string; password: string }>("/auth/login", {
      email,
      password,
    });
    setAccessToken(auth.accessToken);
    setToken(auth.accessToken);
    const me = await refreshMe();
    if (!me) {
      throw new Error("Unable to load profile after login");
    }
    return me;
  }, [refreshMe]);

  const register = useCallback(
    async ({ fullName, email, phone, password }: { fullName: string; email: string; phone: string; password: string }) => {
      return apiPost<RegisterResponse, { fullName: string; email: string; phone: string; password: string }>(
        "/auth/register",
        { fullName, email, phone, password },
      );
    },
    [],
  );

  const verifyEmail = useCallback(async ({ email, code }: { email: string; code: string }) => {
    await apiPost<string, { email: string; code: string }>("/auth/verify-email", { email, code });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (getAccessToken()) {
          await refreshMe();
        }
      } catch {
        // If token is invalid, clear it.
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [logout, refreshMe]);

  const value = useMemo<AuthContextValue>(() => {
    const isAuthenticated = !!token;
    const role = user?.role?.toUpperCase?.() ?? "";
    const isAdmin = role.includes("ADMIN");
    return {
      token,
      user,
      isLoading,
      isAuthenticated,
      isAdmin,
      refreshMe,
      login,
      register,
      verifyEmail,
      logout,
    };
  }, [token, user, isLoading, refreshMe, login, register, verifyEmail, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

