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
  AccessTime,
  Timer as TimerIcon,
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
  routeManagePermission: boolean;
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
  routeManagePermission,
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
  const [selectedLandmark, setSelectedLandmark] =
    useState<SelectedLandmark | null>(null);

  const [localHour, setLocalHour] = useState<number>(12); // 1-12
  const [localMinute, setLocalMinute] = useState<number>(0);
  const [amPm, setAmPm] = useState<string>("AM");

  const [arrivalHour, setArrivalHour] = useState<number>(12);
  const [arrivalMinute, setArrivalMinute] = useState<number>(0);
  const [arrivalAmPm, setArrivalAmPm] = useState<string>("AM");
  const [departureHour, setDepartureHour] = useState<number>(12);
  const [departureMinute, setDepartureMinute] = useState<number>(0);
  const [departureAmPm, setDepartureAmPm] = useState<string>("AM");
  const lastLandmark = routeLandmarks[routeLandmarks.length - 1];

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "N/A";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    let result = "";
    if (h > 0) result += `${h}h `;
    result += `${m}m`;
    return result.trim();
  };
  const totalDurationSeconds = lastLandmark
    ? parseInt(lastLandmark.arrival_delta, 10)
    : 0;
  const totalDuration = formatDuration(totalDurationSeconds);

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

  useEffect(() => {
    if (editMode && routeStartingTime) {
      let [h, m] = routeStartingTime.split(":").map(Number);
      if (h === 0) {
        setLocalHour(12);
        setAmPm("AM");
      } else if (h === 12) {
        setLocalHour(12);
        setAmPm("PM");
      } else if (h > 12) {
        setLocalHour(h - 12);
        setAmPm("PM");
      } else {
        setLocalHour(h);
        setAmPm("AM");
      }
      setLocalMinute(m);
    }
  }, [editMode, routeStartingTime]);

  useEffect(() => {
    if (editingLandmark) {
      // Arrival
      let [ah, am] = (editingLandmark.arrivalTime || "00:00")
        .split(":")
        .map(Number);
      if (ah === 0) {
        setArrivalHour(12);
        setArrivalAmPm("AM");
      } else if (ah === 12) {
        setArrivalHour(12);
        setArrivalAmPm("PM");
      } else if (ah > 12) {
        setArrivalHour(ah - 12);
        setArrivalAmPm("PM");
      } else {
        setArrivalHour(ah);
        setArrivalAmPm("AM");
      }
      setArrivalMinute(am);

      // Departure
      let [dh, dm] = (editingLandmark.departureTime || "00:00")
        .split(":")
        .map(Number);
      if (dh === 0) {
        setDepartureHour(12);
        setDepartureAmPm("AM");
      } else if (dh === 12) {
        setDepartureHour(12);
        setDepartureAmPm("PM");
      } else if (dh > 12) {
        setDepartureHour(dh - 12);
        setDepartureAmPm("PM");
      } else {
        setDepartureHour(dh);
        setDepartureAmPm("AM");
      }
      setDepartureMinute(dm);
    }
  }, [editingLandmark]);

  const convertLocalToUTC = (hour: number, minute: number, period: string) => {
    let utcHour = hour;
    if (period === "PM" && hour !== 12) {
      utcHour += 12;
    } else if (period === "AM" && hour === 12) {
      utcHour = 0;
    }
    return `${utcHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:00`;
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
      sortedLandmarks.forEach((lm, idx) => {
        console.log(`Landmark #${idx + 1}:`, {
          id: lm.id,
          name: lm.name,
          sequence_id: lm.sequence_id,
          arrival_delta: lm.arrival_delta,
          departure_delta: lm.departure_delta,
          distance_from_start: lm.distance_from_start,
          arrivalTime: lm.arrivalTime,
          departureTime: lm.departureTime,
        });
      });
      setRouteLandmarks(sortedLandmarks);
      updateParentMapLandmarks(sortedLandmarks);
    } catch (error) {
      showErrorToast("Failed to fetch route landmarks");
    } finally {
      setIsLoading(false);
    }
  };

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

  
  const calculateTimeDeltas = (startTime: string, landmarkTimes: string[]) => {
    const deltas: number[] = [];
    let currentDay = 0;
    let previousTimeInSeconds = 0;

    // Convert start time to seconds
    const [startH, startM] = startTime.split(":").map(Number);
    const startTimeInSeconds = startH * 3600 + startM * 60;

    landmarkTimes.forEach((time, index) => {
      const [hours, minutes] = time.split(":").map(Number);
      const currentTimeInSeconds = hours * 3600 + minutes * 60;

      if (index > 0) {
        // If current time is earlier than previous time, we've crossed midnight
        if (currentTimeInSeconds < previousTimeInSeconds) {
          currentDay++;
        }
      }

      // Calculate total delta including days
      const totalDelta =
        currentDay * 86400 + (currentTimeInSeconds - startTimeInSeconds);
      deltas.push(totalDelta);
      previousTimeInSeconds = currentTimeInSeconds;
    });

    return deltas;
  };

  const calculateTimeInSeconds = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60;
  };

  const calculateDeltaWithDayOffset = (
    startTime: string,
    targetTime: string,
    previousTime: string | null,
    previousDelta: number | null
  ) => {
    const startSeconds = calculateTimeInSeconds(startTime);
    const targetSeconds = calculateTimeInSeconds(targetTime);

    let dayOffset = 0;
    if (previousTime && previousDelta !== null) {
      const prevSeconds = calculateTimeInSeconds(previousTime);
      if (targetSeconds < prevSeconds) {
        // Crossed midnight
        dayOffset = Math.floor(previousDelta / 86400) + 1;
      } else {
        dayOffset = Math.floor(previousDelta / 86400);
      }
    }

    const delta = dayOffset * 86400 + (targetSeconds - startSeconds);
    if (targetSeconds < startSeconds) {
      // If target time is earlier than start time, add 24 hours
      return delta + 86400;
    }
    return delta;
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
      const startTime = routeStartingTime.replace("Z", "");
      let previousArrivalTime =
        routeLandmarks.length > 0
          ? calculateActualTime(
              routeStartingTime,
              routeLandmarks[routeLandmarks.length - 1].arrival_delta || "0"
            ).replace(/ AM| PM/, "")
          : startTime;

      let previousArrivalDelta =
        routeLandmarks.length > 0
          ? parseInt(
              routeLandmarks[routeLandmarks.length - 1].arrival_delta || "0",
              10
            )
          : calculateTimeDeltas(startTime, [startTime])[0];

      const creationPromises = newLandmarks.map(async (landmark, index) => {
        const arrivalDelta = calculateDeltaWithDayOffset(
  routeStartingTime,
  landmark.arrivalTime || "00:00",
  index === 0
    ? previousArrivalTime
    : newLandmarks[index - 1].arrivalTime || "00:00",
  index === 0
    ? previousArrivalDelta
    : calculateDeltaWithDayOffset(
        routeStartingTime,
        newLandmarks[index - 1].arrivalTime || "00:00",
        previousArrivalTime,
        previousArrivalDelta
      )
);

        previousArrivalDelta = arrivalDelta; // Update previousArrivalDelta value

        const departureDelta =
          arrivalDelta +
          (calculateTimeInSeconds(landmark.departureTime || "00:00") -
            calculateTimeInSeconds(landmark.arrivalTime || "00:00"));
        // ...
        console.log(
          "Landmark:",
          landmark.id,
          "Arrival Delta:",
          arrivalDelta,
          "Departure Delta:",
          departureDelta
        );

        const formData = new FormData();
        formData.append("route_id", routeId.toString());
        formData.append("landmark_id", landmark.id.toString());
        formData.append("arrival_delta", arrivalDelta.toString());
        formData.append("departure_delta", departureDelta.toString());
        formData.append(
          "distance_from_start",
          (landmark.distance_from_start || 0).toString()
        );

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
      const timeString = convertLocalToUTC(localHour, localMinute, amPm);
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

  const handleLandmarkEditClick = (landmark: RouteLandmark) => {
    // Helper to get UTC time string in HH:mm
    const getUtcTimeString = (startingTime: string, delta: string) => {
      if (!startingTime || !delta) return "";
      let [h, m] = startingTime.split(":").map(Number);
      const startSeconds = h * 3600 + m * 60;
      const totalSeconds = startSeconds + parseInt(delta || "0", 10);
      const utcHour = Math.floor((totalSeconds / 3600) % 24);
      const utcMinute = Math.floor((totalSeconds % 3600) / 60);
      return `${String(utcHour).padStart(2, "0")}:${String(utcMinute).padStart(
        2,
        "0"
      )}`;
    };

    setEditingLandmark({
      ...landmark,
      arrivalTime: getUtcTimeString(
        routeStartingTime,
        landmark.arrival_delta || "0"
      ),
      departureTime: getUtcTimeString(
        routeStartingTime,
        landmark.departure_delta || "0"
      ),
    });
  };

  const handleLandmarkUpdate = async () => {
    if (!editingLandmark) return;
    try {
      const getTimeString = (hour: number, minute: number, period: string) => {
        let h = hour;
        if (period === "PM" && hour !== 12) h += 12;
        if (period === "AM" && hour === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${String(minute).padStart(
          2,
          "0"
        )}`;
      };

      const newArrivalTime = getTimeString(
        arrivalHour,
        arrivalMinute,
        arrivalAmPm
      );
      const newDepartureTime = getTimeString(
        departureHour,
        departureMinute,
        departureAmPm
      );
      const startTime = routeStartingTime.replace("Z", "");

      // Find the landmark's position
      const landmarkIndex = routeLandmarks.findIndex(
        (lm) => lm.id === editingLandmark.id
      );

      // Get previous landmark's time and delta
      const prevLandmark =
        landmarkIndex > 0 ? routeLandmarks[landmarkIndex - 1] : null;
      const prevTime = prevLandmark
        ? calculateActualTime(
            routeStartingTime,
            prevLandmark.arrival_delta || "0"
          ).replace(/ AM| PM/, "")
        : startTime;
      let prevDelta = prevLandmark
        ? parseInt(prevLandmark.arrival_delta || "0", 10)
        : calculateTimeDeltas(startTime, [startTime])[0];

      // Calculate new deltas
      const arrivalDelta = calculateDeltaWithDayOffset(
        startTime,
        newArrivalTime,
        prevTime,
        prevDelta
      );

      prevDelta = arrivalDelta; // Update prevDelta value

      const departureDelta =
        arrivalDelta +
        (calculateTimeInSeconds(newDepartureTime) -
          calculateTimeInSeconds(newArrivalTime));

      const formData = new FormData();
      formData.append("id", editingLandmark.id.toString());
      formData.append("arrival_delta", arrivalDelta.toString());
      formData.append("departure_delta", departureDelta.toString());

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

        <Tooltip
          title={
            !routeManagePermission
              ? "You don't have permission, contact the admin"
              : editMode
              ? "Cancel editing this route"
              : "Edit this route"
          }
          placement="top-end"
        >
          <span
            style={{
              cursor: !routeManagePermission ? "not-allowed" : "pointer",
            }}
          >
            <Button
              variant={editMode ? "outlined" : "contained"}
              onClick={handleEditRoute}
              disabled={!routeManagePermission}
              sx={{
                backgroundColor: !routeManagePermission
                  ? "#6c87b7 !important"
                  : editMode
                  ? "transparent"
                  : "#3f51b5",
                color: !routeManagePermission
                  ? "#ffffff"
                  : editMode
                  ? "#3f51b5"
                  : "white",
                "&.Mui-disabled": {
                  backgroundColor: "#6c87b7 !important",
                  color: "#ffffff99",
                },
                borderColor: editMode ? "#3f51b5" : undefined,
              }}
            >
              {editMode ? "Cancel Edit" : "Edit Route"}
            </Button>
          </span>
        </Tooltip>
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
                  <Select
                    value={localHour}
                    onChange={(e) => setLocalHour(Number(e.target.value))}
                    label="Hour"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <MenuItem key={h} value={h}>
                        {String(h).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>Minute</InputLabel>
                  <Select
                    value={localMinute}
                    onChange={(e) => setLocalMinute(Number(e.target.value))}
                    label="Minute"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <MenuItem key={m} value={m}>
                        {String(m).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>AM/PM</InputLabel>
                  <Select
                    value={amPm}
                    onChange={(e) => setAmPm(e.target.value)}
                    label="AM/PM"
                  >
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mb: 3,
                px: 2,
                py: 2.5,
                borderRadius: 1,
                bgcolor: "background.paper",
                boxShadow: 1,
              }}
            >
              {/* Title Section */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 1,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    letterSpacing: 0.5,
                  }}
                >
                  {routeName}
                </Typography>
              </Box>

              {/* Info Section */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                  px: 2,
                }}
              >
                {/* Starting Time */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 200,
                  }}
                >
                  <AccessTime
                    sx={{
                      fontSize: 22,
                      mr: 1.5,
                      color: "text.secondary",
                    }}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Starting:{" "}
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {formatTimeForDisplay(routeStartingTime)}
                    </Box>
                  </Typography>
                </Box>

                {/* Total Duration */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 200,
                  }}
                >
                  <TimerIcon
                    sx={{
                      fontSize: 22,
                      mr: 1.5,
                      color: "text.secondary",
                    }}
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Duration:{" "}
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {totalDuration}
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Box>
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

              {/* Arrival Time */}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Arrival Time
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hour</InputLabel>
                  <Select
                    value={arrivalHour}
                    onChange={(e) => setArrivalHour(Number(e.target.value))}
                    label="Hour"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <MenuItem key={h} value={h}>
                        {String(h).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Minute</InputLabel>
                  <Select
                    value={arrivalMinute}
                    onChange={(e) => setArrivalMinute(Number(e.target.value))}
                    label="Minute"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <MenuItem key={m} value={m}>
                        {String(m).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>AM/PM</InputLabel>
                  <Select
                    value={arrivalAmPm}
                    onChange={(e) => setArrivalAmPm(e.target.value)}
                    label="AM/PM"
                  >
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Departure Time */}
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                Departure Time
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hour</InputLabel>
                  <Select
                    value={departureHour}
                    onChange={(e) => setDepartureHour(Number(e.target.value))}
                    label="Hour"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <MenuItem key={h} value={h}>
                        {String(h).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Minute</InputLabel>
                  <Select
                    value={departureMinute}
                    onChange={(e) => setDepartureMinute(Number(e.target.value))}
                    label="Minute"
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <MenuItem key={m} value={m}>
                        {String(m).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>AM/PM</InputLabel>
                  <Select
                    value={departureAmPm}
                    onChange={(e) => setDepartureAmPm(e.target.value)}
                    label="AM/PM"
                  >
                    <MenuItem value="AM">AM</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                  </Select>
                </FormControl>
              </Box>

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
                value={selectedLandmark?.arrivalTime || ""}
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
                value={selectedLandmark?.departureTime || ""}
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
