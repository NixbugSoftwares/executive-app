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
  routeLandmarkCreationApi
} from "../../slices/appSlice";
import { useAppDispatch } from "../../store/Hooks";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/toastMessageHelper";
import { Landmark, RouteLandmark, SelectedLandmark } from "../../types/type";


interface BusRouteDetailsProps {
  routeId: number;
  routeName: string;
  onBack: () => void;
  onLandmarksUpdate: (landmarks: any[]) => void;
}

const BusRouteDetailsPage = ({
  routeId,
  routeName,
  onBack,
  onLandmarksUpdate,
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
  const [isAddingNewLandmark, setIsAddingNewLandmark] = useState(false);
  const [newLandmarks, setNewLandmarks] = useState<SelectedLandmark[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<SelectedLandmark | null>(null);

  
  const fetchRouteLandmarks = async () => {
  setIsLoading(true);
  try {
    const response = await dispatch(
      busRouteLandmarkListApi(routeId)
    ).unwrap();

    const processedLandmarks = processLandmarks(response);
    const sortedLandmarks = processedLandmarks.sort(
      (a, b) => (a.distance_from_start || 0) - (b.distance_from_start || 0)
    ); // Sort by distance
    setRouteLandmarks(sortedLandmarks);
    updateParentMapLandmarks(sortedLandmarks);
  } catch (error) {
    showErrorToast("Failed to fetch route landmarks");
  } finally {
    setIsLoading(false);
  }
};

  const updateParentMapLandmarks = (landmarks: RouteLandmark[]) => {
    const mapLandmarks = landmarks.map(lm => ({
      id: lm.landmark_id,
      name: lm.name,
      sequenceId: lm.sequence_id || 0,
      arrivalTime: lm.arrival_time,
      departureTime: lm.departure_time,
      distance_from_start: lm.distance_from_start || 0
    }));
    
    onLandmarksUpdate(mapLandmarks);
  };
  
 
  
  const handleAddNewLandmark = (landmark: SelectedLandmark) => {
    setNewLandmarks([...newLandmarks, landmark]);
  };
  
  const handleSaveNewLandmarks = async () => {
    try {
      const creationPromises = newLandmarks.map(async (landmark) => {
        const formData = new FormData();
        formData.append("route_id", routeId.toString());
        formData.append("landmark_id", landmark.id.toString());
        formData.append("arrival_time", landmark.arrivalTime);
        formData.append("departure_time", landmark.departureTime);
        formData.append("distance_from_start", landmark.distance_from_start.toString());
        
        await dispatch(routeLandmarkCreationApi(formData)).unwrap();
      });
  
      await Promise.all(creationPromises);
      showSuccessToast("New landmarks added successfully");
      fetchRouteLandmarks();
      setNewLandmarks([]);
      setIsAddingNewLandmark(false);
    } catch (error) {
      showErrorToast("Failed to add new landmarks");
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
    return landmarks
      .sort((a, b) => (a.sequence_id || 0) - (b.sequence_id || 0))
      .map((landmark, index) => ({
        ...landmark,
        sequence_id: index + 1,
      }));
  };

  useEffect(() => {
    fetchRouteLandmarks();
    fetchLandmark();
  }, [routeId]);

  useEffect(() => {
    return () => {
      onLandmarksUpdate([]);
    };
  }, []);
  const getLandmarkName = (landmarkId: string) => {
    const landmark = landmarks.find((l) => l.id === Number(landmarkId));
    return landmark ? landmark.name : "Unknown Landmark";
  };

  const formatTime = (datetime: string) => {
    if (!datetime) return "Not set";
    return datetime.split("T")[1]?.substring(0, 5) || datetime;
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
    const formatForInput = (timeString: string) => {
      if (!timeString) return "";
      if (timeString.includes("T")) {
        return timeString.slice(0, 16);
      }
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
      formData.append("id", editingLandmark.id.toString());
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
    } catch (error) {
      showErrorToast("Failed to update landmark");
    }
  };

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={onBack}>
          Back to Routes
        </Button>
        <Button
          variant={editMode ? "outlined" : "contained"}
          onClick={handleEditRoute}
        >
          {editMode ? "Cancel Edit" : "Edit Route"}
        </Button>
      </Stack>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
          {editMode && (
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
        >
          {isAddingNewLandmark ? "Cancel Add Landmark" : "Add Landmark"}
        </Button>
        {isAddingNewLandmark && (
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveNewLandmarks}
            disabled={newLandmarks.length === 0}
          >
            Save New Landmarks
          </Button>
        )}
      </Stack>
    )}
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
                    <>
                      <IconButton
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleLandmarkEditClick(landmark)}
                      >
                        <Edit sx={{ fontSize: 20 }} />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(landmark)}
                      >
                        <Delete sx={{ fontSize: 20 }} />
                      </IconButton>
                    </>
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
            {newLandmarks.map((landmark, index) => (
        <Box key={`new-${landmark.id}-${index}`}>
          <ListItem sx={{ backgroundColor: '#e3f2fd' }}>
            <Chip label={routeLandmarks.length + index + 1} color="primary" />
            <ListItemText
              primary={landmark.name}
              secondary={
                <>
                  <span>Arrival: {landmark.arrivalTime}</span>
                  <span style={{ margin: "0 8px" }}>|</span>
                  <span>Departure: {landmark.departureTime}</span>
                  <span style={{ margin: "0 8px" }}>|</span>
                  <span>Distance: {landmark.distance_from_start}m</span>
                </>
              }
            />
            <IconButton
              color="error"
              onClick={() => setNewLandmarks(newLandmarks.filter((_, i) => i !== index))}
            >
              <Delete />
            </IconButton>
          </ListItem>
          <Divider component="li" sx={{ borderLeftWidth: 2, borderLeftStyle: "dashed" }} />
        </Box>
      ))}
          </List>
        </Paper>
      )}

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Landmark Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove "{getLandmarkName(routeLandmarkToDelete?.landmark_id || "")}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleRouteLandmarkDelete} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

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
                disabled={editingLandmark.sequence_id === 1}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingLandmark(null)}>Cancel</Button>
          <Button
            onClick={() => editingLandmark && handleLandmarkUpdate({
              arrival_time: editingLandmark.arrival_time,
              departure_time: editingLandmark.departure_time,
              distance_from_start: editingLandmark.distance_from_start,
            })}
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {selectedLandmark && (
  <Dialog open={!!selectedLandmark} onClose={() => setSelectedLandmark(null)}>
    <DialogTitle>Add Landmark Details</DialogTitle>
    <DialogContent>
      <TextField
        label="Arrival Time"
        type="datetime-local"
        fullWidth
        margin="normal"
        value={selectedLandmark.arrivalTime}
        onChange={(e) => setSelectedLandmark({
          ...selectedLandmark,
          arrivalTime: e.target.value
        })}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Departure Time"
        type="datetime-local"
        fullWidth
        margin="normal"
        value={selectedLandmark.departureTime}
        onChange={(e) => setSelectedLandmark({
          ...selectedLandmark,
          departureTime: e.target.value
        })}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Distance from Start (m)"
        type="number"
        fullWidth
        margin="normal"
        value={selectedLandmark.distance_from_start}
        onChange={(e) => setSelectedLandmark({
          ...selectedLandmark,
          distance_from_start: Number(e.target.value)
        })}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setSelectedLandmark(null)}>Cancel</Button>
      <Button onClick={() => {
        handleAddNewLandmark(selectedLandmark);
        setSelectedLandmark(null);
      }} color="primary">
        Add
      </Button>
    </DialogActions>
  </Dialog>
)}


    </Box>
  );
};

export default BusRouteDetailsPage;