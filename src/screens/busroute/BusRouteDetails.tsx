import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  Stack,
  Paper,
} from "@mui/material";
import { busRouteLandmarkListApi, landmarkListApi, } from "../../slices/appSlice";
import { useAppDispatch } from "../../store/Hooks";
import { showErrorToast, showSuccessToast } from "../../common/toastMessageHelper";
import { Landmark } from "../../types/type";
interface RouteLandmark {
  id: string;
  landmark_id: string;
  name: string;
  sequence_id: number;
  arrival_time: string;
  departure_time: string;
}

interface BusRouteDetailsProps {
  routeId: number;
  routeName: string;
  onBack: () => void;
}

const BusRouteDetailsPage = ({ routeId, routeName, onBack }: BusRouteDetailsProps) => {
  const dispatch = useAppDispatch();
  const [routeLandmarks, setRouteLandmarks] = useState<RouteLandmark[]>([]);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  // const [routeLandmarkToDelete, setRouteLandmarkToDelete] = useState<RouteLandmark | null>(null);
  // const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  const fetchRouteLandmarks = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(
        busRouteLandmarkListApi(routeId)
      ).unwrap();
      setRouteLandmarks(response);
    } catch (error) {
      showErrorToast("Failed to fetch route landmarks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLandmark = () => {
      dispatch(landmarkListApi())
        .unwrap()
        .then((res: any[]) => {
          console.log("Company API Response:", res);
          setLandmarks(res);
        })
        .catch((err: any) => {
          console.error("Error fetching companies", err);
        });
    };

    
  useEffect(() => {
    fetchRouteLandmarks();
    fetchLandmark();
  }, [routeId]);

  // const handleRouteLandmarkDelete = async () => {
  //   try{
  //       const formdata = new FormData();
  //       formdata.append("id", routeLandmarkToDelete?.id.toString() || "");
  //       await dispatch(routeLandmarkDeleteApi(formdata)).unwrap();
  //       showSuccessToast("Route landmark deleted successfully");
  //       fetchRouteLandmarks();
  //   } catch (error) {
  //     showErrorToast("Failed to delete route landmark");
  //   } finally {
  //     setDeleteConfirmOpen(false);
  //     setRouteLandmarkToDelete(null);
  //   }
  // };

  const getLandmarkName = (landmarkId: string) => {
    const landmark = landmarks.find((l) => l.id === Number(landmarkId));
    return landmark ? landmark.name : "Unknown Landmark";
  };
  const formatTime = (datetime: string) => {
    if (!datetime) return "";
    if (datetime.includes("T")) {
      return datetime.split("T")[1].substring(0, 5);
    }
    return datetime;
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" gutterBottom>
            {routeName}
          </Typography>
          <Button variant="contained" onClick={onBack}>
            Back to Routes
          </Button>
        </Stack>
      </Paper>

      {isLoading ? (
        <Typography>Loading route details...</Typography>
      ) : routeLandmarks.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No landmarks found for this route.
        </Typography>
      ) : (
        <Paper elevation={3} sx={{ p: 3, flex: 1, overflow: "auto" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Route Landmarks
          </Typography>
          <List sx={{ width: "100%" }}>
            {routeLandmarks
              .sort((a, b) => a.sequence_id - b.sequence_id)
              .map((landmark, index) => (
                <Box key={landmark.id}>
                  <ListItem sx={{
                    display: "flex",
                    alignItems: "center",
                    py: 2,
                    backgroundColor: index % 2 === 0 ? "action.hover" : "background.paper",
                    borderRadius: 1,
                  }}>
                    <Chip 
                      label={landmark.sequence_id} 
                      color="primary"
                      sx={{ mr: 2, minWidth: 32 }}
                    />
                    <ListItemText
                      primary={getLandmarkName(landmark.landmark_id)}
                      secondary={`Arrival: ${formatTime(landmark.arrival_time)} | Departure: ${formatTime(landmark.departure_time)}`}
                    />
                  </ListItem>
                  {index < routeLandmarks.length - 1 && (
                    <Divider
                      component="li"
                      sx={{
                        borderLeftWidth: 2,
                        borderLeftStyle: "dashed",
                        borderColor: "divider",
                        height: 20,
                        ml: 3.5,
                        listStyle: "none",
                      }}
                    />
                  )}
                </Box>
              ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default BusRouteDetailsPage;