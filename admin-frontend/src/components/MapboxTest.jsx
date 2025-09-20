import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZXhhbXBsZTAwMDAzM3BqZXhhbXBsZTAifQ.example";

export default function MapboxTest() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    console.log("🧪 Mapbox Test - Token:", MAPBOX_TOKEN);
    console.log("🧪 Mapbox Test - Token length:", MAPBOX_TOKEN?.length);
    console.log("🧪 Mapbox Test - Is example token:", MAPBOX_TOKEN?.includes("example"));
    
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("example")) {
      setStatus("❌ No valid Mapbox token found");
      return;
    }

    setStatus("🔑 Token found, testing connection...");

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [77.5946, 12.9716],
        zoom: 10
      });

      map.current.on("load", () => {
        console.log("🧪 Mapbox Test - Map loaded successfully!");
        setStatus("✅ Map loaded successfully!");
      });

      map.current.on("error", (e) => {
        console.error("🧪 Mapbox Test - Map error:", e);
        setStatus(`❌ Map error: ${e.error?.message || "Unknown error"}`);
      });

    } catch (error) {
      console.error("🧪 Mapbox Test - Creation error:", error);
      setStatus(`❌ Creation error: ${error.message}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Mapbox Connection Test</h2>
      <div className="mb-4">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Token:</strong> {MAPBOX_TOKEN ? "Present" : "Missing"}</p>
        <p><strong>Token Length:</strong> {MAPBOX_TOKEN?.length || 0}</p>
        <p><strong>Is Example Token:</strong> {MAPBOX_TOKEN?.includes("example") ? "Yes" : "No"}</p>
      </div>
      <div ref={mapContainer} className="w-full h-96 border border-gray-300 rounded" />
    </div>
  );
}