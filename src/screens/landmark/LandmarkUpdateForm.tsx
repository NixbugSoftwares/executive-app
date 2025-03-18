import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, MenuItem, CircularProgress } from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { landmarkUpdationApi, landmarkListApi } from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

interface ILandmarkFormInputs {
  name: string;
  boundary: string;
  status: string;
  importance: string;
}

interface ILandmarkUpdateFormProps {
  onClose: () => void;
  refreshList: (value: string) => void;
  landmarkId: number;
}

const statusOptions = [
  { label: "VALIDATING", value: "1" },
  { label: "VERIFIED", value: "2" },
];

const importanceOptions = [
  { label: "LOW", value: 1 },
  { label: "MEDIUM", value: 2 },
  { label: "HIGH", value: 3 },
];

const LandmarkUpdateForm: React.FC<ILandmarkUpdateFormProps> = ({
  onClose,
  refreshList,
  landmarkId,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [landmarkData, setLandmarkData] = useState<ILandmarkFormInputs | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ILandmarkFormInputs>();

  // Fetch landmark data on mount
  useEffect(() => {
    const fetchLandmarkData = async () => {
      try {
        setLoading(true);
        const landmarks = await dispatch(landmarkListApi()).unwrap();
        const landmark = landmarks.find((r: any) => r.id === landmarkId);

        if (landmark) {
          setLandmarkData(landmark);
          reset({
            name: landmark.name,
            boundary: landmark.boundary,
            status: landmark.status,
            importance: landmark.importance,
          });
        }
      } catch (error) {
        console.error("Error fetching landmark data:", error);
        alert("Failed to fetch landmark data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLandmarkData();
  }, [landmarkId, dispatch, reset]);

  // Handle Landmark Update
  const handleLandmarkUpdate: SubmitHandler<ILandmarkFormInputs> = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("boundary", data.boundary);
      formData.append("status", data.status);
      formData.append("importance", data.importance);

      console.log("Form Data:", {
        name: data.name,
        boundary: data.boundary,
        status: data.status,
        importance: data.importance,
      });

      // Dispatch the update API
      const response = await dispatch(landmarkUpdationApi({ landmarkId, formData })).unwrap();
      console.log("Landmark updated:", response);
      alert("Landmark updated successfully!");
      refreshList("refresh");
      onClose();
    } catch (error) {
      console.error("Error updating landmark:", error);
      alert("Failed to update landmark. Please try again.");
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
        Update Landmark
      </Typography>

      {/* Name Field */}
      <TextField
        label="Name"
        {...register("name", { required: "Name is required" })}
        error={!!errors.name}
        helperText={errors.name?.message}
        variant="outlined"
        size="small"
        fullWidth
      />

      {/* Boundary Field */}
      <TextField
        label="Boundary"
        {...register("boundary", { required: "Boundary is required" })}
        error={!!errors.boundary}
        helperText={errors.boundary?.message}
        variant="outlined"
        size="small"
        fullWidth
        InputProps={{ readOnly: true }}
      />

      {/* Status Field */}
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

      {/* Importance Field */}
      <Controller
        name="importance"
        control={control}
        render={({ field }) => (
          <TextField
            margin="normal"
            fullWidth
            select
            label="Importance"
            {...field}
            error={!!errors.importance}
            size="small"
          >
            {importanceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {/* Submit Button */}
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
        {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Update Landmark"}
      </Button>
    </Box>
  );
};

export default LandmarkUpdateForm;