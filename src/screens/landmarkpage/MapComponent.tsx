import React, { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { OSM } from "ol/source";
import { Draw } from "ol/interaction";
import { Polygon } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Vector as VectorSource } from "ol/source";

interface MapComponentProps {
  onDrawEnd: (coordinates: string) => void;
  isOpen: boolean; 
}

const MapComponent: React.FC<MapComponentProps> = ({ onDrawEnd, isOpen }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const vectorSource = useRef(new VectorSource());
  const mapInstance = useRef<Map | null>(null); 

  useEffect(() => {
    if (!mapRef.current) return;

    
    if (!mapInstance.current) {
      mapInstance.current = new Map({
        target: mapRef.current!,
        layers: [
          new TileLayer({ source: new OSM() }),
          new VectorLayer({ source: vectorSource.current }),
        ],
        view: new View({
          center: fromLonLat([78.9629, 20.5937]), 
          zoom: 5, 
          minZoom: 3,
          maxZoom: 18, 
        }),
      });

      const draw = new Draw({
        source: vectorSource.current,
        type: "Polygon",
      });

      draw.on("drawend", (event) => {
        const polygon = event.feature.getGeometry() as Polygon;
        const coordinates = polygon.getCoordinates()[0].map((coord) => coord.join(" "));
        onDrawEnd(coordinates.join(" , "));
      });

      mapInstance.current.addInteraction(draw);
    }

    
    if (isOpen) {
      setTimeout(() => {
        mapInstance.current!.updateSize();
      }, 300);
    }
  }, [isOpen, onDrawEnd]);

  return <div ref={mapRef} style={{ width: "100%", height: "500px" }} />;
};

export default MapComponent;
