import { create } from "zustand";
import { postDataLocation } from "../services/location-data.service";

interface LocationDataState {
  isLoading: boolean;
  error: string | null;
  postLocationData: (data: Record<string, any>) => Promise<void>;
}

export const useLocationDataStore = create<LocationDataState>((set) => ({
  isLoading: false,
  error: null,
  postLocationData: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await postDataLocation(data as any);

      set({ isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error:
          err.response?.data?.message || err.message || "Something went wrong",
      });
    }
  },
}));
