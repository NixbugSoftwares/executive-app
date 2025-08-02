// import { useEffect, useState } from "react";
// import {} from "react";
// import { Dialog, DialogContent } from "@mui/material";
// import BusStopUpdateMap from "./BusStopUpdatemap";
// import { landmarkListApi } from "../../slices/appSlice";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "../../store/Store";
// interface BusStop {
//   id: number;
//   name: string;
//   location: string;
//   status?: string;
// }

// interface Landmark {
//   id: number;
//   landmarkName: string;
//   boundary: string;
//   importance: string;
//   status: string;
// }


// interface BusStopMapModalProps {
//   open: boolean;
//   onClose: () => void;
//   initialLocation?: string;
//   onSave: (coordinates: string) => void;
//   busStops?: BusStop[];
// }

// const BusStopMapModal: React.FC<BusStopMapModalProps> = ({
//   open,
//   onClose,
//   initialLocation,
//   onSave,
//   busStops = [],
// }) => {

//   const dispatch = useDispatch<AppDispatch>();
// const [landmark, setLandmark] = useState<Landmark[]>([]);
 
// const extractRawPoints = (polygonString: string): string => {
//   if (!polygonString) return "";
//   const matches = polygonString.match(/\(\((.*?)\)\)/);
//   return matches ? matches[1] : "";
// };

// const fetchLandmark = () => {
//     dispatch(landmarkListApi())
//       .unwrap()
//       .then((res: any[]) => {
//         const formattedLandmarks = res.map((landmark: any) => ({
//           id: landmark.id,
//           landmarkName: landmark.name,
//           boundary: extractRawPoints(landmark.boundary),
//           importance:
//             landmark.importance === 1
//               ? "Low"
//               : landmark.importance === 2
//               ? "Medium"
//               : "High",
//           status: landmark.status === 1 ? "Validating" : "Verified",
//         }));
//         setLandmark(formattedLandmarks);
//       })
//       .catch((err: any) => {
//         console.error("Error fetching landmarks", err);
//       });
//   };

//   useEffect(() => {
//     fetchLandmark();
//   }, []);


//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       sx={{
//         "& .MuiDialog-paper": {
//           height: "80vh",
//         },
//       }}
//     >
//       <DialogContent sx={{ height: "100%", p: 0 }}>
//         <BusStopUpdateMap
//           initialLocation={initialLocation}
//           onSave={onSave}
//           onClose={onClose}
//           busStops={busStops} 
//           landmarks={landmark} // Pass the fetched landmarks to the map component 
//         />
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default BusStopMapModal;