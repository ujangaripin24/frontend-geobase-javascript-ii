export interface Location {
  id: string;
  name: string;
  category: string;
  latitude?: number;
  longitude?: number;
  distance_meters?: number;
  geometry?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface NearbyResponse {
  status: string;
  data: Location[];
  center: [number, number];
  radius_km: number;
  total_found: number;
}

export interface DistanceResponse {
  status: string;
  data: {
    from_location: string;
    to_location: string;
    distance_meters: number;
    distance_km: number;
  };
}

export interface PointInAreaResponse {
  status: string;
  point: { lng: number; lat: number };
  is_inside_any_area: boolean;
  areas_inside: Array<{
    id: string;
    name: string;
    area_type: string;
    is_inside: boolean;
    distance_to_area_meters: number;
  }>;
}

export interface RouteResponse {
  status: string;
  data: {
    from: string;
    to: string;
    straight_distance_meters: number;
    road_distance_meters: number;
    duration_seconds: number;
  };
}
