import axios from "axios";
import type { AddLocation } from "../types/location-data.type";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const postDataLocation = async (payload: AddLocation) => {
  const { data } = await api.post("/v1/spatial/locations/create", payload);
  return data;
};
