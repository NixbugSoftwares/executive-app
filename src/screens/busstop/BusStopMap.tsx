import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { OSM, XYZ } from "ol/source";
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
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { useNavigate } from "react-router-dom";
import * as ol from "ol";
import localStorageHelper from "../../utils/localStorageHelper";
import { Fill, Stroke } from 'ol/style';
import { Refresh } from "@mui/icons-material";
import { showErrorToast } from "../../common/toastMessageHelper";
import busstopimage from "../../assets/png/busstopimage.png";
interface BusStop {
  id: number;
  name: string;
  location: string;
  status: string;
  parsedLocation?: [number, number] | null; 
}
interface Landmark {
  id: number;
  landmarkName: string;
  boundary: string;
  importance: string;
  status: string;
}


interface MapComponentProps {
  onDrawEnd: (coordinates: string) => void;
  isOpen: boolean;
  selectedBoundary?: string;
  selectedBuststop?: BusStop | null;
  onUpdateClick: () => void;
  onDeleteClick: () => void;
  handleCloseRowClick: () => void;
  clearBoundaries: () => void;
  vectorSource: React.MutableRefObject<VectorSource>;
  busStops?: BusStop[];
  landmarkList?: Landmark[];
}

const MapComponent: React.FC<MapComponentProps> = ({
  onDrawEnd,
  isOpen,
  selectedBoundary,
  selectedBuststop,
  onUpdateClick,
  onDeleteClick,
  handleCloseRowClick,
  busStops,
  landmarkList
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
  const mapInstance = useRef<Map | null>(null);
  const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
  const [mousePosition, setMousePosition] = useState<string>("");
  const navigate = useNavigate();
  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageLandmark = roleDetails?.manage_landmark || false;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAllBusStops, setShowAllBusStops] = useState(false);

  const clearBoundaries = () => {
    vectorSource.current.clear();
    setShowAllBusStops(false);
  };

  const parsePointString = (pointString: string): [number, number] | null => {
    if (!pointString) return null;
    const matches = pointString.match(/POINT\(([^)]+)\)/);
    if (!matches) return null;
    
    const coords = matches[1].split(' ');
    if (coords.length !== 2) return null;
    
    return [parseFloat(coords[0]), parseFloat(coords[1])];
  };



  //************************************Initialize the map********************************
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
        setMousePosition(`${coords[0].toFixed(7)},${coords[1].toFixed(7)} `);
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


//*************************************bus stop view with boundary*************************
useEffect(() => {
  if (!mapInstance.current) return;
  vectorSource.current.clear();

  // If we have a selected bus stop
  if (selectedBuststop?.parsedLocation) {
    // Show bus stop marker
    const [lon, lat] = selectedBuststop.parsedLocation;
    const coordinates = fromLonLat([lon, lat]);
    const point = new Point(coordinates);
    const feature = new ol.Feature(point);
    feature.setStyle(
      new Style({
        image: new Icon({
          src: busstopimage,
          scale: 0.1,
          anchor: [0.5, 1],
        }),
      })
    );
    vectorSource.current.addFeature(feature);

    const landmark = landmarkList?.find(l => l.id === (selectedBuststop as any).landmark_id);
    if (landmark?.boundary) {
      const coords = landmark.boundary.split(',').map(pair  => {
        const [x, y] = pair.trim().split(' ').map(Number);
        return fromLonLat([x, y]);
      });
      
      const polygon = new Polygon([coords]);
      const boundaryFeature = new ol.Feature(polygon);
      boundaryFeature.setStyle(
        new Style({
          fill: new Fill({
            color: "rgba(221, 201, 75, 0.5)",
          }),
          stroke: new Stroke({
            color: "rgb(255, 149, 0) ",
            width: 2,
          }),
        })
      );
      vectorSource.current.addFeature(boundaryFeature);
    }

    // Fit view to show both the bus stop and its landmark
    const extent = vectorSource.current.getExtent();
    mapInstance.current.getView().fit(extent, {
      padding: [50, 50, 50, 50],
      duration: 1000,
    });
  }

  // Show all bus stops if enabled
  if (showAllBusStops && busStops) {
    const features: ol.Feature[] = [];
    busStops.forEach((busStop) => {
      const coords = parsePointString(busStop.location);
      if (coords) {
        const [lon, lat] = coords;
        const coordinates = fromLonLat([lon, lat]);
        const point = new Point(coordinates);
        const feature = new ol.Feature(point);
        
        feature.setStyle(
          new Style({
            image: new Icon({
              src: busstopimage,
              scale: 0.1,
              anchor: [0.5, 1],
            }),
          })
        );
        
        features.push(feature);
      }
    });
    vectorSource.current.addFeatures(features);
    if (features.length > 0) {
      const extent = vectorSource.current.getExtent();
      mapInstance.current.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
      });
    }
  }
}, [selectedBuststop, showAllBusStops, busStops, landmarkList]);


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

          {!selectedBuststop &&  (
            <Box>
              <Tooltip title="Clear Drawings" placement="bottom">
                <IconButton color="warning" onClick={clearBoundaries}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <Tooltip
            title={
              showAllBusStops
                ? "Hide all bus stops"
                : "Click to view all bus stops"
            }
            arrow
          >
            <IconButton
              onClick={() => {
                setShowAllBusStops(!showAllBusStops);
                if (!showAllBusStops && selectedBoundary) {
                }
              }}
              sx={{ ml: 1 }}
            >
              {showAllBusStops ? <DirectionsBusIcon sx={{ color: "blue" }} /> : <DirectionsBusIcon  />}
            </IconButton>
          </Tooltip>
          {/* <Button onClick={handleOpenCreateModal}>add bus stop</Button> */}
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
            <strong>[{mousePosition?mousePosition:"coordinates"}]</strong>
          </Typography>
        </Box>

        {selectedBuststop && (
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
