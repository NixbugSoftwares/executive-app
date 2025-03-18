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
import { landmarkCreationApi } from "../../slices/appSlice";
// import { yupResolver } from "@hookform/resolvers/yup";


interface ILandmarkFormInputs {
  name: string;
  boundary: string;
  status: string;
  importance: string;
}

interface ILandmarkCreationFormProps {
  boundary: string;
  onClose: () => void;
  refreshList: (value: string) => void;
}

const statusOptions =  [
  { label: "VALIDATING", value: "1" },
  { label: "VERIFIED", value: "2" },
];

const importanceOptions = [
  { label: "LOW", value: 1 },
  { label: "MEDIUM", value: 2 },
  { label: "HIGH", value: 3 },
]
const LandmarkAddForm: React.FC<ILandmarkCreationFormProps> = ({
  boundary,
  onClose,
  refreshList,
}) => {
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ILandmarkFormInputs>({
    // resolver: yupResolver(landmarkCreationSchema),
    defaultValues: {
      name: "",
      boundary: boundary,
      status: "1",
      importance: "1",
    },
  });

  useEffect(() => {
    setValue("boundary", `POLYGON((${boundary}))`);
  }, [boundary, setValue]);
  
  const handleLandmarkCreation: SubmitHandler<ILandmarkFormInputs> = async (data) => {
    try {
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
  
      const response = await dispatch(landmarkCreationApi(formData)).unwrap();
      console.log("Landmark created successfully:", response);
      alert("Landmark created successfully!");
      refreshList("refresh");
      onClose();
    } catch (error) {
      console.error("Error creating landmark:", error);
      alert("Something went wrong. Please try again.");
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
        Landmark Creation Form
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
            required
            error={!!errors.name}
            helperText={errors.name?.message}
            {...field}
          />
        )}
      />

      {/* Boundary Field */}
      <Controller
        name="boundary"
        control={control}
        render={({ field }) => (
          <TextField
            label="Boundary"
            variant="outlined"
            required
            fullWidth
            InputProps={{ readOnly: true }}
            error={!!errors.boundary}
            helperText={errors.boundary?.message}
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

      {/* Importance Field */}
      <Controller
        name="importance"
        control={control}
        render={({ field }) => (
          <TextField margin="normal" fullWidth select label="Importance" {...field} error={!!errors.importance} size="small">
            {importanceOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Button type="submit" variant="contained" color="success" fullWidth>
        Add Landmark
      </Button>
    </Box>
  );
};

export default LandmarkAddForm;