import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { OSM, XYZ } from "ol/source";
import { Vector as VectorSource } from "ol/source";
import { defaults as defaultControls, Zoom } from "ol/control";
import { fromLonLat, toLonLat } from "ol/proj";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface MapComponentProps {
  onSelectLocation: (coordinates: { lat: number; lng: number }) => void; // Callback for selected location
  isOpen: boolean; // Whether the map is open
}

const MapComponent: React.FC<MapComponentProps> = ({ onSelectLocation, isOpen }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
  const [mousePosition, setMousePosition] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = new Map({
        controls: defaultControls().extend([new Zoom()]),
        layers: [
          new TileLayer({ source: new OSM() }), 
        ],
        target: mapRef.current,
        view: new View({
          center: fromLonLat([76.9366, 8.5241]), 
          zoom: 10,
          minZoom: 3,
          maxZoom: 18,
        }),
      });

      // Track mouse position
      map.on("pointermove", (event) => {
        const coords = toLonLat(event.coordinate);
        setMousePosition(`${coords[0].toFixed(7)}, ${coords[1].toFixed(7)}`);
      });

      // Handle click to select a location
      map.on("click", (event) => {
        const coords = toLonLat(event.coordinate);
        onSelectLocation({ lat: coords[1], lng: coords[0] }); // Pass selected coordinates to parent
      });

      mapInstance.current = map;
    }

    // Update map size when opened
    if (isOpen) {
      setTimeout(() => {
        mapInstance.current?.updateSize();
      }, 500);
    }
  }, [isOpen, onSelectLocation, navigate]);

  // Change map type (OSM, Satellite, Hybrid)
  const changeMapType = (type: "osm" | "satellite" | "hybrid") => {
    if (!mapInstance.current) return;

    const baseLayer = mapInstance.current
      .getLayers()
      .getArray()
      .find((layer) => layer instanceof TileLayer) as TileLayer;

    if (baseLayer) {
      switch (type) {
        case "osm":
          baseLayer.setSource(new OSM());
          break;
        case "satellite":
          baseLayer.setSource(
            new XYZ({
              url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            })
          );
          break;
        case "hybrid":
          baseLayer.setSource(
            new XYZ({
              url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            })
          );
          const labelLayer = new TileLayer({
            source: new XYZ({
              url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
            }),
          });
          mapInstance.current.addLayer(labelLayer);
          break;
      }
      setMapType(type);
    }
  };

  return (
    <Box height="100%">
      {/* Toolbar Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 1,
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            onClick={() => changeMapType("osm")}
            disabled={mapType === "osm"}
            variant="contained"
            size="small"
          >
            OSM
          </Button>
          <Button
            onClick={() => changeMapType("satellite")}
            disabled={mapType === "satellite"}
            variant="contained"
            size="small"
          >
            Satellite
          </Button>
          <Button
            onClick={() => changeMapType("hybrid")}
            disabled={mapType === "hybrid"}
            variant="contained"
            size="small"
          >
            Hybrid
          </Button>
        </Box>

        {/* Display mouse position */}
        <Typography variant="body2">
          <strong>{mousePosition}</strong>
        </Typography>
      </Box>

      {/* Map Section */}
      <Box ref={mapRef} width="100%" height="600px" flex={1} />
    </Box>
  );
};

export default MapComponent;