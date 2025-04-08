import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { OSM, XYZ } from "ol/source";
import { Point } from "ol/geom";
import { fromLonLat, toLonLat } from "ol/proj";
import { Vector as VectorSource } from "ol/source";
import { Feature } from "ol";
import { Style, Icon } from "ol/style";
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
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { Refresh } from "@mui/icons-material";
import busstopimage from "../../assets/png/busstopimage.png";
import { showErrorToast } from "../../common/toastMessageHelper";

interface BusStop {
  id: number;
  name: string;
  location: string;
  status?: string;
}

interface BusStopUpdateMapProps {
  initialLocation?: string;
  onSave: (coordinates: string) => void;
  onClose: () => void;
  busStops: BusStop[];
}

const BusStopUpdateMap: React.FC<BusStopUpdateMapProps> = ({
  initialLocation,
  onSave,
  onClose,
  busStops,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
  const busStopsSource = useRef(new VectorSource());
  const mapInstance = useRef<Map | null>(null);
  const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
  const [mousePosition, setMousePosition] = useState<string>("");
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
  const [showAllBusStops, setShowAllBusStops] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Parse WKT POINT string to coordinates
  const parsePointString = (pointString: string): [number, number] | null => {
    if (!pointString) return null;
    const matches = pointString.match(/POINT\(([^)]+)\)/);
    if (!matches) return null;

    const coords = matches[1].split(" ");
    if (coords.length !== 2) return null;

    return [parseFloat(coords[0]), parseFloat(coords[1])];
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      controls: [],
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ 
          source: busStopsSource.current,
          style: new Style({
            image: new Icon({
              src: busstopimage,
              scale: 0.1,
              anchor: [0.5, 1],
            }),
          }),
        }),
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
      setMousePosition(`${coords[0].toFixed(7)}, ${coords[1].toFixed(7)}`);
    });

    map.on("click", (event) => {
      const coords = toLonLat(event.coordinate);
      setSelectedPoint([coords[0], coords[1]]);
      
      // Clear previous point
      vectorSource.current.clear();
      
      // Add new point marker
      const point = new Point(event.coordinate);
      const feature = new Feature(point);
      feature.setStyle(
        new Style({
          image: new Icon({
            src: busstopimage,
            scale: 0.15,
            anchor: [0.5, 1],
          }),
        })
      );
      vectorSource.current.addFeature(feature);
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Load initial location and bus stops
  useEffect(() => {
    if (!mapInstance.current) return;

    vectorSource.current.clear();
    busStopsSource.current.clear();

    // Load initial bus stop location if provided
    if (initialLocation) {
      const coords = parsePointString(initialLocation);
      if (coords) {
        const [lon, lat] = coords;
        const coordinates = fromLonLat([lon, lat]);
        const point = new Point(coordinates);
        const feature = new Feature(point);
        feature.setStyle(
          new Style({
            image: new Icon({
              src: busstopimage,
              scale: 0.15,
              anchor: [0.5, 1],
            }),
          })
        );
        vectorSource.current.addFeature(feature);

        // Center map on the initial location
        mapInstance.current.getView().animate({
          center: coordinates,
          zoom: 16,
        });
      }
    }

    // Load other bus stops if enabled
    if (showAllBusStops) {
      busStops.forEach((busStop) => {
        const coords = parsePointString(busStop.location);
        if (coords) {
          const [lon, lat] = coords;
          const coordinates = fromLonLat([lon, lat]);
          const point = new Point(coordinates);
          const feature = new Feature(point);
          busStopsSource.current.addFeature(feature);
        }
      });
    }
  }, [initialLocation, busStops, showAllBusStops]);

  const handleConfirm = () => {
    if (selectedPoint) {
      const [lon, lat] = selectedPoint;
      onSave(`POINT(${lon.toFixed(7)} ${lat.toFixed(7)})`);
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
        showErrorToast("Location not found. Please try a different query.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      showErrorToast("Error searching for location. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Map Controls */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1,
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

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search Location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 200 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSearch}
            sx={{ backgroundColor: "green" }}
          >
            Search
          </Button>
        </Box>

        <Tooltip
          title={showAllBusStops ? "Hide bus stops" : "Show all bus stops"}
          arrow
        >
          <IconButton onClick={() => setShowAllBusStops(!showAllBusStops)}>
            {showAllBusStops ? (
              <DirectionsBusIcon color="primary" />
            ) : (
              <DirectionsBusIcon />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Map Container */}
      <Box
        ref={mapRef}
        sx={{
          flex: 1,
          minHeight: "400px",
          width: "100%",
          borderRadius: 1,
          overflow: "hidden",
          mt: 1,
        }}
      />

      {/* Coordinates and Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          p: 1,
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2">
          {selectedPoint
            ? `Selected: ${selectedPoint[0].toFixed(7)}, ${selectedPoint[1].toFixed(7)}`
            : mousePosition
            ? `Coordinates: ${mousePosition}`
            : "Click on map to select location"}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Clear selection" arrow>
            <IconButton
              onClick={() => {
                vectorSource.current.clear();
                setSelectedPoint(null);
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={!selectedPoint}
          >
            Confirm Location
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BusStopUpdateMap;