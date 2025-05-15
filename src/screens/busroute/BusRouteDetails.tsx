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
  const [hour, setHour] = useState<number>(8);
  const [minute, setMinute] = useState<number>(0);
  const [updatedRouteName, setUpdatedRouteName] = useState(routeName);
  const [selectedLandmark, setSelectedLandmark] =
    useState<SelectedLandmark | null>(null);

  // Helper function to calculate actual time from starting time and delta seconds
  const calculateActualTime = (startingTime: string, deltaSeconds: string) => {
    if (!startingTime || !deltaSeconds) return "N/A";

    try {
      // Parse starting time as UTC
      let timeString = startingTime;
      if (!timeString.includes("T")) {
        timeString = `1970-01-01T${timeString}`;
      }

      const startDate = new Date(timeString);
      const delta = parseInt(deltaSeconds, 10); // Delta is already in seconds

      // Add delta seconds to starting time
      const resultDate = new Date(startDate.getTime() + delta * 1000);

      // Format as HH:MM AM/PM in UTC
      return resultDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC", // Add this to keep it in UTC
      });
    } catch (e) {
      console.error("Error calculating actual time:", e);
      return "N/A";
    }
  };

  // Helper function to format delta seconds into human-readable format
  const formatDeltaTime = (deltaSeconds: string) => {
    if (!deltaSeconds) return "N/A";

    const seconds = parseInt(deltaSeconds, 10);
    if (isNaN(seconds)) return "N/A";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours === 0) result += `${minutes}m`;

    return result.trim();
  };

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
        // Parse the time string as UTC
        const [hours, minutes] = routeStartingTime.split(":").map(Number);

        if (!isNaN(hours) && !isNaN(minutes)) {
          console.log("Parsed Hours:", hours, "Parsed Minutes:", minutes);

          // Set the parsed values in the state
          setHour(hours);
          setMinute(minutes);
        } else {
          throw new Error("Invalid time format");
        }
      } catch (e) {
        console.error("Error parsing starting time:", e);
        setHour(8); // Default to 8 on error
        setMinute(0); // Default to 0 on error
      }
    }
  }, [routeStartingTime]);

  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return "Not set";

    try {
      // Check if the time string already includes 'T' (ISO format)
      let fullDateTimeString = timeString;
      if (!timeString.includes("T")) {
        fullDateTimeString = `1970-01-01T${timeString}`;
      }

      // Parse as UTC
      const date = new Date(fullDateTimeString);

      // Format as local time with AM/PM
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC", // Add this to keep it in UTC
      });
    } catch (e) {
      console.error("Error formatting time:", e);
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
  if (!routeStartingTime) {
    showErrorToast("Route starting time is missing");
    return;
  }

  const newLandmark = {
    ...landmark,
    distance_from_start: landmark.distance_from_start || 0,
    sequenceId: routeLandmarks.length + newLandmarks.length + 1,
  };

  console.log("Adding New Landmark:", newLandmark);

  setNewLandmarks([...newLandmarks, newLandmark]);
  onNewLandmarkAdded(newLandmark);
};

const handleSaveNewLandmarks = async () => {
  try {
    console.log("Saving landmarks with data:", newLandmarks);

    const creationPromises = newLandmarks.map(async (landmark, index) => {
      if (!routeStartingTime) {
        throw new Error("Route starting time is missing");
      }

      const [startHour, startMinute] = routeStartingTime.split(":").map(Number);
      const startingTimeInSeconds = startHour * 3600 + startMinute * 60;

      const [arrivalHour, arrivalMinute] = (landmark.arrivalTime || "00:00")
        .split(":")
        .map(Number);
      const arrivalTimeInSeconds = arrivalHour * 3600 + arrivalMinute * 60;

      const [departureHour, departureMinute] = (landmark.departureTime || "00:00")
        .split(":")
        .map(Number);
      const departureTimeInSeconds = departureHour * 3600 + departureMinute * 60;

      const arrivalDelta = arrivalTimeInSeconds - startingTimeInSeconds;
      const departureDelta = departureTimeInSeconds - startingTimeInSeconds;

      if (arrivalDelta < 0 || departureDelta < 0) {
        throw new Error(
          `Invalid times for landmark at position ${index + 1}: Arrival or departure time cannot be before the starting time`
        );
      }

      const formData = new FormData();
      formData.append("route_id", routeId.toString());
      formData.append("landmark_id", landmark.id.toString());
      formData.append(
        "sequence_id",
        (routeLandmarks.length + index + 1).toString()
      );
      formData.append("arrival_delta", arrivalDelta.toString());
      formData.append("departure_delta", departureDelta.toString());
      formData.append(
        "distance_from_start",
        (landmark.distance_from_start || 0).toString()
      );

      console.log("Submitting Landmark:", {
        route_id: routeId,
        landmark_id: landmark.id,
        sequence_id: routeLandmarks.length + index + 1,
        arrival_delta: arrivalDelta,
        departure_delta: departureDelta,
        distance_from_start: landmark.distance_from_start,
      });

      return await dispatch(routeLandmarkCreationApi(formData)).unwrap();
    });

    await Promise.all(creationPromises);
    showSuccessToast("New landmarks added successfully");
    setNewLandmarks([]);
    fetchRouteLandmarks();
  } catch (error) {
    console.error("Error adding landmarks:", error);
    showErrorToast(
      error instanceof Error ? error.message : "Failed to add new landmarks"
    );
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

  const handleRouteDetailsUpdate = async () => {
    try {
      // Create a time string in HH:MM:SS format directly
      const timeString = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}:00`;
      console.log("Time String:", timeString);

      const formData = new FormData();
      formData.append("id", routeId.toString());
      formData.append("name", updatedRouteName);
      formData.append("starting_time", timeString);

      await dispatch(routeUpdationApi({ routeId, formData })).unwrap();
      refreshList("refresh");
      showSuccessToast("Route details updated successfully");
      setEditMode(false);
      onBack();
    } catch (error) {
      showErrorToast("Failed to update route details");
    }
  };

  const handleHourChange = (e: { target: { value: any } }) => {
    const value = Number(e.target.value);
    if (value >= 0 && value <= 23) {
      setHour(value);
    }
  };

  const handleMinuteChange = (e: { target: { value: any } }) => {
    const value = Number(e.target.value);
    if (value >= 0 && value <= 59) {
      setMinute(value);
    }
  };

  const handleLandmarkEditClick = (landmark: RouteLandmark) => {
    setEditingLandmark({
      ...landmark,
      arrival_delta: landmark.arrival_delta
        ? parseInt(landmark.arrival_delta, 10).toString()
        : "",
      departure_delta: landmark.departure_delta
        ? parseInt(landmark.departure_delta, 10).toString()
        : "",
    });
  };

  const handleLandmarkUpdate = async () => {
    if (!editingLandmark) return;

    try {
      const formData = new FormData();
      formData.append("id", editingLandmark.id.toString());
      formData.append(
        "arrival_delta",
        Math.round(Number(editingLandmark.arrival_delta)).toString()
      );
      formData.append(
        "departure_delta",
        Math.round(Number(editingLandmark.departure_delta)).toString()
      );

      if (editingLandmark.distance_from_start !== undefined) {
        formData.append(
          "distance_from_start",
          editingLandmark.distance_from_start.toString()
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
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <TextField
                  value={updatedRouteName}
                  onChange={(e) => setUpdatedRouteName(e.target.value)}
                  variant="outlined"
                  size="small"
                  label="Route Name"
                />
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>Hour</InputLabel>
                  <Select value={hour} onChange={handleHourChange} label="Hour">
                    {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                      <MenuItem key={h} value={h}>
                        {String(h).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>Minute</InputLabel>
                  <Select
                    value={minute}
                    onChange={handleMinuteChange}
                    label="Minute"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <MenuItem key={m} value={m}>
                        {String(m).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRouteDetailsUpdate}
                >
                  Save
                </Button>
                <Button variant="outlined" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </Stack>
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
            {routeLandmarks.map((landmark, index) => {
              const isFirstLandmark = index === 0;
              const arrivalTime = isFirstLandmark
                ? formatTimeForDisplay(routeStartingTime)
                : calculateActualTime(
                    routeStartingTime,
                    landmark.arrival_delta
                  );

              const departureTime = isFirstLandmark
                ? formatTimeForDisplay(routeStartingTime)
                : calculateActualTime(
                    routeStartingTime,
                    landmark.departure_delta
                  );

              const arrivalDelta = isFirstLandmark
                ? "0m"
                : formatDeltaTime(landmark.arrival_delta);

              const departureDelta = isFirstLandmark
                ? "0m"
                : formatDeltaTime(landmark.departure_delta);

              return (
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
                            <Tooltip title={`Time delta: ${arrivalDelta}`}>
                              <span>Arrive: {arrivalTime}</span>
                            </Tooltip>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ArrowUpward
                              sx={{
                                fontSize: "1rem",
                                mr: 0.5,
                                color: "success.main",
                              }}
                            />
                            <Tooltip title={`Time delta: ${departureDelta}`}>
                              <span>Depart: {departureTime}</span>
                            </Tooltip>
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
              );
            })}

            {newLandmarks.map((landmark, index) => {
              // Use the stored time strings directly
              const arrivalTime = landmark.arrivalTime || "00:00";
              const departureTime = landmark.departureTime || "00:00";

              return (
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
                        {landmark.name || "Unnamed Landmark"}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          fontSize: "0.8rem",
                          color: "text.secondary",
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
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ArrowUpward
                            sx={{
                              fontSize: "1rem",
                              mr: 0.5,
                              color: "success.main",
                            }}
                          />
                          <span>Arrive: {arrivalTime}</span>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ArrowDownward
                            sx={{
                              fontSize: "1rem",
                              mr: 0.5,
                              color: "error.main",
                            }}
                          />
                          <span>Depart: {departureTime}</span>
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
              );
            })}
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
                label="Arrival Delta (seconds)"
                type="number"
                fullWidth
                margin="normal"
                value={editingLandmark.arrival_delta}
                onChange={(e) =>
                  setEditingLandmark({
                    ...editingLandmark,
                    arrival_delta: e.target.value,
                  })
                }
              />
              <TextField
                label="Departure Delta (seconds)"
                type="number"
                fullWidth
                margin="normal"
                value={editingLandmark.departure_delta}
                onChange={(e) =>
                  setEditingLandmark({
                    ...editingLandmark,
                    departure_delta: e.target.value,
                  })
                }
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
          <Button onClick={handleLandmarkUpdate} color="primary">
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
      label="Arrival Time (HH:MM)"
      fullWidth
      margin="normal"
      value={selectedLandmark?.arrivalTime || ''}
      onChange={(e) =>
        setSelectedLandmark({
          ...selectedLandmark,
          arrivalTime: e.target.value,
        })
      }
    />
    <TextField
      label="Departure Time (HH:MM)"
      fullWidth
      margin="normal"
      value={selectedLandmark?.departureTime || ''}
      onChange={(e) =>
        setSelectedLandmark({
          ...selectedLandmark,
          departureTime: e.target.value,
        })
      }
    />
    <TextField
      label="Distance from Start (m)"
      type="number"
      fullWidth
      margin="normal"
      value={selectedLandmark?.distance_from_start || 0}
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
