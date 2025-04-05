import React, { useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useAppDispatch } from "../../store/Hooks";
import { busStopCreationApi } from "../../slices/appSlice";
import {  showSuccessToast, showErrorToast } from "../../common/toastMessageHelper";


interface IBusStopFormInputs {
  name: string;
  landmark_id: string;
  location: string;
  status: string;
}

interface IBusStopCreationFormProps {
  location: string;
  onClose: () => void;
  refreshList: (value: string) => void;
}

const statusOptions =  [
  { label: "VALIDATING", value: "1" },
  { label: "VERIFIED", value: "2" },
];
const BusStopAddForm: React.FC<IBusStopCreationFormProps> = ({
  location,
  onClose,
  refreshList,
}) => {
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IBusStopFormInputs>({
   
  });

  useEffect(() => {
    setValue("location", `POLYGON((${location}))`);
  }, [location, setValue]);
  
  const handleLandmarkCreation: SubmitHandler<IBusStopFormInputs> = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
        formData.append("landmark_id", data.landmark_id);
      formData.append("location", data.location); 
      formData.append("status", data.status);
  
   
  
      const response = await dispatch(busStopCreationApi(formData)).unwrap();
      console.log("Landmark created successfully:", response);
      showSuccessToast("Landmark created successfully!");
      refreshList("refresh");
      onClose();
    } catch (error) {
      console.error("Error creating landmark:", error);
      showErrorToast("Something went wrong. Please try again.");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleLandmarkCreation)}
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
            label="Name"
            variant="outlined"
            size="small"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...field}
          />
        )}
      />

      {/* Boundary Field */}
      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <TextField
            label="Boundary"
            variant="outlined"
            required
            fullWidth
            InputProps={{ readOnly: true }}
            error={!!errors.location}
            helperText={errors.location?.message}
            {...field}
          />
        )}
      />

      {/* Status Field */}
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <TextField margin="normal" fullWidth select label="Status" {...field} error={!!errors.status} size="small">
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Button type="submit" variant="contained" color="success" fullWidth>
        Add Bus Stop
      </Button>
    </Box>
  );
};

export default BusStopAddForm;