import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { busStopUpdationApi, busStopListApi } from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import MapModal from "./BUsStopMapModal";
import { showSuccessToast, showErrorToast } from "../../common/toastMessageHelper";

interface BusStop {
  id: number;
  name: string;
  location: string;
  status: string;
}




interface IBusStopFormInputs {
  name: string;
  location: string;
  status: string;
}

interface IBusStopUpdateFormProps {
  onClose: () => void;
  refreshList: (value: string) => void;
  busStopId: number;
  location?: string;
}

const statusOptions = [
  { label: "VALIDATING", value: "1" },
  { label: "VERIFIED", value: "2" },
];


const BusStopUpdateForm: React.FC<IBusStopUpdateFormProps> = ({
  onClose,
  refreshList,
  busStopId,
  location,  
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [landmarkData, setLandmarkData] = useState<IBusStopFormInputs | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [updatedLocation, setUpdatedLocation] = useState(location || "");
  const [allBusStops, setAllBusStops] = useState<BusStop[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IBusStopFormInputs>({
    defaultValues: {
      location: location || "",
    },
  });

  const handleSaveBoundary = (coordinates: string) => {
    setUpdatedLocation(coordinates);
    setMapModalOpen(false);
  };

  // Fetch landmark data on mount
  useEffect(() => {
    const fetchBusStopData = async () => {
      try {
        setLoading(true);
        const busStops = await dispatch(busStopListApi()).unwrap();
        setAllBusStops(busStops); // Store all bus stops
        
        const busStop = busStops.find((r: any) => r.id === busStopId);
        console.log("Landmark Data:", busStop);

        if (busStop) {
          setLandmarkData(busStop);
          reset({
            name: busStop.name,
            location: location || busStop.location,
            status: busStop.status,
          });
          setUpdatedLocation(location || busStop.location);
        }
      } catch (error) {
        console.error("Error fetching bus stop data:", error);
        showErrorToast("Failed to fetch bus stop data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusStopData();
  }, [busStopId, dispatch, reset, location]);

  const handleLandmarkUpdate: SubmitHandler<IBusStopFormInputs> = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("id", busStopId.toString());
      formData.append("name", data.name);
      formData.append("location", data.location || updatedLocation);
      formData.append("status", data.status);

      const response = await dispatch(busStopUpdationApi({ busStopId, formData })).unwrap();
      console.log("Bus Stop updated successfully:", response);
      
      showSuccessToast("Bus Stop updated successfully!");
      refreshList("refresh");
      onClose();
    } catch (error) {
      console.error("Error updating Bus Stop:", error);
      showErrorToast("Failed to update Bus Stop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!landmarkData) {
    return <CircularProgress />;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleLandmarkUpdate)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        width: 500,
        margin: "auto",
        mt: 10,
        p: 2,
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        Update Bus Stop
      </Typography>

      <TextField
        label="Name"
        {...register("name", { required: "Name is required" })}
        error={!!errors.name}
        helperText={errors.name?.message}
        variant="outlined"
        size="small"
        fullWidth
      />

      <TextField
        label="Location"
        {...register("location", { required: "Boundary is required" })}
        value={updatedLocation}
        InputProps={{ readOnly: true }}
        onClick={() => setMapModalOpen(true)}
        fullWidth
      />

      <MapModal
       open={mapModalOpen}
       onClose={() => setMapModalOpen(false)}
       initialLocation={updatedLocation}
       onSave={handleSaveBoundary}
       busStops={allBusStops}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <TextField
            margin="normal"
            fullWidth
            select
            label="Status"
            {...field}
            error={!!errors.status}
            size="small"
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: "white" }} />
        ) : (
          "Update Bus Stop"
        )}
      </Button>
    </Box>
  );
};

export default BusStopUpdateForm;