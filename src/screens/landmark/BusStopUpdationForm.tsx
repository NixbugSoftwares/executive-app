import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { busStopUpdationApi } from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import MapModal from "./BUsStopMapModal";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";
import { Landmark } from "../../types/type";

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
  refreshBusStops: (value: string) => void;
  busStop: BusStop;
  landmark: Landmark;
}

const BusStopUpdateForm: React.FC<IBusStopUpdateFormProps> = ({
  onClose,
  refreshBusStops,
  busStop,
  landmark,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [updatedLocation, setUpdatedLocation] = useState(busStop.location);
  const statusTextToValue = (status: string) => {
  if (status.toLowerCase() === "validating") return "1";
  if (status.toLowerCase() === "verified") return "2";
  return "";
};
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<IBusStopFormInputs>({
    defaultValues: {
      name: busStop.name,
      location: busStop.location,
      status: statusTextToValue(busStop.status),
    },
  });

  function ensureWktPoint(value: string): string {
    if (/^POINT\(\s*-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s*\)$/i.test(value)) {
      return value;
    }
    const match = value.match(/(-?\d+(\.\d+)?)[ ,]+(-?\d+(\.\d+)?)/);
    if (match) {
      return `POINT(${match[1]} ${match[3]})`;
    }
    return "";
  }
const statusOptions = [
  { label: "Validating", value: "1" },
  { label: "Verified", value: "2" },
];
  const handleBusStopUpdate: SubmitHandler<IBusStopFormInputs> = async (
    data
  ) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("id", busStop.id.toString());
      formData.append("name", data.name);
      formData.append("location", ensureWktPoint(data.location || updatedLocation));
      formData.append("status", data.status);

      await dispatch(busStopUpdationApi({ busStopId: busStop.id, formData })).unwrap();
      refreshBusStops("refresh");
      showSuccessToast("Bus Stop updated successfully!");
      onClose();
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleBusStopUpdate)}
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
        {...register("location", { required: "Location is required" })}
        value={updatedLocation}
        InputProps={{ readOnly: true }}
        onClick={() => setMapModalOpen(true)}
        fullWidth
      />

      <MapModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        busStopId={busStop.id}
        landmarkId={landmark.id}
        onSave={(newLocation) => {
          setValue("location", newLocation);
          setUpdatedLocation(newLocation);
          setMapModalOpen(false);
        }}
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