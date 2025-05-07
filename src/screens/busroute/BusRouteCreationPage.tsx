import { useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DirectionsIcon from '@mui/icons-material/Directions';
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusRouteFormInputs>();

  const handleRouteCreation: SubmitHandler<BusRouteFormInputs> = async (
    data
  ) => {
    if (!companyId) {
      showErrorToast("Company ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the route first
      const routeFormData = new FormData();
      routeFormData.append("company_id", companyId.toString());
      routeFormData.append("name", data.name);

      console.log("=== ROUTE CREATION DATA ===");
      console.log("Company ID:", companyId);
      console.log("Route Name:", data.name);

      const routeResponse = await dispatch(
        routeCreationApi(routeFormData)
      ).unwrap();
      const routeId = routeResponse.id;
      console.log("Route created successfully. Route ID:", routeId);

      const sortedLandmarks = [...landmarks].sort(
        (a, b) => (a.distance_from_start || 0) - (b.distance_from_start || 0)
      );

      // Step 2: Add all landmarks to the route
      const landmarkPromises = sortedLandmarks.map((landmark, index) => {
        const landmarkFormData = new FormData();
        landmarkFormData.append("route_id", routeId.toString());
        landmarkFormData.append("landmark_id", landmark.id.toString());
        // Assign sequence_id based on sorted index
        landmarkFormData.append("sequence_id", (index + 1).toString());
        landmarkFormData.append(
          "distance_from_start",
          landmark.distance_from_start?.toString() || "0"
        );
        const formatDateTime = (datetimeStr: string) => {
          if (datetimeStr.includes("T")) {
            return datetimeStr.length === 16
              ? `${datetimeStr}:00`
              : datetimeStr;
          }
          return `${new Date().toISOString().split("T")[0]}T${datetimeStr}:00`;
        };

        const arrivalDateTime = formatDateTime(landmark.arrivalTime);
        const departureDateTime = formatDateTime(landmark.departureTime);

        landmarkFormData.append("departure_time", departureDateTime);
        landmarkFormData.append("arrival_time", arrivalDateTime);

        return dispatch(routeLandmarkCreationApi(landmarkFormData)).unwrap();
      });

      await Promise.all(landmarkPromises);

      // Show success message
      showSuccessToast("Route and landmarks created successfully");
      reset();
      onSuccess();
      if (onClearRoute) {
        onClearRoute();
      }
    } catch (error: unknown) {
      console.error("Error in route creation process:", error);

      if (error instanceof Error) {
        const errorMsg =
          error.message || "Failed to create route and landmarks";
        showErrorToast(errorMsg);
      } else {
        showErrorToast("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "Not set";

    try {
      const date = new Date(dateTimeStr);
      // Format as "DD/MM/YYYY, HH:MM AM/PM"
      return date.toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return dateTimeStr;
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
          <List sx={{ width: "100%", maxHeight: 400, overflow: "auto", flex: 1 }}>
  {landmarks
    .slice()
    .sort((a, b) => (a.distance_from_start || 0) - (b.distance_from_start || 0))
    .map((landmark, index) => (
      <Box key={`${landmark.id}-${index}`}>
        <ListItem
          sx={{
            display: "flex",
            alignItems: "flex-start",
            py: 2,
            px: 2,
            backgroundColor: index % 2 === 0 ? "action.hover" : "background.paper",
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
              fontSize: '0.875rem',
              fontWeight: 600 
            }}
          />
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {landmark.name}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
              mt: 0.5,
              flexWrap: 'wrap'
            }}>
              {landmark.distance_from_start !== undefined && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem'
                }}>
                  <DirectionsIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                  {landmark.distance_from_start}m
                </Box>
              )}
              
              <Box sx={{ 
                display: 'flex', 
                gap: 1.5,
                fontSize: '0.8rem',
                color: 'text.secondary'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowUpwardIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'success.main' }} />
                  <span>Depart: {formatDateTime(landmark.departureTime)}</span>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowDownwardIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'error.main' }} />
                  <span>Arrive: {formatDateTime(landmark.arrivalTime)}</span>
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
