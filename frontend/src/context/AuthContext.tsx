import { useEffect, useState, type ReactNode } from "react";

import { getCurrentUser, logoutUser } from "../services/api";
import { AuthContext, type User } from "./auth-context";
import type { DoctorApplicationStatus } from "../features/doctors/types";
import {
  getMyDoctorApplicationStatus,
  getMyDoctorProfile,
} from "../features/doctors/services/doctor.service";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorApplicationStatus, setDoctorApplicationStatus] =
    useState<DoctorApplicationStatus | undefined>(undefined);
  const [isDoctorEligible, setIsDoctorEligible] = useState(false);

  async function refreshUser() {
    try {
      const result = await getCurrentUser();
      const currentUser = result.data.user as User;
      const [application, doctorEligibility] = await Promise.all([
        getMyDoctorApplicationStatus()
          .then((value) => value.licenseVerificationStatus)
          .catch(() => undefined),
        currentUser.role === "DOCTOR"
          ? getMyDoctorProfile()
              .then(() => true)
              .catch(() => false)
          : Promise.resolve(false),
      ]);

      setUser(currentUser);
      setDoctorApplicationStatus(application);
      setIsDoctorEligible(doctorEligibility);
    } catch {
      setUser(null);
      setDoctorApplicationStatus(undefined);
      setIsDoctorEligible(false);
    }
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setDoctorApplicationStatus(undefined);
      setIsDoctorEligible(false);
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
        doctorApplicationStatus,
        isDoctor: user?.role === "DOCTOR" && isDoctorEligible,
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
