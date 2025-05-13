import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
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
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import {
  Delete,
  Edit,
  Directions,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import {
  busRouteLandmarkListApi,
  landmarkListApi,
  routeLandmarkDeleteApi,
  routeLandmarkUpdationApi,
  routeUpdationApi,
  routeLandmarkCreationApi,
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
  routeStartingTime: string;
  onBack: () => void;
  onLandmarksUpdate: (landmarks: any[]) => void;
  onEnableAddLandmark: () => void;
  onNewLandmarkAdded: (landmark: SelectedLandmark) => void;
  isEditing?: boolean;
  onCancelEdit: () => void;
  newLandmarks: SelectedLandmark[];
  setNewLandmarks: React.Dispatch<React.SetStateAction<SelectedLandmark[]>>;
  refreshList: (value: any) => void;
}

const BusRouteDetailsPage = ({
  routeId,
  routeName,
  routeStartingTime,
  onBack,
  onLandmarksUpdate,
  onEnableAddLandmark,
  onNewLandmarkAdded,
  onCancelEdit,
  newLandmarks,
  setNewLandmarks,
  refreshList,
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
  const [hour, setHour] = useState<number>(8); // Default to 8 AM
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [editStartingTime, setEditStartingTime] = useState(false);
  const [updatedRouteName, setUpdatedRouteName] = useState(routeName);
  const [selectedLandmark, setSelectedLandmark] =
    useState<SelectedLandmark | null>(null);

  const fetchRouteLandmarks = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(
        busRouteLandmarkListApi(routeId)
      ).unwrap();

      const processedLandmarks = processLandmarks(response);
      const sortedLandmarks = processedLandmarks.sort(
        (a, b) => (a.distance_from_start || 0) - (b.distance_from_start || 0)
      );
      setRouteLandmarks(sortedLandmarks);
      updateParentMapLandmarks(sortedLandmarks);
    } catch (error) {
      showErrorToast("Failed to fetch route landmarks");
    } finally {
      setIsLoading(false);
    }
  };


useEffect(() => {
  if (routeStartingTime) {
    try {
      const date = new Date(routeStartingTime);
      let hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      
      // Convert to 12-hour format
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
      
      setHour(hours);
      setMinute(minutes);
      setPeriod(period);
    } catch (e) {
      console.error("Error parsing starting time:", e);
    }
  }
}, [routeStartingTime]);
const formatTimeForDisplay = (timeString: string) => {
  if (!timeString) return "Not set";
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return timeString;
  }
};


  const updateParentMapLandmarks = (landmarks: RouteLandmark[]) => {
    const mapLandmarks = landmarks.map((lm) => ({
      id: lm.landmark_id,
      name: lm.name,
      sequenceId: lm.sequence_id || 0,
      arrivalTime: lm.arrival_delta,
      departureTime: lm.departure_delta,
      distance_from_start: lm.distance_from_start || 0,
    }));

    onLandmarksUpdate(mapLandmarks);
  };

  const handleAddNewLandmark = (landmark: SelectedLandmark) => {
    setNewLandmarks([...newLandmarks, landmark]);
    onNewLandmarkAdded(landmark); // Send new landmark to the map
  };

  const handleSaveNewLandmarks = async () => {
    try {
      const creationPromises = newLandmarks.map(async (landmark) => {
        const formData = new FormData();
        formData.append("route_id", routeId.toString());
        formData.append("landmark_id", landmark.id.toString());
        formData.append("sequence_id", (landmark.sequenceId ?? 0).toString());
        formData.append("arrival_delta", landmark.arrivalDelta);
        formData.append("departure_delta", landmark.departureDelta);
        formData.append(
          "distance_from_start",
          landmark.distance_from_start.toString()
        );

        await dispatch(routeLandmarkCreationApi(formData)).unwrap();
      });

      await Promise.all(creationPromises);
      showSuccessToast("New landmarks added successfully");
      setNewLandmarks([]);
      fetchRouteLandmarks();
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
    if (editMode) {
      setEditMode(false);
      onCancelEdit();
    } else {
      setEditMode(true);
      onEnableAddLandmark();
    }
  };

  const handleRouteNameUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("id", routeId.toString());
      formData.append("name", updatedRouteName);

      await dispatch(routeUpdationApi({ routeId, formData })).unwrap();
      refreshList("refresh");
      showSuccessToast("Route  updated successfully");
      setEditMode(false);
      onBack();
    } catch (error) {
      showErrorToast("Failed to update route name");
    }
  };

  const handleStartingTimeUpdate = async () => {
  try {
    // Convert 12-hour time to 24-hour UTC format
    let hour24 = period === 'PM' 
      ? (hour === 12 ? 12 : hour + 12)
      : (hour === 12 ? 0 : hour);
    
    // Create a date object with current date and the selected time
    const now = new Date();
    const dateWithTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour24,
      minute
    );
    
    // Format as ISO string (UTC)
    const isoTimeString = dateWithTime.toISOString();

    const formData = new FormData();
    formData.append("id", routeId.toString());
    formData.append("starting_time", isoTimeString);

    await dispatch(routeUpdationApi({ routeId, formData })).unwrap();
    showSuccessToast("Starting time updated successfully");
    setEditStartingTime(false);
    refreshList("refresh");
  } catch (error) {
    showErrorToast("Failed to update starting time");
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
      arrival_delta: formatForInput(landmark.arrival_delta),
      departure_delta: formatForInput(landmark.departure_delta),
    });
  };

  const handleLandmarkUpdate = async (updatedData: {
    arrival_delta: string;
    departure_delta: string;
    distance_from_start?: number;
  }) => {
    if (!editingLandmark) return;

    try {
      const formData = new FormData();
      formData.append("id", editingLandmark.id.toString());
      formData.append("arrival_delta", updatedData.arrival_delta);
      formData.append("departure_delta", updatedData.departure_delta);
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
    <Box
      sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}
    >
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
        {editMode && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveNewLandmarks}
            disabled={newLandmarks.length === 0}
          >
            Save New Landmarks
          </Button>
        )}
      </Stack>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
  <Stack direction="column" alignItems="center">
    {editMode ? (
      <>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
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
            Save Name
          </Button>
        </Stack>
        
        {editStartingTime ? (
          <Stack direction="row" alignItems="center" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Hour</InputLabel>
              <Select
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                label="Hour"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <MenuItem key={h} value={h}>
                    {h}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>Minute</InputLabel>
              <Select
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                label="Minute"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <MenuItem key={m} value={m}>
                    {String(m).padStart(2, '0')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>AM/PM</InputLabel>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'AM' | 'PM')}
                label="AM/PM"
              >
                <MenuItem value="AM">AM</MenuItem>
                <MenuItem value="PM">PM</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartingTimeUpdate}
            >
              Save Time
            </Button>
            <Button
              variant="outlined"
              onClick={() => setEditStartingTime(false)}
            >
              Cancel
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography>
              Starting Time: {formatTimeForDisplay(routeStartingTime)}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setEditStartingTime(true)}
            >
              Edit Time
            </Button>
          </Stack>
        )}
      </>
    ) : (
      <>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, textAlign: "center" }}
        >
          {routeName}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Starting Time: {formatTimeForDisplay(routeStartingTime)}
        </Typography>
      </>
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
                    alignItems: "flex-start",
                    py: 2,
                    px: 2,
                    backgroundColor:
                      index % 2 === 0 ? "action.hover" : "background.paper",
                    borderRadius: 1,
                    gap: 2,
                  }}
                >
                  <Chip
                    label={index + 1}
                    color="primary"
                    sx={{
                      mr: 1,
                      minWidth: 32,
                      height: 32,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {getLandmarkName(landmark.landmark_id)}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mt: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      {landmark.distance_from_start !== undefined && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                          }}
                        >
                          <Directions sx={{ fontSize: "1rem", mr: 0.5 }} />
                          {landmark.distance_from_start}m
                        </Box>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          fontSize: "0.8rem",
                          color: "text.secondary",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ArrowDownward
                            sx={{
                              fontSize: "1rem",
                              mr: 0.5,
                              color: "error.main",
                            }}
                          />
                          <span>Arrive: {landmark.arrival_delta}</span>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ArrowUpward
                            sx={{
                              fontSize: "1rem",
                              mr: 0.5,
                              color: "success.main",
                            }}
                          />
                          <span>Depart: {landmark.departure_delta}</span>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {editMode && (
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={() => handleLandmarkEditClick(landmark)}
                        aria-label="edit"
                        color="primary"
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(landmark)}
                        aria-label="delete"
                        color="error"
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
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
                      ml: 4.5,
                      listStyle: "none",
                    }}
                  />
                )}
              </Box>
            ))}

            {/* New Landmarks Section */}
            {newLandmarks.map((landmark, index) => (
              <Box key={`new-${landmark.id}-${index}`}>
                <ListItem
                  sx={{
                    backgroundColor: "#e3f2fd",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    py: 2,
                    px: 2,
                    gap: 2,
                  }}
                >
                  <Chip
                    label={routeLandmarks.length + index + 1}
                    color="primary"
                    sx={{
                      mr: 1,
                      minWidth: 32,
                      height: 32,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {landmark.name}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mt: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "primary.light",
                          color: "primary.contrastText",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        <Directions sx={{ fontSize: "1rem", mr: 0.5 }} />
                        {landmark.distance_from_start}m
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          fontSize: "0.8rem",
                          color: "text.secondary",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ArrowUpward
                            sx={{
                              fontSize: "1rem",
                              mr: 0.5,
                              color: "success.main",
                            }}
                          />
                          <span>Arrive: {landmark.arrivalDelta}</span>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ArrowDownward
                            sx={{
                              fontSize: "1rem",
                              mr: 0.5,
                              color: "error.main",
                            }}
                          />
                          <span>Depart: {landmark.departureDelta}</span>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  <IconButton
                    color="error"
                    size="small"
                    onClick={() =>
                      setNewLandmarks(
                        newLandmarks.filter((_, i) => i !== index)
                      )
                    }
                    sx={{
                      backgroundColor: "error.light",
                      "&:hover": {
                        backgroundColor: "error.main",
                        color: "error.contrastText",
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </ListItem>

                <Divider
                  component="li"
                  sx={{
                    borderLeftWidth: 2,
                    borderLeftStyle: "dashed",
                    borderColor: "divider",
                    height: 20,
                    ml: 4.5,
                    listStyle: "none",
                  }}
                />
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
            Remove "{getLandmarkName(routeLandmarkToDelete?.landmark_id || "")}
            "?
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
                value={editingLandmark.departure_delta || ""}
                onChange={(e) =>
                  setEditingLandmark({
                    ...editingLandmark,
                    departure_delta: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Arrival Time"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={editingLandmark.arrival_delta || ""}
                onChange={(e) =>
                  setEditingLandmark({
                    ...editingLandmark,
                    arrival_delta: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
              <Tooltip
                title={
                  editingLandmark.distance_from_start === 0
                    ? "You can't edit the starting landmark distance"
                    : ""
                }
              >
                <span>
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
                    disabled={editingLandmark.distance_from_start === 0}
                    InputProps={{
                      readOnly: editingLandmark.distance_from_start === 0,
                    }}
                  />
                </span>
              </Tooltip>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingLandmark(null)}>Cancel</Button>
          <Button
            onClick={() =>
              editingLandmark &&
              handleLandmarkUpdate({
                arrival_delta: editingLandmark.arrival_delta,
                departure_delta: editingLandmark.departure_delta,
                distance_from_start: editingLandmark.distance_from_start,
              })
            }
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {selectedLandmark && (
        <>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveNewLandmarks}
              disabled={newLandmarks.length === 0}
            >
              Save New Landmarks
            </Button>
          </Stack>
          <Dialog
            open={!!selectedLandmark}
            onClose={() => setSelectedLandmark(null)}
          >
            <DialogTitle>Add Landmark Details</DialogTitle>
            <DialogContent>
              <TextField
                label="Arrival Time"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={selectedLandmark.arrivalDelta}
                onChange={(e) =>
                  setSelectedLandmark({
                    ...selectedLandmark,
                    arrivalDelta: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Departure Time"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={selectedLandmark.departureDelta}
                onChange={(e) =>
                  setSelectedLandmark({
                    ...selectedLandmark,
                    departureDelta: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Distance from Start (m)"
                type="number"
                fullWidth
                margin="normal"
                value={selectedLandmark.distance_from_start}
                onChange={(e) =>
                  setSelectedLandmark({
                    ...selectedLandmark,
                    distance_from_start: Number(e.target.value),
                  })
                }
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedLandmark(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  handleAddNewLandmark(selectedLandmark);
                  setSelectedLandmark(null);
                }}
                color="primary"
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default BusRouteDetailsPage;
