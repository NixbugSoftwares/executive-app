import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { OSM, XYZ } from "ol/source";
import { Select as OlSelect } from "ol/interaction";
import { Polygon, LineString } from "ol/geom";
import { fromLonLat, toLonLat } from "ol/proj";
import { Vector as VectorSource } from "ol/source";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import { showErrorToast } from "../../common/toastMessageHelper";
import { landmarkListApi } from "../../slices/appSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/Store";
import { Style, Stroke, Fill, Circle} from "ol/style";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { getCenter } from "ol/extent";
import Text from 'ol/style/Text';
interface Landmark {
  id: string;
  name: string;
  boundary: string;
  importance: string;
  status: string;
}

interface SelectedLandmark {
  id: string;
  name: string;
  sequenceId: number;
  arrivalTime: string;
  departureTime: string;
}

interface MapComponentProps {
  onAddLandmark: (landmark: SelectedLandmark) => void;
  isSelecting: boolean;
  onClearRoute?: () => void;
}

const MapComponent = React.forwardRef(({ onAddLandmark, isSelecting }: MapComponentProps, ref) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
  const mapInstance = useRef<Map | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
  const [mousePosition, setMousePosition] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [showAllBoundaries, setShowAllBoundaries] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<SelectedLandmark | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingLandmark, setIsAddingLandmark] = useState(false);
  const selectInteractionRef = useRef<OlSelect | null>(null);
  const routePathSource = useRef(new VectorSource());
  const routeCoordsRef = useRef<Coordinate[]>([]);
  // Initialize the map
  const initializeMap = () => {
    if (!mapRef.current) return null;

    const map = new Map({
      controls: [],
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: vectorSource.current }),
        new VectorLayer({ source: routePathSource.current }),
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

    return map;
  };

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = initializeMap();
    }
    fetchLandmark();
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    const layers = mapInstance.current.getLayers().getArray();
    const vectorLayer = layers[1] instanceof VectorLayer ? layers[1] : null;

    if (!vectorLayer) return;

    if (isAddingLandmark) {
      if (selectInteractionRef.current) {
        mapInstance.current.removeInteraction(selectInteractionRef.current);
      }
      const selectInteraction = new OlSelect({
        layers: [vectorLayer],
      });

      selectInteraction.on("select", (e) => {
        const selectedFeature = e.selected[0];
        if (selectedFeature) {
          const landmarkId = selectedFeature.get("id");
          const landmark = landmarks.find((lm) => lm.id === landmarkId);

          if (landmark) {
            setSelectedLandmark({
              id: landmark.id,
              name: landmark.name,
              sequenceId: 0, 
              arrivalTime: "",
              departureTime: "",
            });
            setIsModalOpen(true);
          }
        }
        selectInteraction.getFeatures().clear();
      });

      mapInstance.current.addInteraction(selectInteraction);
      selectInteractionRef.current = selectInteraction;
    } else {
      if (selectInteractionRef.current) {
        mapInstance.current.removeInteraction(selectInteractionRef.current);
        selectInteractionRef.current = null;
      }
    }

    return () => {
      if (selectInteractionRef.current) {
        mapInstance.current?.removeInteraction(selectInteractionRef.current);
      }
    };
  }, [isAddingLandmark, landmarks]);

  // Fetch landmarks
  const fetchLandmark = () => {
    dispatch(landmarkListApi())
      .unwrap()
      .then((res: any[]) => {
        const formattedLandmarks = res.map((landmark: any) => ({
          id: landmark.id,
          name: landmark.name,
          boundary: extractRawPoints(landmark.boundary),
          importance:
            landmark.importance === 1
              ? "Low"
              : landmark.importance === 2
              ? "Medium"
              : "High",
          status: landmark.status === 1 ? "Validating" : "Verified",
        }));
        setLandmarks(formattedLandmarks);
      })
      .catch((err: any) => {
        showErrorToast(err);
      });
  };

  const extractRawPoints = (polygonString: string): string => {
    if (!polygonString) return "";
    const matches = polygonString.match(/\(\((.*?)\)\)/);
    return matches ? matches[1] : "";
  };

  useEffect(() => {
    if (!mapInstance.current) return;

    vectorSource.current.clear();
    const features: Feature[] = [];

    if (showAllBoundaries && landmarks) {
      landmarks.forEach((landmark) => {
        if (landmark.boundary) {
          try {
            const coordinates = landmark.boundary
              .split(",")
              .map((coord: string) => coord.trim().split(" ").map(Number))
              .map((coord: Coordinate) => fromLonLat(coord));

            const polygon = new Polygon([coordinates]);
            const feature = new Feature(polygon);
            feature.set("id", landmark.id);
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
            features.push(feature);
          } catch (error) {
            console.error(`Error processing landmark ${landmark.id}:`, error);
          }
        }
      });
    }

    if (features.length > 0) {
      vectorSource.current.addFeatures(features);
      const extent = vectorSource.current.getExtent();
      if (extent[0] !== Infinity) {
        mapInstance.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
        });
      }
    }
  }, [showAllBoundaries, landmarks]);

  // Handle search
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
        showErrorToast("Location not found.");
      }
    } catch (error: any) {
      showErrorToast(error);
    }
  };

  // Change map type
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


  const highlightSelectedLandmark = (landmarkId: string) => {
    const feature = vectorSource.current
      .getFeatures()
      .find((f) => f.get("id") === landmarkId);
  
    if (feature) {
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "rgba(255, 0, 0, 1)", 
            width: 3,
          }),
          fill: new Fill({
            color: "rgba(255, 0, 0, 0.2)", 
          }),
        })
      );
    }
  };

  const updateRoutePath = (landmark: SelectedLandmark) => {
    const feature = vectorSource.current
      .getFeatures()
      .find((f) => f.get("id") === landmark.id);
  
    if (!feature) return;
  
    const geometry = feature.getGeometry();
    if (geometry instanceof Polygon) {
      // Get the center of the polygon instead of a random coordinate
      const center = getCenter(geometry.getExtent());
      routeCoordsRef.current.push(center);
  
      // Clear previous features
      routePathSource.current.clear();
      
      if (routeCoordsRef.current.length > 1) {
        // Add the main line connecting all points
        const routeFeature = new Feature({
          geometry: new LineString(routeCoordsRef.current),
        });
  
        routeFeature.setStyle(
          new Style({
            stroke: new Stroke({
              color: "rgba(128, 0, 117, 0.9)",
              width: 2,
            }),
          })
        );
        routePathSource.current.addFeature(routeFeature);
      }
  
      // Add sequence numbers to landmarks
      routeCoordsRef.current.forEach((coord, index) => {
        const numberFeature = new Feature({
          geometry: new Point(coord),
        });
  
        numberFeature.setStyle(
          new Style({
            text: new Text({
              text: (index + 1).toString(),
              font: 'bold 14px Arial',
              fill: new Fill({ color: 'white' }),
              stroke: new Stroke({ color: 'black', width: 2 }),
              offsetY: -20,
            }),
            image: new Circle({
              radius: 8,
              fill: new Fill({ color: 'rgba(128, 0, 117, 0.9)' }),
              stroke: new Stroke({ color: 'white', width: 2 }),
            }),
          })
        );
        routePathSource.current.addFeature(numberFeature);
      });
    }
  };

  // Handle landmark addition
  const handleAddLandmark = () => {
    if (selectedLandmark?.arrivalTime && selectedLandmark.departureTime) {
      onAddLandmark(selectedLandmark);
      highlightSelectedLandmark(selectedLandmark.id);
      updateRoutePath(selectedLandmark); 
      setIsModalOpen(false);
    }
  };

  // Toggle landmark adding mode
  const toggleAddLandmarkMode = () => {
    const newAddingState = !isAddingLandmark;
    setIsAddingLandmark(newAddingState);
    
    // Automatically show boundaries when entering add mode
    if (newAddingState) {
      setShowAllBoundaries(true);
    }
  };

  const clearRoutePath = () => {
    routeCoordsRef.current = []; 
    routePathSource.current.clear();
    const features = vectorSource.current.getFeatures();
    features.forEach(feature => {
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
    });
  };
  
  React.useImperativeHandle(ref, () => ({
    clearRoutePath
  }));

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
              placeholder="Search Location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </Box>
          {isSelecting && (
          <Button
            variant="contained"
            color={isAddingLandmark ? "secondary" : "primary"}
            startIcon={<AddLocationAltIcon />}
            onClick={toggleAddLandmarkMode}
          >
            {isAddingLandmark ? "Cancel " : "Select Landmark"}
          </Button>
        )}

          <Tooltip
            title={showAllBoundaries ? "Hide landmarks" : "Show landmarks"}
          >
            <IconButton
              onClick={() => setShowAllBoundaries(!showAllBoundaries)}
            >
              <LocationOnIcon
                sx={{ color: showAllBoundaries ? "blue" : undefined }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box ref={mapRef} width="100%" height="calc(100% - 128px)" flex={1} />
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography variant="body2">
          <strong>[{mousePosition || "coordinates"}]</strong>
        </Typography>
      </Box>

      {/* Landmark Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>Add Landmark to Route</DialogTitle>
        <DialogContent>
          <Typography>Landmark: {selectedLandmark?.name}</Typography>
          <Typography>ID: {selectedLandmark?.id}</Typography>

          <TextField
            label="Arrival Time"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={selectedLandmark?.arrivalTime || ""}
            onChange={(e) =>
              setSelectedLandmark({
                ...selectedLandmark!,
                arrivalTime: e.target.value,
              })
            }
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Departure Time"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={selectedLandmark?.departureTime || ""}
            onChange={(e) =>
              setSelectedLandmark({
                ...selectedLandmark!,
                departureTime: e.target.value,
              })
            }
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddLandmark}
            color="primary"
            disabled={
              !selectedLandmark?.arrivalTime || !selectedLandmark?.departureTime
            }
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default MapComponent;