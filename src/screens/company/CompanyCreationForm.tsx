import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { companyCreationApi } from "../../slices/appSlice";
import MapModal from "./MapModal";
import { yupResolver } from "@hookform/resolvers/yup";
import { companyCreationSchema } from "../auth/validations/authValidation";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";

interface ICompanyFormInputs {
  name: string;
  address: string;
  location: string;
  owner_name: string;
  phone_number: string;
  email: string;
  latitude?: number;
  longitude?: number;
  company_type: string;
  status: string;
}

interface ICompanyCreationFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
}

const TypeOptions = [
  { label: "Other", value: 1 },
  { label: "Private", value: 2 },
  { label: "Government", value: 3 },
];
const statusOptions = [
  { label: "Validating", value: 1 },
  { label: "Verified", value: 2 },
  { label: "Suspended", value: 3 },
];

const CompanyCreationForm: React.FC<ICompanyCreationFormProps> = ({
  onClose,
  refreshList,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ICompanyFormInputs>({
    resolver: yupResolver(companyCreationSchema),
    defaultValues: {
      company_type: "1",
      status: "1",
    },
  });

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setValue("latitude", location.lat);
    setValue("longitude", location.lng);
    setValue("location", `POINT(${location.lng} ${location.lat})`);
  };

  const handleAccountCreation: SubmitHandler<ICompanyFormInputs> = async (
    data
  ) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("address", data.address);
      formData.append("location", `POINT(${data.longitude} ${data.latitude})`);
      formData.append("contact_person", data.owner_name);
      formData.append("phone_number", `+91${data.phone_number}`);
      if (data.email) {
        formData.append("email_id", data.email);
      }
      formData.append("type", data.company_type);
      formData.append("status", data.status);
      const response = await dispatch(companyCreationApi(formData)).unwrap();

      if (response?.id) {
        showSuccessToast("Company created successfully!");
        refreshList("refresh");
        onClose();
      } else {
        showErrorToast("Company creation failed. Please try again.");
      }
    } catch (error: any) {
      showErrorToast(error || "Error during company creation:");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Company Creation
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(handleAccountCreation)}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            autoFocus
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Address"
            {...register("address")}
            error={!!errors.address}
            helperText={errors.address?.message}
            size="small"
            multiline
            rows={4}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Location"
            placeholder="Click to select location"
            {...register("location")}
            error={!!errors.location}
            helperText={errors.location?.message}
            size="small"
            onClick={() => setMapModalOpen(true)}
            InputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Owner Name"
            {...register("owner_name")}
            error={!!errors.owner_name}
            helperText={errors.owner_name?.message}
            size="small"
          />
          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Phone Number"
                placeholder="+911234567890"
                size="small"
                error={!!errors.phone_number}
                helperText={errors.phone_number?.message}
                value={field.value ? `+91 ${field.value}` : ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/^\+91/, "");
                  value = value.replace(/\D/g, "");
                  if (value.length > 10) value = value.slice(0, 10);
                  field.onChange(value || undefined);
                }}
                onFocus={() => {
                  if (!field.value) field.onChange("");
                }}
                onBlur={() => {
                  if (field.value === "") field.onChange(undefined);
                }}
              />
            )}
          />
          <TextField
            margin="normal"
            fullWidth
            required
            label="Email"
            placeholder="example@gmail.com"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            size="small"
          />

          <Controller
            name="company_type"
            control={control}
            render={({ field }) => (
              <TextField
                margin="normal"
                fullWidth
                select
                label="type"
                {...field}
                error={!!errors.company_type}
                size="small"
              >
                {TypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                margin="normal"
                fullWidth
                select
                label="status"
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
            fullWidth
            color="primary"
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: "darkblue" }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Create Company"
            )}
          </Button>
        </Box>
      </Box>
      <MapModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onSelectLocation={handleLocationSelect}
      />
    </Container>
  );
};

export default CompanyCreationForm;
