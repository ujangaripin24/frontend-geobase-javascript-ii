import React, { useEffect, useRef, useState } from "react";
import AppNavbar from "../../../layouts/AppNavbar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSpatialStore } from "../stores/spatial.store";
import {
  TextField,
  Button,
  Slider,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { FaClosedCaptioning, FaLocationArrow } from "react-icons/fa";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

const DashboardPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const radiusLayerRef = useRef<string | null>(null);

  const [searchCenter, setSearchCenter] = useState("Kantor Pusat");
  const [radiusKm, setRadiusKm] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    locations,
    nearbyLocations,
    isLoading,
    error,
    showRadius,
    radiusCenter,
    fetchAllLocations,
    findNearby,
    clearNearby,
    fetchGeoJSONData,
  } = useSpatialStore();

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  const clearRadius = () => {
    if (mapRef.current && radiusLayerRef.current) {
      if (mapRef.current.getLayer(radiusLayerRef.current)) {
        mapRef.current.removeLayer(radiusLayerRef.current);
      }
      if (mapRef.current.getSource(radiusLayerRef.current)) {
        mapRef.current.removeSource(radiusLayerRef.current);
      }
      radiusLayerRef.current = null;
    }
  };

  const drawRadiusCircle = (center: [number, number], radiusKm: number) => {
    if (!mapRef.current) return;

    clearRadius();

    const radiusDeg = radiusKm / 111;
    const points = [];
    const steps = 64;
    const centerLng = center[0];
    const centerLat = center[1];

    for (let i = 0; i <= steps; i++) {
      const angle = (i * 360 * Math.PI) / 180 / steps;
      const dx = radiusDeg * Math.cos(angle);
      const dy =
        (radiusDeg * Math.sin(angle)) / Math.cos((centerLat * Math.PI) / 180);
      points.push([centerLng + dx, centerLat + dy]);
    }
    points.push(points[0]);

    const circleGeoJSON = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [points],
      },
      properties: {},
    };

    const sourceId = "radius-source";
    const layerId = "radius-layer";

    if (mapRef.current.getSource(sourceId)) {
      (mapRef.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(
        circleGeoJSON,
      );
    } else {
      mapRef.current.addSource(sourceId, {
        type: "geojson",
        data: circleGeoJSON,
      });

      mapRef.current.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.2,
          "fill-outline-color": "#2563eb",
        },
      });

      radiusLayerRef.current = layerId;
    }
  };

  const addMarkers = (
    locationList: any[],
    color: string = "#ef4444",
    isNearby: boolean = false,
  ) => {
    if (!mapRef.current) return;

    locationList.forEach((location) => {
      let lng, lat;

      if (location.geometry?.coordinates) {
        lng = location.geometry.coordinates[0];
        lat = location.geometry.coordinates[1];
      } else if (location.longitude && location.latitude) {
        lng = location.longitude;
        lat = location.latitude;
      } else {
        return;
      }

      const el = document.createElement("div");
      el.className = "marker";
      el.style.backgroundColor = color;
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.borderRadius = "50%";
      el.style.border = "3px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.innerHTML = isNearby ? "📍" : "🏢";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; min-width: 150px;">
          <strong style="font-size: 14px;">${location.name}</strong><br/>
          <span style="font-size: 12px; color: #666;">${location.category || "Tidak ada kategori"}</span>
          ${
            location.distance_meters
              ? `<br/><span style="font-size: 12px; color: #3b82f6;">📏 Jarak: ${(location.distance_meters / 1000).toFixed(2)} km</span>`
              : ""
          }
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  };

  const handleSearchNearby = async () => {
    clearMarkers();
    await findNearby(searchCenter, radiusKm);
  };

  const handleReset = () => {
    clearMarkers();
    clearRadius();
    clearNearby();
    if (locations.length > 0) {
      addMarkers(locations, "#3b82f6", false);
    }
  };

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    setSearchCenter(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  useEffect(() => {
    fetchAllLocations();
    fetchGeoJSONData();
  }, []);

  useEffect(() => {
    if (locations.length > 0 && mapRef.current && !showRadius) {
      clearMarkers();
      addMarkers(locations, "#3b82f6", false);
    }
  }, [locations, mapRef.current]);

  useEffect(() => {
    if (
      nearbyLocations.length > 0 &&
      mapRef.current &&
      showRadius &&
      radiusCenter
    ) {
      clearMarkers();
      addMarkers(nearbyLocations, "#ef4444", true);
      drawRadiusCircle(radiusCenter, radiusKm);

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(radiusCenter);
      nearbyLocations.forEach((loc) => {
        let lng, lat;
        if (loc.geometry?.coordinates) {
          lng = loc.geometry.coordinates[0];
          lat = loc.geometry.coordinates[1];
        } else if (loc.longitude && loc.latitude) {
          lng = loc.longitude;
          lat = loc.latitude;
        }
        if (lng && lat) bounds.extend([lng, lat]);
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [nearbyLocations, showRadius, radiusCenter]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [118.0, -2.5],
        zoom: 5,
        maxZoom: 15,
        minZoom: 4,
      });

      mapRef.current.on("load", () => {
        mapRef.current!.addControl(
          new mapboxgl.NavigationControl(),
          "top-right",
        );
        mapRef.current!.addControl(new mapboxgl.ScaleControl(), "bottom-right");
      });

      mapRef.current.on("click", handleMapClick);

      return () => {
        clearMarkers();
        clearRadius();
        mapRef.current?.remove();
        mapRef.current = null;
      };
    }
  }, []);

  return (
    <>
      <AppNavbar />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h4" component="h1" className="font-bold">
            🗺️ Spatial Query Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<FaLocationArrow />}
            onClick={() => setDrawerOpen(true)}
          >
            Data Lokasi ({locations.length})
          </Button>
        </div>

        <Paper elevation={2} className="p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <TextField
                label="Cari dari lokasi (nama atau koordinat)"
                value={searchCenter}
                onChange={(e) => setSearchCenter(e.target.value)}
                size="small"
                fullWidth
                placeholder="Contoh: Kantor Pusat"
                helperText="Klik di peta untuk ambil koordinat"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <Typography variant="body2" className="mb-1">
                Radius: {radiusKm} km
              </Typography>
              <Slider
                value={radiusKm}
                onChange={(_, val) => setRadiusKm(val as number)}
                min={0.5}
                max={10}
                step={0.5}
                size="small"
              />
            </div>

            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearchNearby}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                Cari dalam Radius
              </Button>
            </div>

            <div>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </Paper>

        {nearbyLocations.length > 0 && (
          <Paper elevation={1} className="p-3 mb-4 bg-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <Typography variant="body1">
                  <strong>📍 Ditemukan {nearbyLocations.length} lokasi</strong>
                  <span className="ml-2 text-gray-600">
                    dalam radius {radiusKm} km dari "{searchCenter}"
                  </span>
                </Typography>
              </div>
              <Chip
                label={`Radius: ${radiusKm} km`}
                color="primary"
                size="small"
              />
              <Button size="small" onClick={handleReset}>
                Bersihkan
              </Button>
            </div>
          </Paper>
        )}

        {error && (
          <Alert
            severity="error"
            className="mb-4"
            onClose={() => useSpatialStore.setState({ error: null })}
          >
            {error}
          </Alert>
        )}

        <div className="pt-2">
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "650px", borderRadius: "8px" }}
          />
        </div>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 350, p: 2 }}>
            <div className="flex justify-between items-center mb-3">
              <Typography variant="h6">📍 Daftar Lokasi</Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <FaClosedCaptioning />
              </IconButton>
            </div>
            <Divider className="mb-3" />
            <List>
              {locations.map((loc) => (
                <ListItem
                  key={loc.id}
                  component="div"
                  className="hover:bg-gray-100 cursor-pointer rounded mb-1"
                  onClick={() => {
                    setDrawerOpen(false);
                    let lng, lat;
                    if (loc.geometry?.coordinates) {
                      lng = loc.geometry.coordinates[0];
                      lat = loc.geometry.coordinates[1];
                    } else if (loc.longitude && loc.latitude) {
                      lng = loc.longitude;
                      lat = loc.latitude;
                    }
                    if (mapRef.current && lng && lat) {
                      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <div className="flex items-center gap-2">
                        <LocationOnIcon fontSize="small" color="primary" />
                        <span className="font-medium">{loc.name}</span>
                      </div>
                    }
                    secondary={
                      <>
                        <span className="text-xs text-gray-500">
                          {loc.category || "No category"}
                        </span>
                        {loc.latitude && loc.longitude && (
                          <>
                            <br />
                            <span className="text-xs text-gray-400">
                              {loc.latitude.toFixed(6)},{" "}
                              {loc.longitude.toFixed(6)}
                            </span>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </div>
    </>
  );
};

export default DashboardPage;
