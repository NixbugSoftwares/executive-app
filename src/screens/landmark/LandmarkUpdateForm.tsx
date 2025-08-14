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
import { landmarkUpdationApi } from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import MapModal from "./LandmarkMapModal";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";

interface ILandmarkFormInputs {
  name: string;
  boundary: string;
  type: string;
}

interface ILandmarkUpdateFormProps {
  onClose: () => void;
  refreshList: (value: string) => void;
  landmarkId: number;
  boundary?: string;
  landmarkData?: ILandmarkFormInputs;
  onBack?: () => void;
}

const typeOptions = [
  { label: "LOCAL", value: 1 },
  { label: "VILLAGE", value: 2 },
  { label: "DISTRICT", value: 3 },
  { label: "STATE", value: 4 },
  { label: "NATIONAL", value: 5 },
];
const typeValueMap: Record<string, string> = {
  LOCAL: "1",
  Local: "1",
  VILLAGE: "2",
  Village: "2",
  DISTRICT: "3",
  District: "3",
  STATE: "4",
  State: "4",
  NATIONAL: "5",
  National: "5",
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
  landmarkData,
  onBack,
}) => {
  console.log(landmarkData);

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
      type: typeValueMap[landmarkData?.type ?? ""] || "",
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
      formData.append(
        "boundary",
        toWKTPolygon(data.boundary || updatedBoundary)
      );
      formData.append("type", data.type);
      await dispatch(landmarkUpdationApi({ landmarkId, formData })).unwrap();
      showSuccessToast("Landmark updated successfully!");
      refreshList("refresh");
      onBack && onBack();
      onClose();
    } catch (error: any) {
      showErrorToast(error);
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
        {...register("name", {
          required: "Landmark name is required",
          minLength: {
            value: 4,
            message: "Landmark name must be at least 4 characters",
          },
          maxLength: {
            value: 32,
            message: "Landmark name cannot exceed 32 characters",
          },
          validate: {
            allowedChars: (value: any) =>
              /^[A-Za-z0-9\s\-_()]*$/.test(value) ||
              "Name can only contain letters, numbers, spaces, hyphens (-), underscores (_), and brackets ( )",
            noLeadingTrailingSpaces: (value: any) =>
              !/^\s|\s$/.test(value) ||
              "Name should not start or end with a space",
            noConsecutiveSpecials: (value: any) =>
              !/([\s\-_()]{2,})/.test(value) ||
              "Name cannot have consecutive spaces or special characters",
          },
        })}
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
        name="type"
        control={control}
        render={({ field }) => (
          <TextField
            margin="normal"
            fullWidth
            select
            label="type"
            {...field}
            error={!!errors.type}
            size="small"
          >
            {typeOptions.map((option) => (
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
