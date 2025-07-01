import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { OSM, XYZ } from "ol/source";
import { Draw, Select as _OlSelect } from "ol/interaction";
import { Polygon, Point } from "ol/geom";
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
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";
import * as ol from "ol";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import { Coordinate } from "ol/coordinate";
import { Style, Stroke, Fill, Text } from "ol/style";
import { Refresh } from "@mui/icons-material";
import { getArea } from "ol/sphere";
import Icon from "ol/style/Icon";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/toastMessageHelper";
import busstopimage from "../../assets/png/busstopimage.png";
import { Landmark, BusStop } from "../../types/type";

interface MapComponentProps {
  onDrawEnd: (coordinates: string) => void;
  isOpen: boolean;
  selectedBoundary?: string;
  selectedLandmark?: Landmark | null;
  onUpdateClick: () => void;
  onDeleteClick: () => void;
  handleCloseRowClick: () => void;
  clearBoundaries: () => void;
  vectorSource: React.MutableRefObject<VectorSource>;
  landmarks?: Landmark[];
  isDrawing: boolean;
  onDrawingChange: (isDrawing: boolean) => void;
  busStops?: BusStop[];
  onBusStopPointSelect: (Location: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onDrawEnd,
  isOpen,
  selectedBoundary,
  selectedLandmark,
  onUpdateClick,
  onDeleteClick,
  handleCloseRowClick,
  landmarks,
  onDrawingChange,
  busStops,
  onBusStopPointSelect,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
  const mapInstance = useRef<Map | null>(null);
  const drawInteraction = useRef<Draw | null>(null);
  const pointInteraction = useRef<Draw | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isAddingBusStop, setIsAddingBusStop] = useState(false);
  const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
  const [mousePosition, setMousePosition] = useState<string>("");
  const [drawingArea, setDrawingArea] = useState<string>("");
  const navigate = useNavigate();
  const canManageLandmark = useSelector((state: RootState) =>
    state.app.permissions.includes("manage_executive")
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAllBoundaries, setShowAllBoundaries] = useState(false);

  const clearBoundaries = () => {
    vectorSource.current.clear();
    setDrawingArea("");
    setShowAllBoundaries(false);
    setIsAddingBusStop(false);
    removePointInteraction();
  };

  const removePointInteraction = () => {
    if (mapInstance.current && pointInteraction.current) {
      mapInstance.current.removeInteraction(pointInteraction.current);
      pointInteraction.current = null;
    }
  };

  //*********************Initialize the map********************
  const initializeMap = () => {
    if (!mapRef.current) return null;

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
      setMousePosition(`${coords[0].toFixed(7)},${coords[1].toFixed(7)} `);
    });

    return map;
  };

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = initializeMap();
    }

    if (isOpen) {
      setTimeout(() => {
        mapInstance.current?.updateSize();
      }, 500);
    }
  }, [isOpen, onDrawEnd, navigate]);

  //***************Update the map when the selected boundary changes************
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

  // Combined display logic for landmarks and bus stops
  useEffect(() => {
    if (!mapInstance.current) return;
  
    vectorSource.current.clear();
    const features: ol.Feature[] = [];
  
    // If we have a selected boundary, show only that
    if (selectedBoundary) {
      const coordinates = selectedBoundary
        .split(",")
        .map((coord) => coord.trim().split(" ").map(Number))
        .map((coord) => fromLonLat(coord));
  
      const polygon = new Polygon([coordinates]);
      const feature = new ol.Feature(polygon);
  
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "rgb(255, 149, 0)",
            width: 3,
          }),
          fill: new Fill({
            color: "rgba(221, 201, 75, 0.3)",
          }),
        })
      );
  
      features.push(feature);
    }
    // If showAllBoundaries is enabled, show all landmarks
    else if (showAllBoundaries && landmarks) {
      landmarks.forEach((landmark) => {
        if (landmark.boundary) {
          try {
            const coordinates = landmark.boundary
              .split(",")
              .map((coord) => coord.trim().split(" ").map(Number))
              .map((coord) => fromLonLat(coord));
  
            const polygon = new Polygon([coordinates]);
            const feature = new ol.Feature(polygon);
  
            // Different style for the selected landmark if it exists
            const isSelected = selectedLandmark?.id === landmark.id;
            feature.setStyle(
              new Style({
                stroke: new Stroke({
                  color: isSelected ? "rgb(255, 149, 0)" : "rgba(0, 0, 255, 0.7)",
                  width: isSelected ? 3 : 2,
                }),
                fill: new Fill({
                  color: isSelected ? "rgba(221, 201, 75, 0.3)" : "rgba(0, 0, 255, 0.1)",
                }),
              })
            );
  
            features.push(feature);
          } catch (error) {
            console.error(`Error processing landmark ${landmark.id}:`, error);
          }
        }
      });
    }
    // Show selected landmark (if not showing all boundaries)
    else if (selectedLandmark?.boundary && !showAllBoundaries) {
      const coordinates = selectedLandmark.boundary
        .split(",")
        .map((coord) => coord.trim().split(" ").map(Number))
        .map((coord) => fromLonLat(coord));
  
      const polygon = new Polygon([coordinates]);
      const feature = new ol.Feature(polygon);
  
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "rgb(255, 149, 0)",
            width: 3,
          }),
          fill: new Fill({
            color: "rgba(221, 201, 75, 0.3)",
          }),
        })
      );
  
      features.push(feature);
    }
  
    // Add bus stops for the selected landmark (if not showing all boundaries)
    if (busStops && selectedLandmark && !showAllBoundaries) {
      busStops
        .filter(stop => stop.landmark_id === selectedLandmark.id && stop.parsedLocation)
        .forEach(stop => {
          const [lon, lat] = stop.parsedLocation!;
          const coordinates = fromLonLat([lon, lat]);
          const point = new Point(coordinates);
          const busStopFeature = new ol.Feature(point);
  
          busStopFeature.setStyle(
            new Style({
              image: new Icon({
                src: busstopimage,
                scale: 0.1,
                anchor: [0.5, 1],
              }),
              text: new Text({
                text: stop.name || 'Bus Stop', 
                font: 'bold 12px Arial',
                fill: new Fill({
                  color: '#000000'
                }),
                stroke: new Stroke({
                  color: '#FFFFFF',
                  width: 3
                }),
                offsetY: -25, 
                textAlign: 'center'
              })
            })
          );
          features.push(busStopFeature);
        });
    }
  
    // Add all features to the vector source
    if (features.length > 0) {
      vectorSource.current.addFeatures(features);
      
      // Fit view to show all features
      const extent = vectorSource.current.getExtent();
      if (extent[0] !== Infinity) {
        mapInstance.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
        });
      }
    }
  }, [showAllBoundaries, landmarks, selectedBoundary, selectedLandmark, busStops]);

  //************************check for overlaps*********************
  const checkForOverlaps = (newPolygon: Polygon): boolean => {
    if (!landmarks || landmarks.length === 0) return false;

    const newCoords = newPolygon.getCoordinates()[0];

    for (const landmark of landmarks) {
      if (!landmark.boundary) continue;

      try {
        const existingCoords = landmark.boundary
          .split(",")
          .map((coord) => coord.trim().split(" ").map(Number))
          .map((coord) => fromLonLat(coord));

        const existingPolygon = new Polygon([existingCoords]);

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
        showErrorToast(`Error processing landmark ${landmark.id}: ${error}`);
      }
    }

    return false;
  };

  //*****************************landmark drawing functions*********************
  const toggleDrawing = () => {
    if (!mapInstance.current) return;

    if (isDrawing) {
      if (drawInteraction.current) {
        mapInstance.current.removeInteraction(drawInteraction.current);
      }
      setDrawingArea("");
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

          const area = getArea(geometry);
          setDrawingArea(`${(area / 1000000).toFixed(2)} km²`);

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

        const area = getArea(polygon);
        if (area < 2 || area > 5000000) {
          showErrorToast("Area must be between 2 m² and 5 km².");
          vectorSource.current.clear();
          setDrawingArea("");
          return;
        }

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

        onDrawEnd(formattedCoordinates);
      });

      drawInteraction.current = draw;
      mapInstance.current.addInteraction(draw);
    }

    const newDrawingState = !isDrawing;
    setIsDrawing(newDrawingState);
    onDrawingChange(newDrawingState);
  };

  //*********************************bus stop adding functions************************************
  const toggleBusStopAdding = () => {
    if (!mapInstance.current || !selectedLandmark) return;
    if (!isAddingBusStop) {
      showSuccessToast("Select bus stop inside the boundary.");
    } else {
    }
    if (isAddingBusStop) {
      removePointInteraction();
      setIsAddingBusStop(false);
    } else {
      // Clear any existing point interaction
      removePointInteraction();

      // Create new point interaction
      const draw = new Draw({
        source: vectorSource.current,
        type: "Point",
        style: new Style({
          image: new Icon({
            src: busstopimage,
            scale: 0.1,
            anchor: [0.5, 1],
          }),
        }),
      });

      draw.on("drawend", (event) => {
        const point = event.feature.getGeometry() as Point;
        const coordinates = toLonLat(point.getCoordinates());

        // Check if point is within selected landmark's boundary
        if (selectedLandmark?.boundary) {
          try {
            const boundaryCoords = selectedLandmark.boundary
              .split(",")
              .map((coord) => coord.trim().split(" ").map(Number))
              .map((coord) => fromLonLat(coord));

            const polygon = new Polygon([boundaryCoords]);

            if (!polygon.intersectsCoordinate(point.getCoordinates())) {
              showErrorToast(
                "Bus stop must be within the selected landmark boundary"
              );
              vectorSource.current.removeFeature(event.feature);
              return;
            }
          } catch (error) {
            showErrorToast("Error validating bus stop location");
            vectorSource.current.removeFeature(event.feature);
            return;
          }
        }

        const formattedCoordinates = coordinates.join(" ");

        // Pass the coordinates to the parent component
        onBusStopPointSelect(formattedCoordinates);

        // Reset the interaction
        setIsAddingBusStop(false);
        removePointInteraction();
      });

      pointInteraction.current = draw;
      mapInstance.current.addInteraction(draw);
      setIsAddingBusStop(true);
    }
  };

  //*******************************searching for location****************************

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
        showErrorToast("Location not found. Please try a different query.");
      }
    } catch (error: any) {
      showErrorToast(error);
    }
  };

  //*******************************change map type************************************
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
              onChange={(
                e: SelectChangeEvent<"osm" | "satellite" | "hybrid">
              ) =>
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
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
          {!selectedLandmark && (
            <Tooltip
              title={
                !canManageLandmark
                  ? "You don't have permission, contact the admin"
                  : "click to Enable Drawing the landmark."
              }
              placement="bottom"
            >
              <span
                style={{
                  cursor: !canManageLandmark ? "not-allowed" : "default",
                }}
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
                  : "#00008B",
                color: "white",
                "&.Mui-disabled": {
                  backgroundColor: "#6c87b7 !important",
                  color: "#ffffff99",
                },
                  }}
                >
                  {isDrawing ? "Disable " : "Add Landmark"}
                </Button>
              </span>
            </Tooltip>
          )}

          {selectedLandmark && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip
                title={
                  !canManageLandmark
                    ? "You don't have permission, contact the admin"
                    : "click to add bus stop."
                }
                placement="bottom"
              >
                <span
                  style={{
                    cursor: !canManageLandmark ? "not-allowed" : "default",
                  }}
                >
                  <Button
                    size="small"
                    color={isAddingBusStop ? "secondary" : "primary"}
                    variant="contained"
                    onClick={toggleBusStopAdding}
                    disabled={!canManageLandmark}
                    sx={{
                      backgroundColor: isAddingBusStop
                        ? "#a923d1 !important"
                        : "#3f51b5 !important",
                    }}
                  >
                    {isAddingBusStop ? "Cancel" : "Add Bus Stop"}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          )}

          {!selectedLandmark && isDrawing && (
            <Box>
              <Tooltip title="Clear Drawings" placement="bottom">
                <IconButton color="warning" onClick={clearBoundaries}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {!selectedLandmark && (
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
              >
                {showAllBoundaries ? (
                  <LocationOnIcon sx={{ color: "blue" }} />
                ) : (
                  <LocationOnIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

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
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Typography variant="body2">
            <strong>[{mousePosition ? mousePosition : "coordinates"}]</strong>
          </Typography>
          {isDrawing && (
            <Typography variant="body2">
              <strong>Area: {drawingArea}</strong>
            </Typography>
          )}
        </Box>

        {selectedLandmark && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => {
                handleCloseRowClick();
                clearBoundaries();
              }}
            >
              Back
            </Button>
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
                    },
                  }}
                >
                  Update
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
