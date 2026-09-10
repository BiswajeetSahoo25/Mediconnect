import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  getCurrentLocation,
  type UserLocation,
} from "../services/location.service";
import type { LocationContextValue } from "./location-context";

export const LocationContext = createContext<LocationContextValue | null>(null);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to get your location",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        loading,
        error,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
