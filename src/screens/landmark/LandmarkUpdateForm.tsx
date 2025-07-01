import React, { useState} from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { landmarkUpdationApi} from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import MapModal from "./LandmarkMapModal";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";

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
  boundary?: string;
  landmarkData?: ILandmarkFormInputs; 
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
const statusValueMap: Record<string, string> = {
  "Validating": "1",
  "VALIDATING": "1",
  "Verified": "2",
  "VERIFIED": "2",
};
const importanceValueMap: Record<string, string> = {
  "Low": "1",
  "LOW": "1",
  "Medium": "2",
  "MEDIUM": "2",
  "High": "3",
  "HIGH": "3",
};

function toWKTPolygon(boundary: string) {
  if (!boundary) return "";
  if (boundary.trim().startsWith("POLYGON")) return boundary;
  return `POLYGON((${boundary}))`;
}

const LandmarkUpdateForm: React.FC<ILandmarkUpdateFormProps> = ({
  onClose,
  refreshList,
  landmarkId,
  boundary,
  landmarkData
}) => {
  console.log("landmark dataaaaaaaaaaaa", landmarkData);
  
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [updatedBoundary, setUpdatedBoundary] = useState(
  landmarkData?.boundary || boundary || ""
);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ILandmarkFormInputs>({
    defaultValues: {
    name: landmarkData?.name || "",
    boundary: landmarkData?.boundary,
    status: statusValueMap[landmarkData?.status ?? ""] || "",
    importance: importanceValueMap[landmarkData?.importance ?? ""] || "",
  },
  });

  const handleSaveBoundary = (coordinates: string) => {
    setUpdatedBoundary(coordinates);
    setMapModalOpen(false);
  };
  const handleLandmarkUpdate: SubmitHandler<ILandmarkFormInputs> = async (
    data
  ) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("id", landmarkId.toString());
      formData.append("name", data.name);
      formData.append("boundary", toWKTPolygon(data.boundary || updatedBoundary));
      formData.append("status", data.status);
      formData.append("importance", data.importance);
console.log("boundary", data.boundary || updatedBoundary);

      await dispatch(landmarkUpdationApi({ landmarkId, formData })).unwrap();

      showSuccessToast("Landmark updated successfully!");
      refreshList("refresh");
      onClose();
    } catch (error: any) {
      showErrorToast( error );
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
        label="Boundary"
        {...register("boundary", { required: "Boundary is required" })}
        value={updatedBoundary}
        InputProps={{ readOnly: true }}
        onClick={() => setMapModalOpen(true)}
        fullWidth
      />

      <MapModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        initialBoundary={updatedBoundary}
        onSave={handleSaveBoundary}
        editingLandmarkId={landmarkId}
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
          "Update Landmark"
        )}
      </Button>
    </Box>
  );
};

export default LandmarkUpdateForm;
