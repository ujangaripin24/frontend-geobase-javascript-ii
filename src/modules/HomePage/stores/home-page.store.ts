import { create } from "zustand";
import type { Location } from "../types/spatial.types";
import * as spatialService from "../services/home-page.service";

interface HomePageState {
  locations: Location[];
  nearbyLocations: Location[];
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  radiusKm: number;
  searchRadius: number;
  showRadius: boolean;
  radiusCenter: [number, number] | null;

  fetchAllLocations: () => Promise<void>;
  findNearby: (centerName: string, radiusKm: number) => Promise<void>;
  calculateDistanceBetween: (
    fromId: string,
    toId: string,
  ) => Promise<number | null>;
  checkPointInArea: (lng: number, lat: number) => Promise<void>;
  setSelectedLocation: (location: Location | null) => void;
  setRadius: (radius: number) => void;
  setShowRadius: (show: boolean) => void;
  clearNearby: () => void;
  setRadiusCenter: (center: [number, number] | null) => void;
}

export const useHomePageStore = create<HomePageState>((set, get) => ({
  locations: [],
  nearbyLocations: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  radiusKm: 1,
  searchRadius: 1,
  showRadius: false,
  radiusCenter: null,

  fetchAllLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await spatialService.getAllLocations();
      set({ locations: response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  findNearby: async (centerName: string, radiusKm: number) => {
    set({ isLoading: true, error: null, searchRadius: radiusKm });
    try {
      const response = await spatialService.findNearbyLocations({
        name: centerName,
        radius_km: radiusKm,
        limit: 50,
      });

      set({
        nearbyLocations: response.data || [],
        radiusCenter: response.center,
        showRadius: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  calculateDistanceBetween: async (fromId: string, toId: string) => {
    set({ isLoading: true });
    try {
      const response = await spatialService.calculateDistance(fromId, toId);
      set({ isLoading: false });
      return response.data.distance_meters;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  checkPointInArea: async (lng: number, lat: number) => {
    set({ isLoading: true });
    try {
      const response = await spatialService.checkPointInArea(lng, lat);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setRadius: (radius) => set({ radiusKm: radius }),
  setShowRadius: (show) => set({ showRadius: show }),
  clearNearby: () =>
    set({ nearbyLocations: [], showRadius: false, radiusCenter: null }),
  setRadiusCenter: (center) => set({ radiusCenter: center }),
}));
