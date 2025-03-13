import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  CircularProgress,
  MenuItem
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { companyUpdationApi, companyListApi } from "../../slices/appSlice";
import MapModal from "./MapModal";

interface ICompanyFormInputs {
  name: string;
  address: string;
  location: string;
  owner_name: string;
  phone_number: string;
  email?: string;
  status?: number;
  latitude?: number;
  longitude?: number;
}

interface ICompanyUpdateFormProps {
  companyId: number;
  onClose: () => void;
  refreshList: (value: any) => void;
}

const statusOptions = [
    { label: "Active", value: 1 },
    { label: "suspended", value: 2 },
  ];

const CompanyUpdateForm: React.FC<ICompanyUpdateFormProps> = ({
  companyId,
  onClose,
  refreshList,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<ICompanyFormInputs | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ICompanyFormInputs>();

  // Fetch company data
  useEffect(() => {
    dispatch(companyListApi())
      .unwrap()
      .then(async (res: any[]) => {
        const company = res.find((company) => company.id === companyId);
        if (company) {
          setCompanyData({
            name: company.name,
            address: company.address,
            location: company.location,
            owner_name: company.owner_name,
            phone_number: company.phone_number
              ? company.phone_number.replace(/\D/g, "").replace(/^91/, "")
              : "",
            email: company.email_id,
            status: company.status,
          });

          reset({
            name: company.name,
            address: company.address,
            location: company.location,
            owner_name: company.owner_name,
            phone_number: company.phone_number
              ? company.phone_number.replace(/\D/g, "").replace(/^91/, "")
              : "",
            email: company.email_id,
            status: company.status,
          });
        }
      })
      .catch((err: any) => {
        console.error("Error fetching company data:", err);
      });
  }, [companyId, dispatch, reset]);

  // Handle location selection from MapModal
  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setValue("location", location.name);
    setValue("latitude", location.lat);
    setValue("longitude", location.lng);
  };

  // Handle Account Update
  const handleAccountUpdate: SubmitHandler<ICompanyFormInputs> = async (data) => {
    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("id", companyId.toString());
      if (data.name) formData.append("name", data.name);
      if (data.address) formData.append("address", data.address);
      if (data.location) formData.append("location", `POINT (${data.longitude} ${data.latitude})`);
      if (data.owner_name) formData.append("owner_name", data.owner_name);
      if (data.phone_number) formData.append("phone_number", `+91${data.phone_number}`);
      if (data.email) formData.append("email_id", data.email);
      if (data.status) formData.append("status", data.status.toString());

      console.log("Form Data:", formData);

      const updateResponse = await dispatch(companyUpdationApi({ companyId, formData })).unwrap();
      console.log("Company updated:", updateResponse);
      alert("Company updated successfully!");
      refreshList("refresh");
      onClose();
    } catch (error) {
      console.error("Error updating company:", error);
      alert("Failed to update company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!companyData) {
    return <CircularProgress />;
  }

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
          Update Company
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(handleAccountUpdate)}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
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
              "Update Company"
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

export default CompanyUpdateForm;