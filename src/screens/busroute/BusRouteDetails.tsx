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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import {
  busRouteLandmarkListApi,
  landmarkListApi,
  routeLandmarkDeleteApi,
  routeLandmarkUpdationApi,
  routeUpdationApi,
} from "../../slices/appSlice";
import { useAppDispatch } from "../../store/Hooks";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/toastMessageHelper";
import { Landmark } from "../../types/type";

interface RouteLandmark {
  id: string;
  landmark_id: string;
  name: string;
  arrival_time: string;
  departure_time: string;
  distance_from_start?: number;
  sequence_id?: number;
}

interface BusRouteDetailsProps {
  routeId: number;
  routeName: string;
  onBack: () => void;
}

const BusRouteDetailsPage = ({
  routeId,
  routeName,
  onBack,
}: BusRouteDetailsProps) => {
  const dispatch = useAppDispatch();
  const [routeLandmarks, setRouteLandmarks] = useState<RouteLandmark[]>([]);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeLandmarkToDelete, setRouteLandmarkToDelete] =
    useState<RouteLandmark | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingLandmark, setEditingLandmark] = useState<RouteLandmark | null>(
    null
  );
  const [updatedRouteName, setUpdatedRouteName] = useState(routeName);

  const fetchRouteLandmarks = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(
        busRouteLandmarkListApi(routeId)
      ).unwrap();

      const processedLandmarks = processLandmarks(response);
      setRouteLandmarks(processedLandmarks);
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
        setLandmarks(res);
      })
      .catch((err: any) => {
        console.error("Error fetching landmarks", err);
      });
  };

  const processLandmarks = (landmarks: RouteLandmark[]): RouteLandmark[] => {
    if (landmarks.every((l) => l.distance_from_start !== undefined)) {
      return [...landmarks]
        .sort(
          (a, b) => (a.distance_from_start || 0) - (b.distance_from_start || 0)
        )
        .map((landmark, index) => ({
          ...landmark,
          sequence_id: index + 1,
        }));
    }
    return landmarks.map((landmark, index) => ({
      ...landmark,
      sequence_id: index + 1,
    }));
  };

  useEffect(() => {
    fetchRouteLandmarks();
    fetchLandmark();
  }, [routeId]);

  const getLandmarkName = (landmarkId: string) => {
    const landmark = landmarks.find((l) => l.id === Number(landmarkId));
    return landmark ? landmark.name : "Unknown Landmark";
  };

  const formatTime = (datetime: string) => {
    if (!datetime) return "Not set";
    if (datetime.includes("T")) {
      return datetime.split("T")[1].substring(0, 5);
    }
    return datetime;
  };

  const handleDeleteClick = (landmark: RouteLandmark) => {
    setRouteLandmarkToDelete(landmark);
    setDeleteConfirmOpen(true);
  };

  const handleRouteLandmarkDelete = async () => {
    if (!routeLandmarkToDelete) return;

    try {
      const formData = new FormData();
      formData.append("id", routeLandmarkToDelete.id.toString());
      await dispatch(routeLandmarkDeleteApi(formData)).unwrap();
      showSuccessToast("Landmark removed from route successfully");
      fetchRouteLandmarks();
    } catch (error) {
      showErrorToast("Failed to remove landmark from route");
    } finally {
      setDeleteConfirmOpen(false);
      setRouteLandmarkToDelete(null);
    }
  };

  const handleEditRoute = () => {
    setEditMode(!editMode);
    if (editMode) {
      setUpdatedRouteName(routeName);
    }
  };

  const handleRouteNameUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("id", routeId.toString());
      formData.append("name", updatedRouteName);

      await dispatch(routeUpdationApi({ routeId, formData })).unwrap();
      showSuccessToast("Route name updated successfully");
      setEditMode(false);
      onBack();
    } catch (error) {
      showErrorToast("Failed to update route name");
    }
  };
  const handleLandmarkEditClick = (landmark: RouteLandmark) => {
    // Format the times for datetime-local input
    const formatForInput = (timeString: string) => {
      if (!timeString) return "";
      if (timeString.includes("T")) {
        return timeString.slice(0, 16); // Truncate to YYYY-MM-DDTHH:MM
      }
      // If time is in HH:MM format, convert to full datetime string
      const date = new Date();
      const [hours, minutes] = timeString.split(":");
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toISOString().slice(0, 16);
    };

    setEditingLandmark({
      ...landmark,
      arrival_time: formatForInput(landmark.arrival_time),
      departure_time: formatForInput(landmark.departure_time),
    });
  };

  const handleLandmarkUpdate = async (updatedData: {
    arrival_time: string;
    departure_time: string;
    distance_from_start?: number;
  }) => {
    if (!editingLandmark) return;

    try {
      const formData = new FormData();
      formData.append("id", editingLandmark.id);
      formData.append("arrival_time", updatedData.arrival_time);
      formData.append("departure_time", updatedData.departure_time);
      if (updatedData.distance_from_start !== undefined) {
        formData.append(
          "distance_from_start",
          updatedData.distance_from_start.toString()
        );
      }

      await dispatch(
        routeLandmarkUpdationApi({
          routeLandmarkId: Number(editingLandmark.id),
          formData,
        })
      ).unwrap();
      showSuccessToast("Landmark updated successfully");
      fetchRouteLandmarks();
      setEditingLandmark(null);
      onBack();
    } catch (error) {
      showErrorToast("Failed to update landmark");
    }
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
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onBack}>
          Back to Routes
        </Button>
      </Stack>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {editMode ? (
            <Stack direction="row" alignItems="center" spacing={2}>
              <TextField
                value={updatedRouteName}
                onChange={(e) => setUpdatedRouteName(e.target.value)}
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleRouteNameUpdate}
              >
                Save
              </Button>
            </Stack>
          ) : (
            <Typography variant="h5" gutterBottom>
              {routeName}
            </Typography>
          )}
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
            {routeLandmarks.map((landmark, index) => (
              <Box key={landmark.id}>
                <ListItem
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    py: 2,
                    backgroundColor:
                      index % 2 === 0 ? "action.hover" : "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Chip
                    label={index + 1}
                    color="primary"
                    sx={{ mr: 2, minWidth: 32 }}
                  />
                  <ListItemText
                    primary={getLandmarkName(landmark.landmark_id)}
                    secondary={
                      <>
                        <span>
                          Arrival: {formatTime(landmark.arrival_time)}
                        </span>
                        <span style={{ margin: "0 8px" }}>|</span>
                        <span>
                          Departure: {formatTime(landmark.departure_time)}
                        </span>
                        {landmark.distance_from_start !== undefined && (
                          <>
                            <span style={{ margin: "0 8px" }}>|</span>
                            <span>
                              Distance: {landmark.distance_from_start} m
                            </span>
                          </>
                        )}
                      </>
                    }
                  />
                  {editMode && (
                    <IconButton
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleLandmarkEditClick(landmark)}
                    >
                      <Edit sx={{ fontSize: 20 }} />
                    </IconButton>
                  )}
                  {editMode && (
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteClick(landmark)}
                      sx={{ ml: "auto" }}
                    >
                      <Delete sx={{ fontSize: 20 }} />
                    </IconButton>
                  )}
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
            <Button
              variant={editMode ? "outlined" : "contained"}
              onClick={handleEditRoute}
            >
              {editMode ? "Cancel Edit" : "Edit Route"}
            </Button>
          </List>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Landmark Removal
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove the landmark "
            {routeLandmarkToDelete
              ? getLandmarkName(routeLandmarkToDelete.landmark_id)
              : ""}
            " from this route? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleRouteLandmarkDelete} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Landmark Edit Dialog */}
      <Dialog
        open={!!editingLandmark}
        onClose={() => setEditingLandmark(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Landmark Details</DialogTitle>
        <DialogContent>
          {editingLandmark && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {getLandmarkName(editingLandmark.landmark_id)}
              </Typography>
              <TextField
                label="Departure Time"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={editingLandmark.departure_time || ""}
                onChange={(e) =>
                  setEditingLandmark({
                    ...editingLandmark,
                    departure_time: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Arrival Time"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={editingLandmark.arrival_time || ""}
                onChange={(e) =>
                  setEditingLandmark({
                    ...editingLandmark,
                    arrival_time: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Distance from Start (m)"
                type="number"
                fullWidth
                margin="normal"
                value={editingLandmark.distance_from_start || 0}
                onChange={(e) =>
                  setEditingLandmark({
                    ...editingLandmark,
                    distance_from_start: parseFloat(e.target.value) || 0,
                  })
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: 0,
                  step: 0.1,
                }}
                disabled={editingLandmark.sequence_id === 1}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingLandmark(null)}>Cancel</Button>
          <Button
            onClick={() => {
              if (editingLandmark) {
                handleLandmarkUpdate({
                  arrival_time: editingLandmark.arrival_time,
                  departure_time: editingLandmark.departure_time,
                  distance_from_start: editingLandmark.distance_from_start,
                });
              }
            }}
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusRouteDetailsPage;
