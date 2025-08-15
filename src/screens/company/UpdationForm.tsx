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
  MenuItem,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { companyUpdationApi, companyListApi } from "../../slices/appSlice";
import MapModal from "./MapModal";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";
interface ICompanyFormInputs {
  name: string;
  address: string;
  location: string;
  contact_person: string;
  phone_number: string;
  email?: string;
  status?: number;
  latitude?: number;
  longitude?: number;
  company_type?: number;
}

interface ICompanyUpdateFormProps {
  companyId: number;
  onClose: () => void;
  refreshList: (value: any) => void;
  handleCloseDetailCard: () => void;
}

const statusOptions = [
  { label: "Validating", value: 1 },
  { label: "Verified", value: 2 },
  { label: "Suspended", value: 3 },
];

const typeOptions = [
  { label: "Other", value: 1 },
  { label: "Private", value: 2 },
  { label: "Government", value: 3 },
];

const CompanyUpdateForm: React.FC<ICompanyUpdateFormProps> = ({
  companyId,
  onClose,
  refreshList,
  handleCloseDetailCard,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<ICompanyFormInputs | null>(
    null
  );
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [locationName, setLocationName] = useState<string>("");
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
    dispatch(companyListApi({ limit: 1, offset: 0, id: companyId }))
      .unwrap()
      .then(async (res: { data: any[] }) => {
        const items = res.data;
        const company = items.find((company) => company.id === companyId);
        if (company) {
          const locationRegex = /POINT\s*\(\s*([\d.-]+)\s+([\d.-]+)\s*\)/;
          const match = company.location.match(locationRegex);
          const latitude = match ? parseFloat(match[2]) : undefined;
          const longitude = match ? parseFloat(match[1]) : undefined;
          setLocationName(company.location);

          setCompanyData({
            name: company.name,
            address: company.address,
            location: company.location,
            contact_person: company.contact_person,
            phone_number: company.phone_number
              ? company.phone_number.replace(/\D/g, "").replace(/^91/, "")
              : "",
            email: company.email_id,
            status: company.status,
            latitude,
            longitude,
            company_type: company.type,
          });

          reset({
            name: company.name,
            address: company.address,
            location: company.location,
            contact_person: company.contact_person,
            phone_number: company.phone_number
              ? company.phone_number.replace(/\D/g, "").replace(/^91/, "")
              : "",
            email: company.email_id,
            status: company.status,
            latitude,
            longitude,
            company_type: company.type,
          });
        }
      })
      .catch((error: any) => {
        showErrorToast(
          error.message || "Failed to fetch company data. Please try again."
        );
      });
  }, [companyId, dispatch, reset]);

  // Handle location selection from MapModal
  const handleLocationSelect = (location: {
    // name: string;
    lat: number;
    lng: number;
  }) => {
    setValue("location", `POINT (${location.lng} ${location.lat})`);
    setValue("latitude", location.lat);
    setValue("longitude", location.lng);
    // setLocationName(location.name);
  };

  // Handle Account Update
  const handleAccountUpdate: SubmitHandler<ICompanyFormInputs> = async (
    data
  ) => {
    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("id", companyId.toString());
      if (data.name) formData.append("name", data.name);
      if (data.address) formData.append("address", data.address);
      if (data.latitude && data.longitude) {
        formData.append(
          "location",
          `POINT (${data.longitude} ${data.latitude})`
        );
      }
      if (data.contact_person)
        formData.append("contact_person", data.contact_person);
      if (data.phone_number)
        formData.append("phone_number", `+91${data.phone_number}`);
      if (data.email) formData.append("email_id", data.email);
      if (data.status) formData.append("status", data.status.toString());
      if (data.company_type)
        formData.append("type", data.company_type.toString());

      await dispatch(companyUpdationApi({ companyId, formData })).unwrap();

      showSuccessToast("Company updated successfully!");
      refreshList("refresh");
      handleCloseDetailCard();
      onClose();
    } catch (error: any) {
      showErrorToast(error.message || "Error updating company:");
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
          {/* Form Fields */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            {...register("name", {
              required: "Name is required",

              maxLength: {
                value: 32,
                message: "Name cannot exceed 32 characters",
              },
              validate: {
                noLeadingSpace: (value) =>
                  value.trimStart() === value || "No spaces at beginning",
                noTrailingSpace: (value) =>
                  value.trimEnd() === value || "No spaces at end",
                noConsecutiveSpaces: (value) =>
                  !value.includes("  ") || "No consecutive spaces allowed",
                notEmpty: (value) =>
                  value.trim().length > 0 || "Cannot be just spaces",
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
            size="small"
            onChange={(e) => {
              // Prevent consecutive spaces while typing
              let value = e.target.value.replace(/\s{2,}/g, " ");
              // Prevent leading space
              if (value.startsWith(" ")) value = value.trimStart();
              e.target.value = value;
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Address"
            {...register("address", {
              required: "Address is required",
              minLength: {
                value: 3,
                message: "Address must be at least 3 characters",
              },
              maxLength: {
                value: 512,
                message: "Address cannot exceed 512 characters",
              },
              validate: {
                noLeadingSpace: (value) =>
                  value.trimStart() === value || "No spaces at beginning",
                noTrailingSpace: (value) =>
                  value.trimEnd() === value || "No spaces at end",
                noConsecutiveSpaces: (value) =>
                  !value.includes("  ") || "No consecutive spaces allowed",
                notEmpty: (value) =>
                  value.trim().length > 0 || "Cannot be just spaces",
              },
            })}
            error={!!errors.address}
            helperText={errors.address?.message}
            size="small"
            onChange={(e) => {
              let value = e.target.value.replace(/\s{2,}/g, " ");
              if (value.startsWith(" ")) value = value.trimStart();
              e.target.value = value;
            }}
            multiline
            rows={4}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Location"
            value={locationName}
            error={!!errors.location}
            helperText={errors.location?.message}
            size="small"
            onClick={() => setMapModalOpen(true)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Contact person"
            {...register("contact_person", {
              required: "Contact person is required",
              minLength: {
                value: 4,
                message: "Contact person must be at least 4 characters",
              },
              maxLength: {
                value: 64,
                message: "Contact person cannot exceed 32 characters",
              },
              validate: {
                noLeadingSpace: (value) =>
                  value.trimStart() === value || "No spaces at beginning",
                noTrailingSpace: (value) =>
                  value.trimEnd() === value || "No spaces at end",
                noConsecutiveSpaces: (value) =>
                  !value.includes("  ") || "No consecutive spaces allowed",
                notEmpty: (value) =>
                  value.trim().length > 0 || "Cannot be just spaces",
              },
            })}
            error={!!errors.contact_person}
            helperText={errors.contact_person?.message}
            size="small"
            onChange={(e) => {
              let value = e.target.value.replace(/\s{2,}/g, " ");
              if (value.startsWith(" ")) value = value.trimStart();
              e.target.value = value;
            }}
          />
          <Controller
            name="phone_number"
            control={control}
            render={({ field }) => (
              <TextField
                margin="normal"
                fullWidth
                label="Phone Number"
                placeholder="eg:+911234567890"
                size="small"
                error={!!errors.phone_number}
                helperText={errors.phone_number?.message}
                value={field.value ? `+91${field.value}` : ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.startsWith("91")) value = value.slice(2);
                  if (value.length > 10) value = value.slice(0, 10);
                  field.onChange(value || "");
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
        initialCoordinates={
          companyData.latitude && companyData.longitude
            ? { lat: companyData.latitude, lng: companyData.longitude }
            : undefined
        }
      />
    </Container>
  );
};

export default CompanyUpdateForm;
