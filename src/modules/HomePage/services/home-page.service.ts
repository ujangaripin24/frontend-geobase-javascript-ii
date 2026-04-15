import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  const response = await api.get(`/v1/spatial/distance/${fromId}/${toId}`);
  return response.data;
};

export const checkPointInArea = async (lng: number, lat: number) => {
  const response = await api.get("/v1/spatial/point-in-area", {
    params: { lng, lat },
  });
  return response.data;
};

export const getAllLocations = async () => {
  const response = await api.get("/v1/items");
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

export default api;
