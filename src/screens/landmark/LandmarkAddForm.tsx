import React, { useEffect } from "react";
import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useAppDispatch } from "../../store/Hooks";
import { landmarkCreationApi } from "../../slices/appSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { landMarkAddSchema } from "../auth/validations/authValidation";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";

interface ILandmarkFormInputs {
  name: string;
  boundary: string;
  type?: string;
}

interface ILandmarkCreationFormProps {
  boundary: string;
  onClose: () => void;
  refreshList: (value: string) => void;
  onLandmarkAdded?: () => void; 
}


const typeOptions = [
  { label: "LOCAL", value: 1 },
  { label: "VILLAGE", value: 2 },
  { label: "DISTRICT", value: 3 },
  { label: "STATE", value: 4 },
  { label: "NATIONAL", value: 5 },
];
const LandmarkAddForm: React.FC<ILandmarkCreationFormProps> = ({
  boundary,
  onClose,
  refreshList,
  onLandmarkAdded,
}) => {
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ILandmarkFormInputs>({
    resolver: yupResolver(landMarkAddSchema),
    defaultValues: {
      name: "",
      boundary: boundary,
      type: "1",
    },
  });

  useEffect(() => {
    setValue("boundary", `POLYGON((${boundary}))`);
  }, [boundary, setValue]);

  const handleLandmarkCreation: SubmitHandler<ILandmarkFormInputs> = async (
    data
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("boundary", data.boundary);
      if (data.type) formData.append("type", data.type);

      await dispatch(landmarkCreationApi(formData)).unwrap();
      showSuccessToast("Landmark created successfully!");
      refreshList("refresh");
      if (onLandmarkAdded) {
        onLandmarkAdded();
      }
      onClose();
    } catch(error:any) {
      showErrorToast(error||"Something went wrong. Please try again.");
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
            required
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

      
      <Button type="submit" variant="contained" color="success" fullWidth>
        Add Landmark
      </Button>
    </Box>
  );
};

export default LandmarkAddForm;
