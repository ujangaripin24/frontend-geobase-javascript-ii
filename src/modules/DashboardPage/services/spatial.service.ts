import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8100/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAllLocations = async () => {
  const response = await api.get("/v1/items");
  return response.data;
};

export const getLocationById = async (id: string) => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const findNearbyLocations = async (params: {
  name?: string;
  location_id?: string;
  radius_km: number;
  category?: string;
  limit?: number;
}) => {
  const response = await api.get("/v1/spatial/nearby", { params });
  return response.data;
};

export const calculateDistance = async (fromId: string, toId: string) => {
  const response = await api.get(`/spatial/distance/${fromId}/${toId}`);
  return response.data;
};

export const checkPointInArea = async (lng: number, lat: number) => {
  const response = await api.get("/v1/spatial/point-in-area", {
    params: { lng, lat },
  });
  return response.data;
};

export const findNearestNeighbors = async (params: {
  lng: number;
  lat: number;
  limit?: number;
  category?: string;
}) => {
  const response = await api.get("/v1/spatial/nearest", { params });
  return response.data;
};

export const findLocationsInArea = async (areaName: string) => {
  const response = await api.get("/v1/spatial/locations-in-area", {
    params: { area_name: areaName },
  });
  return response.data;
};

export const getLocationsGeoJSON = async () => {
  const response = await api.get("/v1/spatial/geojson/locations");
  return response.data;
};

export const getAreasGeoJSON = async () => {
  const response = await api.get("/v1/spatial/geojson/areas");
  return response.data;
};

export default api;
