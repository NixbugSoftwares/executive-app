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
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { companyCreationApi } from "../../slices/appSlice";
import MapModal from "./MapModal";
import { yupResolver } from "@hookform/resolvers/yup";
import { companyCreationSchema } from "../auth/validations/authValidation";
import {  showSuccessToast, showErrorToast } from "../../common/toastMessageHelper";

interface ICompanyFormInputs {
  name: string;
  address: string;
  location: string;
  owner_name: string;
  phone_number: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

interface ICompanyCreationFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
}

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
  });

  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setValue("location", location.name);
    setValue("latitude", location.lat);
    setValue("longitude", location.lng);
  };

  const handleAccountCreation: SubmitHandler<ICompanyFormInputs> = async (data) => {
    try {
      setLoading(true);
  
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("address", data.address);
      formData.append("location", `POINT (${data.longitude} ${data.latitude})`);
      formData.append("owner_name", data.owner_name);
      formData.append("phone_number", `+91${data.phone_number}`);
      
      if (data.email) {
        formData.append("email_id", data.email);
      }
      const response = await dispatch(companyCreationApi(formData)).unwrap();
      console.log("Company creation response:", response);
      if (response?.id) {
        showSuccessToast("Company created successfully!");
        refreshList("refresh");
        onClose();
      } else {
        showErrorToast("Company creation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during company creation:", error);
      showErrorToast("Something went wrong. Please try again.");
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
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Location"
            {...register("location")}
            error={!!errors.location}
            helperText={errors.location?.message}
            size="small"
            onClick={() => setMapModalOpen(true)}
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
                value={field.value ? `+91${field.value}` : ""}
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
            label="Email"
            placeholder="example@gmail.com"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            size="small"
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
              "Create Account"
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