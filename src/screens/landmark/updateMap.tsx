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
import { Feature } from "ol";
import { Style, Stroke, Fill } from "ol/style";
import { Button, Box, FormControl, InputLabel, MenuItem, Select, TextField, FormControlLabel, Checkbox } from "@mui/material";
import { Coordinate } from "ol/coordinate";

interface Landmark {
  id: number;
  name: string;
  boundary: string;
}

interface MapComponentProps {
  initialBoundary?: string;
  onSave: (coordinates: string) => void;
  onClose: () => void;
  landmarks?: Landmark[];
}

const UpdateMapComponent: React.FC<MapComponentProps> = ({ initialBoundary, onSave, onClose, landmarks }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
  const initialVectorSource = useRef(new VectorSource());
  const mapInstance = useRef<Map | null>(null);
  const drawInteraction = useRef<Draw | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [updatedCoordinates, setUpdatedCoordinates] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAllBoundaries, setShowAllBoundaries] = useState(false);

  // Initialize map and load initial boundary
  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      controls: [],
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: initialVectorSource.current }),
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

    mapInstance.current = map;

    // Load initial boundary
    if (initialBoundary) {
      try {
        const coordinatesString = initialBoundary
          .replace("POLYGON ((", "")
          .replace("))", "")
          .split(",")
          .map((coord) => coord.trim().split(" ").map(Number));

        const coordinates = coordinatesString.map((coord) => fromLonLat(coord));
        if (coordinates.length >= 3) {
          const polygon = new Polygon([coordinates]);
          initialVectorSource.current.clear();
          initialVectorSource.current.addFeature(new Feature(polygon));

          map.getView().fit(polygon.getExtent(), {
            padding: [50, 50, 50, 50],
            duration: 1000,
          });
        }
      } catch (error) {
        console.error("Error parsing initialBoundary:", error);
      }
    }

    return () => {
      map.setTarget(undefined);
    };
  }, [initialBoundary]);

  // Show all boundaries when checkbox is checked
  useEffect(() => {
    if (!mapInstance.current || !landmarks) return;

    if (!showAllBoundaries) {
      vectorSource.current.clear();
      return;
    }

    landmarks.forEach((landmark) => {
      if (landmark.boundary) {
        try {
          const coordinatesString = landmark.boundary
            .replace("POLYGON ((", "")
            .replace("))", "")
            .split(",")
            .map((coord) => coord.trim().split(" ").map(Number));

          const coordinates = coordinatesString.map((coord) => fromLonLat(coord));
          if (coordinates.length >= 3) {
            const polygon = new Polygon([coordinates]);
            const feature = new Feature(polygon);
            
            if (landmark.boundary === initialBoundary) {
              feature.setStyle(
                new Style({
                  stroke: new Stroke({
                    color: "rgb(228, 53, 225)",
                    width: 3,
                  }),
                  fill: new Fill({
                    color: "rgba(220, 57, 196, 0.2)",
                  }),
                })
              );
            } else {
              feature.setStyle(
                new Style({
                  stroke: new Stroke({
                    color: "rgba(0, 0, 255, 0.7)",
                    width: 2,
                  }),
                  fill: new Fill({
                    color: "rgba(0, 0, 255, 0.1)",
                  }),
                })
              );
            }
            
            vectorSource.current.addFeature(feature);
          }
        } catch (error) {
          console.error("Error parsing landmark boundary:", error);
        }
      }
    });
  }, [showAllBoundaries, landmarks, initialBoundary]);

  const startDrawing = () => {
    if (!mapInstance.current) return;
    vectorSource.current.clear();
    setShowAllBoundaries(false);

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
          color: "rgb(249, 11, 11)",
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(200, 83, 83, 0.35)", 
        }),
      }),
    });

    draw.on("drawend", (event) => {
      vectorSource.current.clear();
      const polygon = event.feature.getGeometry() as Polygon;
      const coordinates = polygon
        .getCoordinates()[0]
        .map((coord) => toLonLat(coord));
      const formattedCoordinates = coordinates
        .map((coord) => coord.join(" "))
        .join(",");
      const wktCoordinates = `POLYGON ((${formattedCoordinates}))`;
      setUpdatedCoordinates(wktCoordinates);
      setIsDrawing(false);
    });

    drawInteraction.current = draw;
    mapInstance.current.addInteraction(draw);
    setIsDrawing(true);
  };

  const handleConfirm = () => {
    if (updatedCoordinates) {
      onSave(updatedCoordinates);
      vectorSource.current.clear();
      setShowAllBoundaries(false);
      onClose();
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      {/* Search & Map Type Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
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
    
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search Location (e.g., India)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1 }}
        />
    
        <Button
          size="small"
          variant="contained"
          sx={{ backgroundColor: "green", whiteSpace: "nowrap" }}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Box>
    
      {/* Map Section */}
      <Box
        ref={mapRef}
        sx={{
          width: "100%",
          height: "400px",
          minHeight: "400px",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
        }}
      />
    
      {/* Buttons Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={startDrawing}
          disabled={isDrawing}
        >
          {isDrawing ? "Drawing..." : "Draw New Boundary"}
        </Button>
    
        <Button
          variant="contained"
          color="secondary"
          onClick={handleConfirm}
          disabled={!updatedCoordinates}
        >
          Confirm
        </Button>

        <FormControlLabel
          control={
            <Checkbox
              checked={showAllBoundaries}
              onChange={(e) => setShowAllBoundaries(e.target.checked)}
              color="primary"
              disabled={isDrawing}
            />
          }
          label="Show All Boundaries"
          sx={{ ml: 1 }}
        />
      </Box>
    </Box>
  );
};

export default UpdateMapComponent;