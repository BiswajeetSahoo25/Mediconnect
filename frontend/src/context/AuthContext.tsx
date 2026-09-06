import { useEffect, useState, type ReactNode } from "react";

import { getCurrentUser, logoutUser } from "../services/api";
import { AuthContext, type User } from "./auth-context";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser() {
    try {
      const result = await getCurrentUser();

      setUser(result.data.user);
    } catch {
      setUser(null);
    }
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    async function initializeAuth() {
      await refreshUser();
      setIsLoading(false);
    }

    initializeAuth();
  }, []);

  useEffect(() => {
    function handleAuthFailure() {
      setUser(null);
    }

    window.addEventListener("auth:failed", handleAuthFailure);

    return () => {
      window.removeEventListener("auth:failed", handleAuthFailure);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
