import React, { useEffect, useRef } from "react";
import AppNavbar from "../../../../layouts/AppNavbar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API;

const DashboardPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [118.0, -2.5],
        zoom: 8,
        maxZoom: 15,
        minZoom: 6,
      });

      mapRef.current.on("load", () => {
        mapRef.current!.addControl(
          new mapboxgl.NavigationControl(),
          "top-right",
        );
      });

      return () => {
        mapRef.current?.remove();
        mapRef.current = null;
      };
    }
  }, []);
  return (
    <>
      <AppNavbar />
      <div>
        <div>DashboardPage</div>
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

export default DashboardPage;
