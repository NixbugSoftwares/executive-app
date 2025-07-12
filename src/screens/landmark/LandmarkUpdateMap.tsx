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
import {
  Button,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { landmarkListApi } from "../../slices/appSlice";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Coordinate } from "ol/coordinate";
import { getArea } from "ol/sphere";
import { showErrorToast } from "../../common/toastMessageHelper";
import { useAppDispatch } from "../../store/Hooks";
interface Landmark {
  id: number;
  name: string;
  boundary: string;
}

interface MapComponentProps {
  initialBoundary?: string;
  onSave: (coordinates: string) => void;
  onClose: () => void;
  editingLandmarkId: number; 
}

const UpdateMapComponent: React.FC<MapComponentProps> = ({
  initialBoundary,
  onSave,
  onClose,
  editingLandmarkId, 
}) => {
  const dispatch = useAppDispatch();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
  const initialVectorSource = useRef(new VectorSource());
  const boundariesSource = useRef(new VectorSource());
  const mapInstance = useRef<Map | null>(null);
  const drawInteraction = useRef<Draw | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [updatedCoordinates, setUpdatedCoordinates] = useState<string | null>(
    null
  );
  const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAllBoundaries, setShowAllBoundaries] = useState(false);
  const [drawingArea, setDrawingArea] = useState<string>("");
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  // Initialize map and layers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      controls: [],
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: boundariesSource.current,
          zIndex: 1,
          style: new Style({
            stroke: new Stroke({
              color: "rgba(0, 0, 255, 0.7)",
              width: 2,
            }),
            fill: new Fill({
              color: "rgba(0, 0, 255, 0.1)",
            }),
          }),
        }),
        new VectorLayer({
          source: initialVectorSource.current,
          zIndex: 2,
          style: new Style({
            stroke: new Stroke({
              color: "rgb(255, 149, 0)",
              width: 3,
            }),
            fill: new Fill({
              color: "rgba(221, 201, 75, 0.3)",
            }),
          }),
        }),
        new VectorLayer({
          source: vectorSource.current,
          zIndex: 3,
        }),
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
          .replace(/POLYGON\s*\(\(/, "")
          .replace(/\)\)$/, "")
          .split(",")
          .map((coord) => coord.trim().split(/\s+/).map(Number));

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
        showErrorToast("Error parsing initialBoundary:" + error);
      }
    }

    return () => {
      map.setTarget(undefined);
    };
  }, [initialBoundary]);

  const fetchLandmarksInView = async () => {
    if (!mapInstance.current) return;
    const centerRaw = mapInstance.current.getView().getCenter();
    if (!centerRaw) return;
    const center = toLonLat(centerRaw);
    const [lon, lat] = center;
    const locationaskey = `POINT(${lon} ${lat})`;

    try {
      const response = await dispatch(
        landmarkListApi({ location: locationaskey })
      ).unwrap();
      setLandmarks(response.data);
    } catch (error: any) {
      showErrorToast( error);
    }
  };
  useEffect(() => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;

    const handleMoveEnd = () => {
      fetchLandmarksInView();
    };

    map.on("moveend", handleMoveEnd);

    return () => {
      map.un("moveend", handleMoveEnd);
    };
  }, []);

  useEffect(() => {
    boundariesSource.current.clear();

    if (showAllBoundaries && landmarks.length > 0) {
      landmarks.forEach((landmark) => {
        if (landmark.boundary) {
          try {
            const coordinatesString = landmark.boundary
              .replace(/POLYGON\s*\(\(/, "")
              .replace(/\)\)$/, "")
              .split(",")
              .map((coord) => coord.trim().split(/\s+/).map(Number));

            const coordinates = coordinatesString.map((coord) =>
              fromLonLat(coord)
            );

            if (coordinates.length >= 3) {
              const polygon = new Polygon([coordinates]);
              const feature = new Feature(polygon);
              if (landmark.boundary !== initialBoundary) {
                boundariesSource.current.addFeature(feature);
              }
            }
          } catch (error) {
            showErrorToast("Error parsing landmark boundary:" + error);
          }
        }
      });
    }
  }, [showAllBoundaries, landmarks, initialBoundary]);


  const checkForOverlaps = (newPolygon: Polygon): boolean => {
  if (!landmarks || landmarks.length === 0) return false;

  const newCoords = newPolygon.getCoordinates()[0];

  for (const landmark of landmarks) {
    // Skip the landmark we're currently updating by comparing ID
    if (!landmark.boundary) continue;
    if (landmark.id === editingLandmarkId) continue;

    try {
      const coordinatesString = landmark.boundary
        .replace(/POLYGON\s*\(\(/, "")
        .replace(/\)\)$/, "")
        .split(",")
        .map((coord) => coord.trim().split(/\s+/).map(Number));
      const existingCoords = coordinatesString.map((coord) =>
        fromLonLat(coord)
      );
      const existingPolygon = new Polygon([existingCoords]);
      if (newPolygon.intersectsExtent(existingPolygon.getExtent())) {
        return true;
      }
      for (const coord of newCoords) {
        if (existingPolygon.intersectsCoordinate(coord)) {
          return true;
        }
      }
      for (const coord of existingPolygon.getCoordinates()[0]) {
        if (newPolygon.intersectsCoordinate(coord)) {
          return true;
        }
      }
    } catch (error) {
      showErrorToast(
        "Error checking overlap with landmark " + landmark.id + ": " + error
      );
    }
  }
  return false;
};




  const startDrawing = () => {
    if (!mapInstance.current) return;

    vectorSource.current.clear();
    setIsDrawing(true);
    setUpdatedCoordinates(null);

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

        // Calculate area
        const area = getArea(geometry);
        setDrawingArea(`${(area / 1000000).toFixed(2)} km²`);

        return geometry;
      },
      style: new Style({
        stroke: new Stroke({
          color: "rgb(22, 8, 171)",
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(94, 105, 223, 0.35)",
        }),
      }),
    });

    if (drawInteraction.current) {
      mapInstance.current.removeInteraction(drawInteraction.current);
    }

    draw.on("drawstart", () => {
      // Clear any existing features when starting to draw
      vectorSource.current.clear();
    });

    draw.on("drawend", (event) => {
      const polygon = event.feature.getGeometry() as Polygon;

      // Validate area
      const area = getArea(polygon);
      if (area < 2 || area > 5000000) {
        showErrorToast("Area must be between 2 m² and 5 km².");
        vectorSource.current.clear();
        setDrawingArea("");
        return;
      }

      // Check for overlaps with other landmarks (excluding the one being updated)
      if (checkForOverlaps(polygon)) {
        showErrorToast(
          "Boundary overlaps with an existing landmark. Please choose a different area."
        );
        vectorSource.current.clear();
        setDrawingArea("");
        return;
      }

      const coordinates = polygon
        .getCoordinates()[0]
        .map((coord) => toLonLat(coord));
      const formattedCoordinates = coordinates
        .map((coord) => coord.join(" "))
        .join(",");
      const wktCoordinates = `POLYGON ((${formattedCoordinates}))`;
      setUpdatedCoordinates(wktCoordinates);
      setDrawingArea("");
      setIsDrawing(false);
    });

    if (drawInteraction.current) {
      mapInstance.current.removeInteraction(drawInteraction.current);
    }

    drawInteraction.current = draw;
    mapInstance.current.addInteraction(draw);
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
    } catch (error:any) {
      showErrorToast(  error);
      
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

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={startDrawing}
            disabled={isDrawing}
          >
            {isDrawing ? "Drawing..." : "Draw New Boundary"}
          </Button>

          {isDrawing && (
            <Typography variant="body2">
              <strong>Area: {drawingArea}</strong>
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip
            title={
              showAllBoundaries
                ? "Hide all landmarks"
                : "Click to view all landmarks"
            }
            arrow
          >
            <IconButton
              onClick={() => {
                setShowAllBoundaries(!showAllBoundaries);
              }}
              // sx={{ ml: 1 }}
            >
              {showAllBoundaries ? (
                <LocationOnIcon sx={{ color: "blue" }} />
              ) : (
                <LocationOnIcon />
              )}
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleConfirm}
            disabled={!updatedCoordinates}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateMapComponent;
