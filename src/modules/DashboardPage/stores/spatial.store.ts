import { create } from "zustand";
import { type Location } from "../types/spatial.types";
import * as spatialService from "../services/spatial.service";

interface SpatialState {
  locations: Location[];
  nearbyLocations: Location[];
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;

  radiusKm: number;
  showRadius: boolean;
  radiusCenter: [number, number] | null;
  locationsGeoJSON: any;
  areasGeoJSON: any;

  fetchAllLocations: () => Promise<void>;
  fetchGeoJSONData: () => Promise<void>;
  findNearby: (centerName: string, radiusKm: number) => Promise<void>;
  clearNearby: () => void;
  setSelectedLocation: (location: Location | null) => void;
  setRadius: (radius: number) => void;
}

export const useSpatialStore = create<SpatialState>((set, get) => ({
  locations: [],
  nearbyLocations: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  radiusKm: 1,
  showRadius: false,
  radiusCenter: null,
  locationsGeoJSON: null,
  areasGeoJSON: null,

  fetchAllLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await spatialService.getAllLocations();
      set({ locations: response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchGeoJSONData: async () => {
    try {
      const [locationsGeo, areasGeo] = await Promise.all([
        spatialService.getLocationsGeoJSON(),
        spatialService.getAreasGeoJSON(),
      ]);
      set({ locationsGeoJSON: locationsGeo, areasGeoJSON: areasGeo });
    } catch (error: any) {
      console.error("Failed to fetch GeoJSON:", error);
    }
  },

  findNearby: async (centerName: string, radiusKm: number) => {
    set({ isLoading: true, error: null });
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
        radiusKm: radiusKm,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearNearby: () => {
    set({
      nearbyLocations: [],
      showRadius: false,
      radiusCenter: null,
    });
  },

  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setRadius: (radius) => set({ radiusKm: radius }),
}));
