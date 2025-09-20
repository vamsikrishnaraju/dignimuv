import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function AmbulanceMap({ ambulances = [], activeRides = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    if (!MAPBOX_TOKEN) {
      console.error("Mapbox token not found");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.5946, 12.9716], // Bangalore center
      zoom: 11
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      addAmbulanceMarkers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const addAmbulanceMarkers = () => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.ambulance-marker');
    existingMarkers.forEach(marker => marker.remove());

    ambulances.forEach(ambulance => {
      if (ambulance.currentLatitude && ambulance.currentLongitude) {
        // Create ambulance symbol
        const el = document.createElement('div');
        el.className = 'ambulance-marker';
        el.style.cssText = `
          width: 30px;
          height: 30px;
          background-color: ${ambulance.status === 'on_duty' ? '#ef4444' : '#10b981'};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        `;
        el.innerHTML = '🚑';

        // Create popup content
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${ambulance.modelName}</h3>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">Vehicle: ${ambulance.vehicleNo}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">Type: ${ambulance.type}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">Status: <span style="color: ${ambulance.status === 'on_duty' ? '#ef4444' : '#10b981'}; font-weight: 600;">${ambulance.status}</span></p>
            ${ambulance.assignments && ambulance.assignments.length > 0 ? 
              `<p style="margin: 4px 0; font-size: 12px; color: #666;">Driver: ${ambulance.assignments[0].driver?.name || 'Unassigned'}</p>` : 
              '<p style="margin: 4px 0; font-size: 12px; color: #666;">Driver: Unassigned</p>'
            }
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

        new mapboxgl.Marker(el)
          .setLngLat([ambulance.currentLongitude, ambulance.currentLatitude])
          .setPopup(popup)
          .addTo(map.current);
      }
    });

    // Add route lines for active rides
    activeRides.forEach(ride => {
      if (ride.fromLatitude && ride.fromLongitude && ride.toLatitude && ride.toLongitude) {
        const routeCoordinates = [
          [ride.fromLongitude, ride.fromLatitude],
          [ride.toLongitude, ride.toLatitude]
        ];

        // Add route source
        const sourceId = `route-${ride.id}`;
        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }

        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates
            }
          }
        });

        // Add route layer
        const layerId = `route-${ride.id}`;
        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }

        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ef4444',
            'line-width': 3,
            'line-dasharray': [2, 2]
          }
        });
      }
    });
  };

  useEffect(() => {
    if (mapLoaded && ambulances.length > 0) {
      addAmbulanceMarkers();
    }
  }, [ambulances, activeRides, mapLoaded]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-medium">Mapbox token not configured</p>
          <p className="text-sm text-gray-600 mt-1">Please add VITE_MAPBOX_TOKEN to your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

