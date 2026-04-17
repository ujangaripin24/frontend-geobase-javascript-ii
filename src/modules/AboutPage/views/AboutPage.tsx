import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import AppNavbar from "../../../layouts/AppNavbar";

const AboutPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [106.8272, -6.1751],
      zoom: 9,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => map.remove();
  }, []);

  return (
    <>
      <AppNavbar />
      <div style={{ padding: "20px" }}>
        <div
          ref={mapContainer}
          style={{
            width: "100%",
            height: "500px",
            borderRadius: "8px",
            backgroundColor: "#e5e5e5",
          }}
        />
        <h1>About Page</h1>
      </div>
    </>
  );
};

export default AboutPage;
