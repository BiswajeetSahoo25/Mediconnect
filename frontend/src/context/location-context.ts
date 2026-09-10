import type { UserLocation } from "../services/location.service";

export interface LocationContextValue {
  location: UserLocation | null;
  loading: boolean;
  error: string;
  refreshLocation: () => Promise<void>;
}