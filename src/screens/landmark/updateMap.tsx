import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { OSM } from "ol/source";
import { Draw } from "ol/interaction";
import { Polygon } from "ol/geom";
import { fromLonLat, toLonLat } from "ol/proj";
import { Vector as VectorSource } from "ol/source";
import { Feature } from "ol";
import { Style, Stroke, Fill } from "ol/style";
import { Button, Box } from "@mui/material";
import { Coordinate } from "ol/coordinate";

interface MapComponentProps {
  initialBoundary?: string;
  onSave: (coordinates: string) => void;
  onClose: () => void;
}

const UpdateMapComponent: React.FC<MapComponentProps> = ({ initialBoundary, onSave, onClose }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
  const mapInstance = useRef<Map | null>(null);
  const drawInteraction = useRef<Draw | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [updatedCoordinates, setUpdatedCoordinates] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Ensure the map container has dimensions
    if (mapRef.current.clientWidth === 0 || mapRef.current.clientHeight === 0) {
      console.error("Map container has no dimensions. Ensure it has width and height.");
      return;
    }

    // Initialize the map
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

    mapInstance.current = map;

    // Load initial boundary if provided and valid
    if (initialBoundary) {
      try {
        console.log("Initial Boundary:", initialBoundary); 
        const coordinatesString = initialBoundary
          .replace("POLYGON ((", "") 
          .replace("))", "") 
          .split(",") 
          .map((coord) => coord.trim().split(" ").map(Number)); 

        console.log("Parsed Coordinates:", coordinatesString); 
        const coordinates = coordinatesString.map((coord) => fromLonLat(coord));
        if (coordinates.length >= 3) {
          const polygon = new Polygon([coordinates]);
          vectorSource.current.clear();
          vectorSource.current.addFeature(new Feature(polygon));

          const extent = polygon.getExtent();
          map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 1000,
          });
        } else {
          console.error("Invalid polygon: At least 3 coordinates are required.");
        }
      } catch (error) {
        console.error("Error parsing initialBoundary:", error);
      }
    }

    // Cleanup on unmount
    return () => {
      map.setTarget(undefined); // Remove the map from the DOM
    };
  }, [initialBoundary]);

  const startDrawing = () => {
    if (!mapInstance.current) return;

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

      const wktCoordinates = `POLYGON ((${formattedCoordinates}))`;
      console.log("Updated WKT Coordinates:", wktCoordinates); 
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
      onClose();
    }
  };

  return (
    <div>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "500px", minHeight: "500px" }}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={startDrawing}
          disabled={isDrawing}
        >
          {isDrawing ? "Drawing..." : "Draw Updated Boundary"}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleConfirm}
          disabled={!updatedCoordinates}
          sx={{ ml: 2 }}
        >
          Confirm
        </Button>
      </Box>
    </div>
  );
};

export default UpdateMapComponent;