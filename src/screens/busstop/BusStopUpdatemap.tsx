// import React, { useEffect, useRef, useState } from "react";
// import Map from "ol/Map";
// import View from "ol/View";
// import TileLayer from "ol/layer/Tile";
// import VectorLayer from "ol/layer/Vector";
// import { OSM, XYZ } from "ol/source";
// import { Point, Polygon } from "ol/geom";
// import { fromLonLat, toLonLat } from "ol/proj";
// import { Vector as VectorSource } from "ol/source";
// import { Feature } from "ol";
// import { Style, Icon, Fill, Stroke } from "ol/style";
// import {
//   Box,
//   Button,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
//   Typography,
// } from "@mui/material";
// import busstopimage from "../../assets/png/busstopimage.png";
// import { showErrorToast } from "../../common/toastMessageHelper";
// interface BusStop {
//   id: number;
//   name: string;
//   location: string;
//   status?: string;
//   landmark_id?: number;
// }

// interface Landmark {
//   id: number;
//   landmarkName: string;
//   boundary: string;
//   importance: string;
//   status: string;
// }

// interface BusStopUpdateMapProps {
//   initialLocation?: string;
//   onSave: (coordinates: string) => void;
//   onClose: () => void;
//   busStops: BusStop[];
//   landmarks: Landmark[];
// }

// const BusStopUpdateMap: React.FC<BusStopUpdateMapProps> = ({
//   initialLocation,
//   onSave,
//   onClose,
//   busStops,
//   landmarks,
// }) => {
//   const mapRef = useRef<HTMLDivElement | null>(null);
//   const vectorSource = useRef(new VectorSource());
//   const mapInstance = useRef<Map | null>(null);
//   const [mapType, setMapType] = useState<"osm" | "satellite" | "hybrid">("osm");
//   const [mousePosition, setMousePosition] = useState<string>("");
//   const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [selectionMode, setSelectionMode] = useState(false);

  
//   // Parse WKT POINT string to coordinates
//   const parsePointString = (pointString: string): [number, number] | null => {
//     if (!pointString) return null;
//     const matches = pointString.match(/POINT\(([^)]+)\)/);
//     if (!matches) return null;

//     const coords = matches[1].split(" ");
//     if (coords.length !== 2) return null;

//     return [parseFloat(coords[0]), parseFloat(coords[1])];
//   };

//   // Initialize map
//   useEffect(() => {
//     if (!mapRef.current) return;

//     const map = new Map({
//       controls: [],
//       layers: [
//         new TileLayer({ source: new OSM() }),
//         new VectorLayer({ source: vectorSource.current }),
//       ],
//       target: mapRef.current,
//       view: new View({
//         center: fromLonLat([76.9366, 8.5241]),
//         zoom: 10,
//         minZoom: 3,
//         maxZoom: 18,
//       }),
//     });

//     map.on("pointermove", (event) => {
//       const coords = toLonLat(event.coordinate);
//       setMousePosition(`${coords[0].toFixed(7)}, ${coords[1].toFixed(7)}`);
//     });

//     mapInstance.current = map;

//     return () => {
//       map.setTarget(undefined);
//     };
//   }, []);

//   // Load initial location and landmark
//   useEffect(() => {
//     if (!mapInstance.current) return;

//     vectorSource.current.clear();
//     setSelectedPoint(null);

//     // Load initial bus stop location if provided
//     if (initialLocation) {
//       const coords = parsePointString(initialLocation);
//       if (coords) {
//         const [lon, lat] = coords;
//         const coordinates = fromLonLat([lon, lat]);
//         const point = new Point(coordinates);
//         const feature = new Feature(point);
//         feature.setStyle(
//           new Style({
//             image: new Icon({
//               src: busstopimage,
//               scale: 0.15,
//               anchor: [0.5, 1],
//             }),
//           })
//         );
//         vectorSource.current.addFeature(feature);

//         // Center map on the initial location
//         mapInstance.current.getView().animate({
//           center: coordinates,
//           zoom: 16,
//         });

//         // Find the bus stop to get its landmark
//         const busStop = busStops.find(bs => bs.location === initialLocation);
//         if (busStop?.landmark_id) {
//           const landmark = landmarks.find(l => l.id === busStop.landmark_id);
//           if (landmark?.boundary) {
//             const boundaryCoords = landmark.boundary
//               .split(",")
//               .map(coord => coord.trim().split(" ").map(Number))
//               .map(coord => fromLonLat(coord));
        
//             const polygon = new Polygon([boundaryCoords]);
//             const boundaryFeature = new Feature(polygon);
//             boundaryFeature.setStyle(
//               new Style({
//                 fill: new Fill({
//                   color: "rgba(221, 201, 75, 0.5)",
//                 }),
//                 stroke: new Stroke({
//                   color: "rgb(255, 149, 0)",
//                   width: 2,
//                 }),
//               })
//             );
//             vectorSource.current.addFeature(boundaryFeature);
//           }
//         }
//       }
//     }
//   }, [initialLocation, busStops, landmarks]);
//   console.log("Bus Stop Coordinates:>>>>>>>>", initialLocation);
//   console.log("Bus Stop Coordinates:>>>>>>>>", busStops);
//   console.log("landmark:>>>>>>>>", landmarks);
   
  

//   // Handle click events when in selection mode
//   useEffect(() => {
//     if (!mapInstance.current || !selectionMode) return;

//     const clickHandler = (event: any) => {
//       const coordinate = event.coordinate;
//       const lonLat = toLonLat(coordinate);
//       setSelectedPoint([lonLat[0], lonLat[1]]);

//       // Clear previous point and add new one
//       vectorSource.current.clear();

//       // Add the landmark boundary back
//       const busStop = busStops.find(bs => bs.location === initialLocation);
//       if (busStop?.landmark_id) {
//         const landmark = landmarks.find(l => l.id === busStop.landmark_id);
//         if (landmark?.boundary) {
//           const boundaryCoords = landmark.boundary
//             .split(",")
//             .map(coord => coord.trim().split(" ").map(Number))
//             .map(coord => fromLonLat(coord));

//           const polygon = new Polygon([boundaryCoords]);
//           const boundaryFeature = new Feature(polygon);
//           boundaryFeature.setStyle(
//             new Style({
//               fill: new Fill({
//                 color: "rgba(221, 201, 75, 0.5)",
//               }),
//               stroke: new Stroke({
//                 color: "rgb(255, 149, 0)",
//                 width: 2,
//               }),
//             })
//           );
//           vectorSource.current.addFeature(boundaryFeature);
//         }
//       }

//       // Add new point marker
//       const point = new Point(coordinate);
//       const pointFeature = new Feature(point);
//       pointFeature.setStyle(
//         new Style({
//           image: new Icon({
//             src: busstopimage,
//             scale: 0.15,
//             anchor: [0.5, 1],
//           }),
//         })
//       );
//       vectorSource.current.addFeature(pointFeature);

//       // Immediately update the location
//       onSave(`POINT(${lonLat[0].toFixed(7)} ${lonLat[1].toFixed(7)})`);
//     };

//     mapInstance.current.on('click', clickHandler);
//     return () => {
//       mapInstance.current?.un('click', clickHandler);
//     };
//   }, [selectionMode, initialLocation, busStops, landmarks, onSave]);



//   const changeMapType = (type: "osm" | "satellite" | "hybrid") => {
//     if (!mapInstance.current) return;

//     const baseLayer = mapInstance.current
//       .getLayers()
//       .getArray()
//       .find((layer) => layer instanceof TileLayer) as TileLayer;

//     if (baseLayer) {
//       switch (type) {
//         case "osm":
//           baseLayer.setSource(new OSM());
//           break;
//         case "satellite":
//           baseLayer.setSource(
//             new XYZ({
//               url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//             })
//           );
//           break;
//         case "hybrid":
//           baseLayer.setSource(
//             new XYZ({
//               url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//             })
//           );
//           const labelLayer = new TileLayer({
//             source: new XYZ({
//               url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
//             }),
//           });
//           mapInstance.current.addLayer(labelLayer);
//           break;
//       }
//       setMapType(type);
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchQuery || !mapInstance.current) return;

//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//           searchQuery
//         )}`
//       );
//       const data = await response.json();

//       if (data.length > 0) {
//         const { lat, lon } = data[0];
//         const coordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);

//         mapInstance.current.getView().animate({
//           center: coordinates,
//           zoom: 14,
//         });
//       } else {
//         showErrorToast("Location not found. Please try a different query.");
//       }
//     } catch (error) {
//       console.error("Geocoding error:", error);
//       showErrorToast("Error searching for location. Please try again.");
//     }
//   };

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
//       {/* Map Controls */}
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           p: 1,
//           backgroundColor: "#f5f5f5",
//           borderRadius: 1,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           <FormControl variant="outlined" size="small">
//             <InputLabel>Map Type</InputLabel>
//             <Select
//               value={mapType}
//               onChange={(e) =>
//                 changeMapType(e.target.value as "osm" | "satellite" | "hybrid")
//               }
//               label="Map Type"
//             >
//               <MenuItem value="osm">OSM</MenuItem>
//               <MenuItem value="satellite">Satellite</MenuItem>
//               <MenuItem value="hybrid">Hybrid</MenuItem>
//             </Select>
//           </FormControl>

//           <TextField
//             variant="outlined"
//             size="small"
//             placeholder="Search Location"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             sx={{ width: 200 }}
//           />
//           <Button
//             variant="contained"
//             size="small"
//             onClick={handleSearch}
//             sx={{ backgroundColor: "green" }}
//           >
//             Search
//           </Button>
//         </Box>

        
//       </Box>

//       {/* Map Container */}
//       <Box
//         ref={mapRef}
//         sx={{
//           flex: 1,
//           minHeight: "400px",
//           width: "100%",
//           borderRadius: 1,
//           overflow: "hidden",
//           mt: 1,
//         }}
//       />

//       {/* Coordinates and Actions */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mt: 2,
//           p: 1,
//           backgroundColor: "#f5f5f5",
//           borderRadius: 1,
//         }}
//       >
//         <Typography variant="body2">
//           {selectedPoint
//             ? `Selected: ${selectedPoint[0].toFixed(7)}, ${selectedPoint[1].toFixed(7)}`
//             : mousePosition
//             ? `Coordinates: ${mousePosition}`
//             : "Click on map to select location"}
//         </Typography>

//         <Box sx={{ display: "flex", gap: 1 }}>
//         <Button
//           variant="contained"
//           color={selectionMode ? "secondary" : "primary"}
//           onClick={() => setSelectionMode(!selectionMode)}
//           sx={{ ml: 1 }}
//         >
//           {selectionMode ? "Cancel Selection" : "Select Bus Stop"}
//         </Button>
//           <Button variant="outlined" color="error" onClick={onClose}>
//             Cancel
//           </Button>
          
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default BusStopUpdateMap;