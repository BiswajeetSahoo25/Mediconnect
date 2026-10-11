import { useEffect, useState, type ReactNode } from "react";

import { getCurrentUser, logoutUser } from "../services/api";
import { AuthContext, type User } from "./auth-context";
import { getMyDoctorApplicationStatus } from "../features/doctors/services/doctor.service";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDoctorApplication, setHasDoctorApplication] = useState(false);

  async function refreshUser() {
    try {
      const result = await getCurrentUser();
      setUser(result.data.user);
      try {
        const application = await getMyDoctorApplicationStatus();
        setHasDoctorApplication(application.hasApplication);
      } catch {
        setHasDoctorApplication(false);
      }
    } catch {
      setUser(null);
      setHasDoctorApplication(false);
    }
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setHasDoctorApplication(false);
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
        hasDoctorApplication,
        isDoctor: user?.role === "DOCTOR",
        isPatient: user?.role === "PATIENT",
        isAdmin: user?.role === "ADMIN",
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
