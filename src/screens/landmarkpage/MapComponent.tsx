import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { OSM, XYZ } from "ol/source";
import { Draw } from "ol/interaction";
import { Polygon } from "ol/geom";
import { fromLonLat, toLonLat } from "ol/proj";
import { Vector as VectorSource } from "ol/source";
import { defaults as defaultControls, Zoom } from "ol/control";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface MapComponentProps {
  onDrawEnd: (coordinates: string) => void;
  isOpen: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({ onDrawEnd, isOpen }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
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
          new VectorLayer({ source: vectorSource.current }),
        ],
        target: mapRef.current,
        view: new View({
          center: fromLonLat([76.9366, 8.5241]),
          zoom: 10,
          minZoom: 3,
          maxZoom: 18,
        }),
      });

      // Listen for mouse move events
      map.on("pointermove", (event) => {
        const coords = toLonLat(event.coordinate);
        setMousePosition(`${coords[0].toFixed(7)}, ${coords[1].toFixed(7)}`);
      });

      // Drawing interaction
      const draw = new Draw({
        source: vectorSource.current,
        type: "Polygon",
      });

      draw.on("drawend", (event) => {
        const polygon = event.feature.getGeometry() as Polygon;
        const coordinates = polygon
          .getCoordinates()[0]
          .map((coord) => coord.join(" "));

        onDrawEnd(coordinates.join(" , "));

        // Navigate to landmark/create with coordinates as state
        navigate("/landmark/create", { state: { boundary: coordinates.join(" , ") } });
      });

      map.addInteraction(draw);
      mapInstance.current = map;
    }

    if (isOpen) {
      setTimeout(() => {
        mapInstance.current?.updateSize();
      }, 500);
    }
  }, [isOpen, onDrawEnd, navigate]);

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
    <Box  height="100%">
      <Box  sx={{ justifyContent: "space-between" }}>
        <Button
          onClick={() => changeMapType("osm")}
          disabled={mapType === "osm"}
          variant="contained"
          sx={{ mr: 1 }}
          size="small"
        >
          OSM Map
        </Button>
        <Button
          onClick={() => changeMapType("satellite")}
          disabled={mapType === "satellite"}
          variant="contained"
          sx={{ mr: 1 }}
          size="small"
        >
          Satellite Map
        </Button>
        <Button
          onClick={() => changeMapType("hybrid")}
          disabled={mapType === "hybrid"}
          variant="contained"
        >
          Hybrid Map
        </Button>
        <Typography variant="body1">
           <strong>{mousePosition}</strong>
        </Typography>
      </Box>

      <Box ref={mapRef} width="100%" height="600px" flex={1} />
    </Box>
  );
};

export default MapComponent;
