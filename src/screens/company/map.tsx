import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { OSM, XYZ, Vector as VectorSource } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Icon } from "ol/style";
import companyLocation from "../../assets/png/companyLocation.png";

interface MapComponentProps {
  onSelectLocation?: (coordinates: {
    lat: number;
    lng: number;
  }) => void;
  isOpen: boolean;
  initialCoordinates?: { lat: number; lng: number };
}

const MapComponent: React.FC<MapComponentProps> = ({
  onSelectLocation,
  isOpen,
  initialCoordinates,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
  const [mousePosition, setMousePosition] = useState<string>("");
  const [isMarkingEnabled, setIsMarkingEnabled] = useState<boolean>(false);
  const [markerLayer, setMarkerLayer] = useState<VectorLayer<
    VectorSource<Feature<Point>>
  > | null>(null);
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const map = new Map({
        controls: [],
        layers: [new TileLayer({ source: new OSM() })],
        target: mapRef.current,
        view: new View({
          center: initialCoordinates
            ? fromLonLat([initialCoordinates.lng, initialCoordinates.lat])
            : fromLonLat([76.9366, 8.5241]),
          zoom: 10,
          minZoom: 3,
          maxZoom: 18,
        }),
      });

      map.on("pointermove", (event) => {
        const coords = toLonLat(event.coordinate);
        setMousePosition(`${coords[0].toFixed(7)}, ${coords[1].toFixed(7)}`);
      });

      mapInstance.current = map;
    }
    if (initialCoordinates && mapInstance.current) {
      const marker = new Feature({
        geometry: new Point(
          fromLonLat([initialCoordinates.lng, initialCoordinates.lat])
        ),
      });

      const markerSource = new VectorSource({
        features: [marker],
      });

      const newMarkerLayer = new VectorLayer({
        source: markerSource,
        style: new Style({
          image: new Icon({
            src: companyLocation,
            scale: 1,
          }),
        }),
      });
      if (markerLayer) {
        mapInstance.current.removeLayer(markerLayer);
      }
      mapInstance.current.addLayer(newMarkerLayer);
      setMarkerLayer(newMarkerLayer);

    }

    if (isOpen) {
      setTimeout(() => {
        mapInstance.current?.updateSize();
      }, 500);
    }
  }, [isOpen, initialCoordinates]);

  useEffect(() => {
    if (!mapInstance.current || !onSelectLocation) return;

    const map = mapInstance.current;

    const handleMapClick = async (event: any) => {
      if (!isMarkingEnabled) return;
      const coords = toLonLat(event.coordinate);
      onSelectLocation({ lat: coords[1], lng: coords[0] });
      const marker = new Feature({
        geometry: new Point(event.coordinate),
      });

      const markerSource = new VectorSource({
        features: [marker],
      });

      const newMarkerLayer = new VectorLayer({
        source: markerSource,
        style: new Style({
          image: new Icon({
            src: companyLocation,
            scale: 1,
          }),
        }),
      });

      if (markerLayer) {
        map.removeLayer(markerLayer);
      }

      map.addLayer(newMarkerLayer);
      setMarkerLayer(newMarkerLayer);
    };

    map.on("click", handleMapClick);

    return () => {
      map.un("click", handleMapClick);
    };
  }, [isMarkingEnabled, markerLayer, onSelectLocation]);



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

          <Button
            onClick={() => setIsMarkingEnabled(!isMarkingEnabled)}
            variant="contained"
            size="small"
            color={isMarkingEnabled ? "secondary" : "primary"}
          >
            {isMarkingEnabled ? "Disable Marking" : "Enable Marking"}
          </Button>
        </Box>

        <Typography variant="body2">
          <strong>{mousePosition}</strong>
        </Typography>
      </Box>
      <Box ref={mapRef} width="100%" height="500px" flex={1} />
    </Box>
  );
};

export default MapComponent;