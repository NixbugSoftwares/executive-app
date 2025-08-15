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
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as ol from "ol";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import { Coordinate } from "ol/coordinate";
import { Style, Stroke, Fill, Text } from "ol/style";
import { getArea } from "ol/sphere";
import Icon from "ol/style/Icon";
import { showErrorToast, showInfoToast } from "../../common/toastMessageHelper";
import busstopimage from "../../assets/png/busstopimage.png";
import { Landmark, BusStop } from "../../types/type";
import { useAppDispatch } from "../../store/Hooks";
import { landmarkListApi } from "../../slices/appSlice";
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
  isDrawing: boolean;
  onDrawingChange: (isDrawing: boolean) => void;
  busStops?: BusStop[];
  onBusStopPointSelect: (Location: string) => void;
  landmarkRefreshKey: number;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onDrawEnd,
  isOpen,
  selectedBoundary,
  selectedLandmark,
  onUpdateClick,
  onDeleteClick,
  handleCloseRowClick,
  onDrawingChange,
  busStops,
  onBusStopPointSelect,
  landmarkRefreshKey,
}) => {
  const dispatch = useAppDispatch();
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
  const canCreateLandmark = useSelector((state: RootState) =>
    state.app.permissions.includes("create_landmark")
  );
  const canUpdateLandmark = useSelector((state: RootState) =>
    state.app.permissions.includes("update_landmark")
  );
  const canDeleteLandmark = useSelector((state: RootState) =>
    state.app.permissions.includes("delete_landmark")
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const isProgrammaticMove = useRef(false);
  const [shouldFitView, setShouldFitView] = useState(false);
  const [isDrawingFinished, setIsDrawingFinished] = useState(false);
  const [drawnCoordinates, setDrawnCoordinates] = useState<string>("");
  const [drawnFeature, setDrawnFeature] = useState<ol.Feature<Polygon> | null>(
    null
  );
  const isInitialLoad = useRef(true);
const lastSelectedLandmarkId = useRef<number | null>(null);

  //*********************Initialize the map**************************************
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
    let previousZoom = map.getView().getZoom();

    map.on("pointermove", (event) => {
      const coords = toLonLat(event.coordinate);
      setMousePosition(`${coords[0].toFixed(7)},${coords[1].toFixed(7)} `);
    });
    map.on("moveend", () => {
      const currentZoom = map.getView().getZoom();

      if (currentZoom !== previousZoom) {
        previousZoom = currentZoom;
        fetchLandmarksInView();
      }

      isProgrammaticMove.current = false;
    });

    return map;
  };

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = initializeMap();
      fetchLandmarksInView();
    }

    let previousZoom = mapInstance.current?.getView().getZoom();

    // Store the event key for moveend only
    let moveEndKey: any = null;
    if (mapInstance.current) {
      moveEndKey = mapInstance.current.on("moveend", () => {
        const currentZoom = mapInstance.current?.getView().getZoom();

        if (currentZoom !== previousZoom) {
          previousZoom = currentZoom;
          fetchLandmarksInView();
        }

        isProgrammaticMove.current = false;
      });
    }

    return () => {
      if (mapInstance.current && moveEndKey) {
        mapInstance.current.un("moveend", moveEndKey);
      }
    };
  }, [isOpen, onDrawEnd, navigate, landmarkRefreshKey]);

  const fetchLandmarksInView = async () => {
    if (!mapInstance.current || isProgrammaticMove.current) return;

    // Get current map center
    const center = toLonLat(mapInstance.current.getView().getCenter()!);
    const location = `POINT(${center[0]} ${center[1]})`;

    // Adjust limit based on zoom level (fewer landmarks when zoomed out)
    const zoom = mapInstance.current.getView().getZoom()!;
    const limit = Math.min(100, Math.max(20, Math.floor(zoom * 5))); // Example: 20-100 landmarks

    try {
      const response = await dispatch(
        landmarkListApi({
          location, // Center point
          limit, // Dynamic limit based on zoom
          order_by: 2, // Order by distance from location
          order_in: 1, // ASC (nearest first)
        })
      ).unwrap();
      console.log("response", response);

      setLandmarks(response.data);
    } catch (error: any) {
      showErrorToast(error.message|| "Error fetching landmarks");
    }
  };

  const parseWKTBoundary = (wkt: string): [number, number][] => {
    try {
      // Handle different WKT formats
      const cleaned = wkt
        .replace(/POLYGON\s*\(\(\s*/, "")
        .replace(/\s*\)\)/, "")
        .trim();

      if (!cleaned) throw new Error("Empty WKT after cleaning");

      return cleaned.split(",").map((pair) => {
        const coords = pair.trim().split(/\s+/);
        if (coords.length !== 2) throw new Error("Invalid coordinate pair");
        const [lon, lat] = coords.map(Number);
        if (isNaN(lon) || isNaN(lat)) throw new Error("Invalid coordinates");
        return fromLonLat([lon, lat]) as [number, number];
      });
    } catch (error) {
      console.error("Failed to parse WKT:", wkt, error);
      throw error;
    }
  };

  const parseWKTPoint = (wkt: string): [number, number] | null => {
    try {
      const cleaned = wkt
        .replace(/^POINT\s*\(\s*/, "") // Remove "POINT" and opening parenthesis
        .replace(/\s*\)$/, "") // Remove closing parenthesis
        .trim(); // Trim any remaining whitespace

      const [lon, lat] = cleaned.split(/\s+/).map(Number); // Split on one or more whitespace chars

      if (isNaN(lon) || isNaN(lat)) {
        throw new Error("Invalid coordinates");
      }
      return [lon, lat];
    } catch (e) {
      console.error("Invalid WKT Point:", wkt, e);
      return null;
    }
  };

  const clearBoundaries = () => {
    vectorSource.current.clear();
    setDrawingArea("");
    setIsAddingBusStop(false);
    removePointInteraction();
  };

  const removePointInteraction = () => {
    if (mapInstance.current && pointInteraction.current) {
      mapInstance.current.removeInteraction(pointInteraction.current);
      pointInteraction.current = null;
    }
  };

  //***************Update the map when the selected boundary changes************
  useEffect(() => {
    if (
      (selectedBoundary || selectedLandmark?.boundary) &&
      mapInstance.current
    ) {
      const boundary = selectedBoundary || selectedLandmark?.boundary;
      if (!boundary) return;

      isProgrammaticMove.current = true;

      try {
        const coordinates = boundary
          .replace("POLYGON((", "")
          .replace("))", "")
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
          callback: () => {
            // Reset the flag after animation completes
            isProgrammaticMove.current = false;
          },
        });
      } catch (error) {
        console.error("Error parsing boundary:", error);
        isProgrammaticMove.current = false;
      }
    }
  }, [selectedBoundary, selectedLandmark]);

  //*****************Combined display logic for landmarks and bus stops*********
useEffect(() => {
  if (!mapInstance.current) return;

  vectorSource.current.clear();
  const features: ol.Feature[] = [];

  // ===== 1. Drawn polygon before saving =====
  if (drawnFeature) {
    drawnFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: "rgba(17, 98, 105, 1)",
          width: 4,
        }),
        fill: new Fill({
          color: "rgba(16, 219, 219, 0.2)",
        }),
      })
    );
    features.push(drawnFeature);
  }

  // ===== 2. All landmarks =====
  if (landmarks.length > 0) {
    landmarks.forEach((landmark) => {
      if (!landmark.boundary) return;

      try {
        const coordinates = parseWKTBoundary(landmark.boundary);
        const polygon = new Polygon([coordinates]);
        const feature = new ol.Feature(polygon);

        const isSelected = selectedLandmark?.id === landmark.id;

        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: isSelected ? "rgb(255, 149, 0)" : "rgba(0, 0, 255, 0.7)",
              width: isSelected ? 3 : 2,
            }),
            fill: new Fill({
              color: isSelected
                ? "rgba(221, 201, 75, 0.3)"
                : "rgba(0, 0, 255, 0.1)",
            }),
          })
        );

        features.push(feature);

        // Landmark label
        const interiorPoint = polygon.getInteriorPoint();
        const labelFeature = new ol.Feature(interiorPoint);

        labelFeature.setStyle(
          new Style({
            text: new Text({
              text: landmark.name || "Landmark",
              font: "bold 12px Arial",
              fill: new Fill({ color: "darkblue" }),
              stroke: new Stroke({ color: "#FFF", width: 3 }),
              textAlign: "center",
            }),
          })
        );

        features.push(labelFeature);
      } catch (err) {
        console.error(`Error processing landmark ${landmark.id}:`, err);
      }
    });
  }

  // ===== 3. Selected boundary (manual boundary string) =====
  if (selectedBoundary) {
    try {
      const coordinates = selectedBoundary
        .split(",")
        .map((coord) => coord.trim().split(" ").map(Number))
        .map((coord) => fromLonLat(coord));

      const polygon = new Polygon([coordinates]);
      const feature = new ol.Feature(polygon);

      // Label for top-center
      const extent = polygon.getExtent();
      const [minX, , maxX, maxY] = extent;
      const centerX = (minX + maxX) / 2;
      const topY = maxY;

      const labelFeature = new ol.Feature({
        geometry: new Point([centerX, topY]),
        name: selectedLandmark?.name || "Landmark",
      });

      labelFeature.setStyle(
        new Style({
          text: new Text({
            text: `LANDMARK NAME: ${(selectedLandmark?.name || "Landmark").toUpperCase()}`,
            font: "bold 15px Arial",
            fill: new Fill({ color: "darkblue" }),
            stroke: new Stroke({ color: "#FFF", width: 3 }),
            offsetY: -10,
            textAlign: "center",
          }),
        })
      );

      feature.setStyle(
        new Style({
          stroke: new Stroke({ color: "rgb(255, 149, 0)", width: 3 }),
          fill: new Fill({ color: "rgba(221, 201, 75, 0.3)" }),
        })
      );

      features.push(feature, labelFeature);
    } catch (error) {
      console.error("Error parsing selectedBoundary:", error);
    }
  }
  // ===== 4. Selected landmark =====
  else if (selectedLandmark?.boundary) {
    try {
      const coordinates = parseWKTBoundary(selectedLandmark.boundary);
      const polygon = new Polygon([coordinates]);
      const feature = new ol.Feature(polygon);

      feature.setStyle(
        new Style({
          stroke: new Stroke({ color: "rgb(255, 149, 0)", width: 3 }),
          fill: new Fill({ color: "rgba(221, 201, 75, 0.3)" }),
          text: new Text({
            text: selectedLandmark.name || "Unnamed Landmark",
            font: "bold 12px Arial",
            fill: new Fill({ color: "#000" }),
            stroke: new Stroke({ color: "#FFF", width: 3 }),
            offsetY: -25,
          }),
        })
      );

      features.push(feature);
    } catch (err) {
      console.error("Error parsing selectedLandmark:", err);
    }
  }

  // ===== 5. Bus stops inside selected landmark =====
  if (busStops && selectedLandmark) {
    const busStopFeatures = busStops
      .filter((stop) => stop.landmark_id === selectedLandmark.id)
      .map((stop) => {
        try {
          const parsed = parseWKTPoint(stop.location);
          if (!parsed) return null;

          const [lon, lat] = parsed;
          const point = new Point(fromLonLat([lon, lat]));
          const feature = new ol.Feature(point);

          feature.setStyle(
            new Style({
              image: new Icon({
                src: busstopimage,
                scale: 0.1,
                anchor: [0.5, 1],
              }),
              text: new Text({
                text: ` ${stop.name || "Bus Stop"}`,
                font: "bold 12px Arial",
                fill: new Fill({ color: "#000" }),
                stroke: new Stroke({ color: "#FFF", width: 3 }),
                offsetY: -25,
              }),
            })
          );

          return feature;
        } catch (e) {
          console.error("Error creating bus stop feature:", e);
          return null;
        }
      })
      .filter(Boolean) as ol.Feature[];

    features.push(...busStopFeatures);
  }

  // ===== 6. Add features =====
   if (features.length > 0) {
    vectorSource.current.addFeatures(features);

    // Only fit view if:
    // 1. It's the initial load, OR
    // 2. The selected landmark has changed, OR
    // 3. We explicitly requested a fit (shouldFitView)
    const landmarkChanged = selectedLandmark && 
                          selectedLandmark.id !== lastSelectedLandmarkId.current;
    
    if (isInitialLoad.current || landmarkChanged || shouldFitView) {
      const extent = vectorSource.current.getExtent();
      if (extent[0] !== Infinity) {
        isProgrammaticMove.current = true;
        mapInstance.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          callback: () => {
            isProgrammaticMove.current = false;
            isInitialLoad.current = false;
            lastSelectedLandmarkId.current = selectedLandmark?.id || null;
            setShouldFitView(false);
          }
        });
      }
    }
  }
}, [landmarks, selectedLandmark?.id, shouldFitView, drawnFeature])

  //************************check for overlaps******************************************************

const checkForOverlaps = (newPolygon: Polygon): boolean => {
  const features = vectorSource.current.getFeatures();
  
  for (const feature of features) {
    const geometry = feature.getGeometry();
    if (!(geometry instanceof Polygon)) continue;

    if (
      geometry.intersectsExtent(newPolygon.getExtent()) &&
      polygonsIntersect(newPolygon, geometry)
    ) {
      return true;
    }
  }
  return false;
};


  // Helper function to check if two polygons intersect
  const polygonsIntersect = (poly1: Polygon, poly2: Polygon): boolean => {
    const coords1 = poly1.getCoordinates()[0];
    const coords2 = poly2.getCoordinates()[0];

    // Check each edge of poly1 against each edge of poly2
    for (let i = 0; i < coords1.length - 1; i++) {
      for (let j = 0; j < coords2.length - 1; j++) {
        if (
          edgesIntersect(
            coords1[i] as [number, number],
            coords1[i + 1] as [number, number],
            coords2[j] as [number, number],
            coords2[j + 1] as [number, number]
          )
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Helper function to check if two line segments intersect
  const edgesIntersect = (
    a1: [number, number],
    a2: [number, number],
    b1: [number, number],
    b2: [number, number]
  ): boolean => {
    // Implementation of line segment intersection check
    // Using the cross product method
    const ccw = (
      a: [number, number],
      b: [number, number],
      c: [number, number]
    ) => {
      return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
    };

    return (
      ccw(a1, b1, b2) !== ccw(a2, b1, b2) && ccw(a1, a2, b1) !== ccw(a1, a2, b2)
    );
  };

  //*****************************landmark drawing functions*********************

const startDrawing = () => {
  if (!mapInstance.current) return;

  // Clear any existing draw interaction
  removeDrawInteraction();
  
  // Clear any existing drawn feature
  clearDrawnFeature();

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
      stroke: new Stroke({ color: "rgba(0, 0, 255, 1)", width: 2 }),
      fill: new Fill({ color: "rgba(0, 0, 255, 0.2)" }),
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

    setDrawnFeature(event.feature as ol.Feature<Polygon>);
    const coordinates = polygon
      .getCoordinates()[0]
      .map((coord) => toLonLat(coord));
    const formattedCoordinates = coordinates
      .map((coord) => coord.join(" "))
      .join(",");

    setDrawnCoordinates(formattedCoordinates);
    setIsDrawing(false);
    setIsDrawingFinished(true);
    onDrawingChange(false);
  });

  drawInteraction.current = draw;
  mapInstance.current.addInteraction(draw);
  setIsDrawing(true);
  onDrawingChange(true);
  setDrawingArea(""); // Reset area display when starting new drawing
};
  const removeDrawInteraction = () => {
  if (mapInstance.current && drawInteraction.current) {
    mapInstance.current.removeInteraction(drawInteraction.current);
    drawInteraction.current = null;
    setIsDrawing(false);
    onDrawingChange(false);
  }
};
const clearDrawnFeature = () => {
  if (drawnFeature) {
    vectorSource.current.removeFeature(drawnFeature);
    setDrawnFeature(null);
  }
  setDrawnCoordinates("");
  setDrawingArea(""); // Clear the area display
  setIsDrawingFinished(false);
  setIsDrawing(false); // Ensure drawing state is reset
};

useEffect(() => {
  if (!mapInstance.current) {
    mapInstance.current = initializeMap();
    fetchLandmarksInView();
  }
  
  if (selectedLandmark) {
    removeDrawInteraction();
    return;
  }

  // Only start drawing if conditions are met
  if (canCreateLandmark && !selectedLandmark) {
    if (!isDrawing && !isDrawingFinished) {
      startDrawing();
    }
  }
}, [canCreateLandmark, isDrawing, isDrawingFinished, selectedLandmark]);
  //*********************************bus stop adding functions************************************
  const toggleBusStopAdding = () => {
    if (!mapInstance.current || !selectedLandmark) return;
    if (!isAddingBusStop) {
      showInfoToast("Select bus stop inside the boundary.");
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
          backgroundColor: "#f5f5f5ff",
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
          {canCreateLandmark && isDrawingFinished && (
            <Box sx={{ display: "flex", gap: 1 }}>
              
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={() => {
                  if (drawnCoordinates) {
                    onDrawEnd(drawnCoordinates);
                    clearDrawnFeature();
                  }
                }}
                sx={{
                  backgroundColor: "#00008B",
                  color: "white",
                }}
              >
                Add Landmark
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={clearDrawnFeature}
              >
                Cancel
              </Button>
            </Box>
          )}

          {selectedLandmark && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {(canCreateLandmark || canUpdateLandmark) && (
                <Button
                  size="small"
                  color={isAddingBusStop ? "secondary" : "primary"}
                  variant="contained"
                  onClick={toggleBusStopAdding}
                  sx={{
                    backgroundColor: "#00008B",
                    color: "white",
                  }}
                >
                  {isAddingBusStop ? "Cancel" : "Add Bus Stop"}
                </Button>
              )}
            </Box>
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
            {canUpdateLandmark && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={onUpdateClick}
                disabled={!canUpdateLandmark}
                sx={{
                  "&.Mui-disabled": {
                    backgroundColor: "#81c784 !important",
                    color: "#ffffff99",
                  },
                }}
              >
                Update
              </Button>
            )}

            {canDeleteLandmark && (
              <Button
                variant="contained"
                size="small"
                color="error"
                onClick={onDeleteClick}
                disabled={!canDeleteLandmark}
              >
                Delete
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MapComponent;
