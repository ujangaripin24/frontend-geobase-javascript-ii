import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import AppNavbar from "../../../layouts/AppNavbar";
import {
  Button,
  Menu,
  MenuItem,
  TextField,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Slider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { useHomePageStore } from "../stores/home-page.store";
import { type Location } from "../types/spatial.types";
import { FaArrowAltCircleUp } from "react-icons/fa";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

const HomePage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const radiusLayerRef = useRef<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchCenter, setSearchCenter] = useState("Kantor Pusat");
  const [radiusKm, setRadiusKm] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const handleFilterOpen = () => {
    setOpenDialog(true);
  };

  const handleFilterClose = () => {
    setOpenDialog(false);
  };

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
  } = useHomePageStore();

  const handlOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeStyle = (styleId: string) => {
    if (mapRef.current) {
      mapRef.current.setStyle(`mapbox://styles/mapbox/${styleId}`);
    }
    handleClose();
  };

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
      const angle = (((i * 360) / steps) * Math.PI) / 180;
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

  const addMarkers = (locationList: Location[], color: string = "#ef4444") => {
    if (!mapRef.current) return;

    locationList.forEach((location) => {
      const lng = location.longitude || location.geometry?.coordinates[0];
      const lat = location.latitude || location.geometry?.coordinates[1];

      if (lng && lat) {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundColor = color;
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong>${location.name}</strong><br/>
            <span style="font-size: 12px;">${location.category || "Tidak ada kategori"}</span>
            ${location.distance_meters ? `<br/><span style="font-size: 12px;">Jarak: ${(location.distance_meters / 1000).toFixed(2)} km</span>` : ""}
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
      }
    });
  };

  const handleSearchNearby = async () => {
    clearMarkers();
    await findNearby(searchCenter, radiusKm);
    handleFilterClose();
  };

  const handleReset = () => {
    clearMarkers();
    clearRadius();
    clearNearby();
    handleFilterClose();
    addMarkers(locations, "#3b82f6");
  };

  useEffect(() => {
    fetchAllLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0 && mapRef.current && !showRadius) {
      clearMarkers();
      addMarkers(locations, "#3b82f6");
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
      addMarkers(nearbyLocations, "#ef4444");
      drawRadiusCircle(radiusCenter, radiusKm);

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(radiusCenter);
      nearbyLocations.forEach((loc) => {
        const lng = loc.longitude || loc.geometry?.coordinates[0];
        const lat = loc.latitude || loc.geometry?.coordinates[1];
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
        center: [106.8272, -6.1751],
        zoom: 12,
      });

      mapRef.current.on("load", () => {
        mapRef.current!.addControl(
          new mapboxgl.NavigationControl(),
          "top-right",
        );
      });

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
      <div className="p-2">
        <div>
          <Button variant="outlined" onClick={handleFilterOpen}>
            Filter
          </Button>
          <Dialog
            fullWidth
            maxWidth="sm"
            open={openDialog}
            onClose={handleFilterClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            role="alertdialog"
          >
            <DialogTitle id="alert-dialog-title">Filter</DialogTitle>
            <DialogContent>
              <div>
                <Accordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<FaArrowAltCircleUp />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Typography component="span">
                      Search And Filter Data
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="mt-2">
                      <TextField
                        label="Cari dari lokasi"
                        value={searchCenter}
                        onChange={(e) => setSearchCenter(e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Contoh: Kantor Pusat"
                      />
                    </div>

                    <div className="mt-2">
                      <div className="mb-1 text-sm text-gray-600">
                        Radius: {radiusKm} km
                      </div>
                      <Slider
                        value={radiusKm}
                        onChange={(_, val) => setRadiusKm(val as number)}
                        min={0.5}
                        max={5}
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
                      >
                        {isLoading ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Cari dalam Radius"
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    </div>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<FaArrowAltCircleUp />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                  >
                    <Typography component="span">Change Map Style</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Button
                      variant="contained"
                      id="basic-button"
                      aria-controls={handlOpen ? "basic-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={handlOpen ? "true" : undefined}
                      onClick={handleClick}
                    >
                      Ganti Style Peta
                    </Button>
                    <Menu
                      id="basic-menu"
                      anchorEl={anchorEl}
                      open={handlOpen}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={() => changeStyle("streets-v12")}>
                        Standar
                      </MenuItem>
                      <MenuItem
                        onClick={() => changeStyle("satellite-streets-v12")}
                      >
                        Satelit
                      </MenuItem>
                      <MenuItem onClick={() => changeStyle("dark-v11")}>
                        Mode Malam
                      </MenuItem>
                      <MenuItem onClick={() => changeStyle("outdoors-v12")}>
                        Outdoor
                      </MenuItem>
                    </Menu>
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<FaArrowAltCircleUp />}
                    aria-controls="panel3-content"
                    id="panel3-header"
                  >
                    <Typography component="span">Accordion Actions</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse malesuada lacus ex, sit amet blandit leo
                    lobortis eget.
                  </AccordionDetails>
                  <AccordionActions>
                    <Button>Cancel</Button>
                    <Button>Agree</Button>
                  </AccordionActions>
                </Accordion>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleFilterClose}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        {/* {nearbyLocations.length > 0 && (
          <Alert variant="filled" severity="success">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">
                  📍 Ditemukan {nearbyLocations.length} lokasi
                </span>
                <span className="ml-2 text-sm text-gray-600">
                  dalam radius {radiusKm} km dari "{searchCenter}"
                </span>
              </div>
              <Chip
                label={`Radius: ${radiusKm} km`}
                color="primary"
                size="small"
              />
            </div>
          </Alert>
        )} */}

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="pt-2">
          <div
            ref={mapContainerRef}
            style={{ width: "100%", height: "700px", borderRadius: "8px" }}
          />
        </div>
      </div>
    </>
  );
};

export default HomePage;
