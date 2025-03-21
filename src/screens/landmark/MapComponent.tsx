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
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as ol from "ol";
import localStorageHelper from "../../utils/localStorageHelper";
import { Coordinate } from "ol/coordinate";
import { Style, Stroke, Fill } from "ol/style";
import { Refresh } from "@mui/icons-material";
// MapComponent.tsx
interface Landmark {
  id: number;
  name: string;
  boundary: string;
  status: string;
  importance: string;
}
interface MapComponentProps {
  onDrawEnd: (coordinates: string) => void;
  isOpen: boolean;
  selectedBoundary?: string;
  selectedLandmark?: Landmark | null;
  onUpdateClick: () => void;
  onDeleteClick: () => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onDrawEnd,
  isOpen,
  selectedBoundary,
  selectedLandmark,
  onUpdateClick,
  onDeleteClick,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
  const mapInstance = useRef<Map | null>(null);
  const drawInteraction = useRef<Draw | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
  const [mousePosition, setMousePosition] = useState<string>("");
  const navigate = useNavigate();
  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageLandmark = roleDetails?.manage_landmark || false;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const clearBoundaries = () => {
    vectorSource.current.clear();
  };
  
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = new Map({
        controls: [],
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

      map.on("pointermove", (event) => {
        const coords = toLonLat(event.coordinate);
        setMousePosition(`${coords[1].toFixed(7)}, ${coords[0].toFixed(7)}`);
      });

      mapInstance.current = map;
    }

    if (isOpen) {
      setTimeout(() => {
        mapInstance.current?.updateSize();
      }, 500);
    }
  }, [isOpen, onDrawEnd, navigate]);

  useEffect(() => {
    if (selectedBoundary && mapInstance.current) {
      const coordinates = selectedBoundary
        .split(",")
        .map((coord) => coord.trim().split(" ").map(Number))
        .map((coord) => fromLonLat(coord));

      const polygon = new Polygon([coordinates]);
      vectorSource.current.clear();
      vectorSource.current.addFeature(new ol.Feature(polygon));

      const extent = polygon.getExtent();
      mapInstance.current.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
      });
    }
  }, [selectedBoundary]);

  const toggleDrawing = () => {
    if (!mapInstance.current) return;

    if (isDrawing) {
      if (drawInteraction.current) {
        mapInstance.current.removeInteraction(drawInteraction.current);
      }
    } else {
      const draw = new Draw({
        source: vectorSource.current,
        type: "Circle",
        geometryFunction: (coordinates, geometry) => {
          if (!geometry) {
            geometry = new Polygon([[]]);
          }

          const coords = coordinates as Coordinate[];
          const start = coords[0];
          const end = coords[1];
          const minX = Math.min(start[0], end[0]);
          const maxX = Math.max(start[0], end[0]);
          const minY = Math.min(start[1], end[1]);
          const maxY = Math.max(start[1], end[1]);

          geometry.setCoordinates([
            [
              [minX, minY],
              [maxX, minY],
              [maxX, maxY],
              [minX, maxY],
              [minX, minY],
            ],
          ]);

          return geometry;
        },
        style: new Style({
          stroke: new Stroke({
            color: "rgba(0, 0, 255, 1)",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(0, 0, 255, 0.2)",
          }),
        }),
      });

      draw.on("drawend", (event) => {
        const polygon = event.feature.getGeometry() as Polygon;

        const coordinates = polygon
          .getCoordinates()[0]
          .map((coord) => toLonLat(coord));
        const formattedCoordinates = coordinates
          .map((coord) => coord.join(" "))
          .join(",");

        onDrawEnd(formattedCoordinates);
      });

      drawInteraction.current = draw;
      mapInstance.current.addInteraction(draw);
    }

    setIsDrawing(!isDrawing);
  };

  const handleSearch = async () => {
    if (!searchQuery || !mapInstance.current) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        const coordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);

        mapInstance.current.getView().animate({
          center: coordinates,
          zoom: 14,
        });
      } else {
        alert("Location not found. Please try a different query.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error searching for location. Please try again.");
    }
  };

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
          <FormControl variant="outlined" size="small">
            <InputLabel>Map Type</InputLabel>
            <Select
              value={mapType}
              onChange={(e) =>
                changeMapType(e.target.value as "osm" | "satellite" | "hybrid")
              }
              label="Map Type"
            >
              <MenuItem value="osm">OSM</MenuItem>
              <MenuItem value="satellite">Satellite</MenuItem>
              <MenuItem value="hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search Location (e.g., India)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
            <Button
              size="small"
              variant="contained"
              sx={{ backgroundColor: "green" }}
              onClick={handleSearch}
            >
              Search
            </Button>
          </Box>
        { !selectedLandmark && (
          <Tooltip
          title={
            !canManageLandmark
              ? "You don't have permission, contact the admin"
              : "click to Enable Drawing the landmark."
          }
          placement="bottom"
        >
          <span
            style={{ cursor: !canManageLandmark ? "not-allowed" : "default" }}
          >
           <Button
              size="small"
              color={isDrawing ? "secondary" : "primary"}
              variant="contained"
              onClick={toggleDrawing}
              disabled={!canManageLandmark}
              sx={{
                backgroundColor: !canManageLandmark
                  ? "#6c87b7 !important" 
                  : isDrawing
                  ? "#a923d1  !important" 
                  : "#3f51b5 !important", 
              }}
            >
                {isDrawing ? "Disable " : "Add Landmark"}
            </Button>

          </span>
        </Tooltip>
        )}
          
          
          {!selectedLandmark && isDrawing && (
        <Tooltip title="Clear Drawings" placement="bottom">
          <IconButton color="warning" onClick={clearBoundaries}>
            <Refresh />
          </IconButton>
        </Tooltip>
      )}

        </Box>
      </Box>

      {/* Map Section */}
      <Box ref={mapRef} width="100%" height="calc(100% - 128px)" flex={1} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 1,
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
          marginTop: 1,
        }}
      >
        <Typography variant="body2">
          <strong>{mousePosition}</strong>
        </Typography>
        {selectedLandmark && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip
              title={
                !canManageLandmark
                  ? "You don't have permission, contact the admin"
                  : "click to Update the landmark."
              }
              placement="top-end"
            >
              <span
                style={{
                  cursor: !canManageLandmark ? "not-allowed" : "default",
                }}
              >
                <Button
                variant="contained"
                color="success"
                size="small"
                onClick={onUpdateClick}
                
                disabled={!canManageLandmark}
                sx={{
                  "&.Mui-disabled": { 
                    backgroundColor: "#81c784 !important", 
                    color: "#ffffff99", 
                  }
                }}
              >
                Update Landmark
              </Button>
              </span>
            </Tooltip>
            
            <Tooltip
              title={
                !canManageLandmark
                  ? "You don't have permission, contact the admin"
                  : "click to Delete the landmark."
              }
              placement="top-end"
            >
              <span
                style={{
                  cursor: !canManageLandmark ? "not-allowed" : "default",
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={onDeleteClick}
                  disabled={!canManageLandmark}
                >
                  Delete
                </Button>
              </span>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MapComponent;
