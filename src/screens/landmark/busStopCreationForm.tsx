import React from "react";
import { Box, TextField, Button, Typography} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useAppDispatch } from "../../store/Hooks";
import { busStopCreationApi } from "../../slices/appSlice";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";
interface IBusStopFormInputs {
  name: string;
  landmark_id: string;
  location: string;
  status: string;
}

interface IBusStopCreationFormProps {
  landmarkId: number | null;
  location: string;
  onClose: () => void;
  refreshBusStops: () => void;
}

const BusStopAddForm: React.FC<IBusStopCreationFormProps> = ({
  location,
  landmarkId,
  onClose,
  refreshBusStops,
}) => {
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IBusStopFormInputs>({
    defaultValues: {
      name: "",
      landmark_id: landmarkId?.toString() || "",
      location: location || "",
      status: "1", 
    },
  });

  const handleBusStopCreation: SubmitHandler<IBusStopFormInputs> = async (
    data
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("landmark_id", data.landmark_id);
      formData.append("location", `POINT(${location})`);
      await dispatch(busStopCreationApi(formData)).unwrap();
      await refreshBusStops(); 
      showSuccessToast("Bus Stop created successfully!");
      onClose();
    } catch (error: any) {
      showErrorToast(error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleBusStopCreation)}
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
        Bus Stop Creation Form
      </Typography>

      {/* Name Field */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
          required
            label="Name"
            variant="outlined"
            size="small"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="location"
        control={control}
        render={({ field }) => {
          const coords = field.value.replace(/POINT\(|\)/g, "");
          return (
            <TextField
              label="Location Coordinates"
              variant="outlined"
              required
              fullWidth
              InputProps={{ readOnly: true }}
              value={coords}
              error={!!errors.location}
              helperText={errors.location?.message}
              onChange={field.onChange}
            />
          );
        }}
      />

     
      <Button type="submit" variant="contained" color="success" fullWidth>
        Add Bus Stop
      </Button>
    </Box>
  );
};

export default BusStopAddForm;
