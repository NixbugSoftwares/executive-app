import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  Chip,
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DirectionsIcon from "@mui/icons-material/Directions";
import {
  routeCreationApi,
  routeLandmarkCreationApi,
} from "../../slices/appSlice";
import { useAppDispatch } from "../../store/Hooks";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/toastMessageHelper";
import { SelectedLandmark } from "../../types/type";

interface BusRouteCreationProps {
  companyId: number | null;
  landmarks: SelectedLandmark[];
  onLandmarkRemove: (id: number) => void;
  onSuccess: () => void;
  onCancel: () => void;
  onClearRoute?: () => void;
}

interface BusRouteFormInputs {
  name: string;
  starting_time: string;
}

const BusRouteCreation = ({
  companyId,
  landmarks,
  onLandmarkRemove,
  onSuccess,
  onCancel,
  onClearRoute,
}: BusRouteCreationProps) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hour, setHour] = useState<number>(0); // UTC hours (0-23)
  const [minute, setMinute] = useState<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BusRouteFormInputs>();

  // Helper function to format time for display (24h to 12h)
  const formatTimeForDisplay = (time24h: string) => {
    const [hours, minutes] = time24h.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

 useEffect(() => {
    const utcTimeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
setValue("starting_time", utcTimeString + "Z");
    console.log("UTC time set:", utcTimeString);
  }, [hour, minute, setValue]);

  const handleRouteCreation: SubmitHandler<BusRouteFormInputs> = async (data) => {
    if (!companyId) {
      showErrorToast("Company ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      const routeFormData = new FormData();
      routeFormData.append("company_id", companyId.toString());
      routeFormData.append("name", data.name);
      routeFormData.append("starting_time", data.starting_time);
      console.log("starting_time", data.starting_time);
      

      const routeResponse = await dispatch(
        routeCreationApi(routeFormData)
      ).unwrap();
      const routeId = routeResponse.id;

      const sortedLandmarks = [...landmarks].sort(
        (a, b) => (a.distance_from_start || 0) - (b.distance_from_start || 0)
      );


      const landmarkPromises = sortedLandmarks.map((landmark, index) => {
  const landmarkFormData = new FormData();
  landmarkFormData.append("route_id", routeId.toString());
  landmarkFormData.append("landmark_id", landmark.id.toString());
  landmarkFormData.append("sequence_id", (index + 1).toString());
  landmarkFormData.append(
    "distance_from_start",
    landmark.distance_from_start?.toString() || "0"
  );

  // First landmark always has 0 deltas
  if (index === 0) {
    landmarkFormData.append("arrival_delta", "0");
    landmarkFormData.append("departure_delta", "0");
    return dispatch(routeLandmarkCreationApi(landmarkFormData)).unwrap();
  }

  // Parse UTC times directly
  const [arrivalH, arrivalM] = landmark.arrivalTime.split(':').map(Number);
  const arrivalTimeInSeconds = arrivalH * 3600 + arrivalM * 60;

  const [departureH, departureM] = landmark.departureTime.split(':').map(Number);
  const departureTimeInSeconds = departureH * 3600 + departureM * 60;

  // Starting time is already in UTC
  const [startH, startM] = data.starting_time.split(':').map(Number);
  const startTimeInSeconds = startH * 3600 + startM * 60;

  // Calculate deltas (all in UTC)
  const arrivalDelta = arrivalTimeInSeconds - startTimeInSeconds;
  const departureDelta = departureTimeInSeconds - startTimeInSeconds;

  // Validate
  if (arrivalDelta < 0 || departureDelta < 0) {
    throw new Error(`Landmark times cannot be before the starting time`);
  }

  landmarkFormData.append("arrival_delta", arrivalDelta.toString());
  landmarkFormData.append("departure_delta", departureDelta.toString());

  return dispatch(routeLandmarkCreationApi(landmarkFormData)).unwrap();
});
      await Promise.all(landmarkPromises);

      showSuccessToast("Route and landmarks created successfully");
      reset();
      onSuccess();
      if (onClearRoute) onClearRoute();
    } catch (error: unknown) {
      console.error("Error in route creation process:", error);
      showErrorToast(
        typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message 
          : "Failed to create route and landmarks"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: "100%",
        height: "100vh",
        gap: 2,
        p: 2,
        boxSizing: "border-box",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(handleRouteCreation)}
        sx={{
          flex: { xs: "0 0 100%", md: "100%" },
          maxWidth: { xs: "100%", md: "100%" },
          height: "100%",
          transition: "all 0.3s ease",
          overflow: "hidden",
          overflowY: "auto",
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Route Creation
        </Typography>

        <TextField
          margin="normal"
          required
          fullWidth
          label="Route Name"
          {...register("name", { required: "Route name is required" })}
          error={!!errors.name}
          helperText={errors.name?.message}
          autoFocus
          size="small"
        />

        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Starting Time (UTC)
      </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth size="small">
          <InputLabel>Hour (UTC)</InputLabel>
          <Select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            label="Hour (UTC)"
          >
            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
              <MenuItem key={h} value={h}>
                {h.toString().padStart(2, '0')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Minute</InputLabel>
            <Select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              label="Minute"
            >
              {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                <MenuItem key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Route Landmarks
        </Typography>

        {landmarks.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              p: 4,
              backgroundColor: "action.hover",
              borderRadius: 1,
              my: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No landmarks selected yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please select landmarks from the map to create your route
            </Typography>
          </Box>
        ) : (
          <List
            sx={{ width: "100%", maxHeight: 400, overflow: "auto", flex: 1 }}
          >
            {landmarks
              .slice()
              .sort(
                (a, b) =>
                  (a.distance_from_start || 0) - (b.distance_from_start || 0)
              )
              .map((landmark, index) => (
                <Box key={`${landmark.id}-${index}`}>
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
                            <DirectionsIcon
                              sx={{ fontSize: "1rem", mr: 0.5 }}
                            />
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
                            <ArrowDownwardIcon
                              sx={{
                                fontSize: "1rem",
                                mr: 0.5,
                                color: "error.main",
                              }}
                            />
                            <span>Arrive: {formatTimeForDisplay(landmark.arrivalTime)}</span>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ArrowUpwardIcon
                              sx={{
                                fontSize: "1rem",
                                mr: 0.5,
                                color: "success.main",
                              }}
                            />
                            <span>Depart: {formatTimeForDisplay(landmark.departureTime)}</span>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <IconButton
                      onClick={() => onLandmarkRemove(landmark.id)}
                      aria-label="delete"
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItem>

                  {index < landmarks.length - 1 && (
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
          </List>
        )}

        <Box sx={{ mt: "auto", pt: 2 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={landmarks.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Route"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default BusRouteCreation;