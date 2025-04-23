import { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
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


interface BusRouteCreationProps {
  companyId: number | null;
  landmarks: SelectedLandmark[];
  onLandmarkRemove: (id: string) => void;
  onSuccess: () => void;
  onCancel: () => void;
}


interface SelectedLandmark {
  id: string;
  name: string;
  sequenceId: number;
  arrivalTime: string;
  departureTime: string;
}


interface BusRouteFormInputs {
  name: string;
}

const BusRouteCreation = ({
  companyId,
  landmarks,
  onLandmarkRemove,
  onSuccess,
  onCancel
}: BusRouteCreationProps) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusRouteFormInputs>();


  const handleRouteCreation: SubmitHandler<BusRouteFormInputs> = async (data) => {
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
  
      const routeResponse = await dispatch(routeCreationApi(routeFormData)).unwrap();
      const routeId = routeResponse.id;
      console.log("Route created successfully. Route ID:", routeId);
  
      // Step 2: Add all landmarks to the route
      const landmarkPromises = landmarks.map((landmark) => {
        const landmarkFormData = new FormData();
        landmarkFormData.append("route_id", routeId.toString());
        landmarkFormData.append("landmark_id", landmark.id);
        landmarkFormData.append("sequence_id", landmark.sequenceId.toString());
  
        const formatDateTime = (datetimeStr: string) => {
          if (datetimeStr.includes("T")) {
            return datetimeStr.length === 16 ? `${datetimeStr}:00` : datetimeStr;
          }
          return `${new Date().toISOString().split("T")[0]}T${datetimeStr}:00`;
        };
        
        const arrivalDateTime = formatDateTime(landmark.arrivalTime);
        const departureDateTime = formatDateTime(landmark.departureTime);
  
        landmarkFormData.append("arrival_time", arrivalDateTime);
        landmarkFormData.append("departure_time", departureDateTime);
  
        return dispatch(routeLandmarkCreationApi(landmarkFormData)).unwrap();
      });
  
      await Promise.all(landmarkPromises);
  
      // Show success message
      showSuccessToast("Route and landmarks created successfully");
      reset(); 
      onSuccess();
  
    } catch (error: unknown) {
      console.error("Error in route creation process:", error);
  
      if (error instanceof Error) {
        const errorMsg = error.message || "Failed to create route and landmarks";
        showErrorToast(errorMsg);
      } else {
        showErrorToast("An unexpected error occurred");
      }
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

<Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Route Landmarks
      </Typography>

      <List sx={{ width: "100%", maxHeight: 400, overflow: "auto" }}>
        {landmarks.map((landmark, index) => (
          <Box key={`${landmark.id}-${index}`}>
            <ListItem sx={{
                  display: "flex",
                  alignItems: "center",
                  py: 2,
                  backgroundColor:
                    index % 2 === 0 ? "action.hover" : "background.paper",
                  borderRadius: 1,
                }}>
              <Chip label={landmark.sequenceId} color="primary"
                  sx={{ mr: 2, minWidth: 32 }}/>
              <ListItemText
                primary={landmark.name}
                secondary={`Arrival: ${landmark.arrivalTime} | Departure: ${landmark.departureTime}`}
              />
              <IconButton
                onClick={() => onLandmarkRemove(landmark.id)}
                aria-label="delete"
                color="error"
                size="small"
              >
                <DeleteIcon />
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
                    ml: 3.5,
                    listStyle: "none",
                  }}
                />
              )}
          </Box>
        ))}
      </List>

        

      <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={landmarks.length === 0 || isSubmitting}
          onClick={handleSubmit(handleRouteCreation)}
        >
          {isSubmitting ? "Saving..." : "Save Route"}
        </Button>
      </Stack>
      </Box>

    </Box>
  );
};

export default BusRouteCreation;
