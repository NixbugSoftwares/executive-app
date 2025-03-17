import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { busCreationSchema } from "../auth/validations/authValidation";
import { Box, TextField, Button, Typography, Container, CssBaseline, CircularProgress, Autocomplete } from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { busCreationApi, companyListApi } from "../../slices/appSlice";

interface IAccountFormInputs {
  companyId: number;
  registrationNumber: string;
  name: string;
  capacity: number;
  model: string;
  manufactured_on: string;
  insurance_upto?: string | null;
  pollution_upto?: string | null;
  fitness_upto?: string | null;
}

interface IOperatorCreationFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
}

const BusCreationForm: React.FC<IOperatorCreationFormProps> = ({ onClose, refreshList }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<{ id: number; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IAccountFormInputs>({
    resolver: yupResolver(busCreationSchema),
  });

  useEffect(() => {
    dispatch(companyListApi())
      .unwrap()
      .then((res: any[]) => {
        const companyList = res.map((company) => ({ id: company.id, name: company.name }));
        setCompanies(companyList);
        setFilteredCompanies(companyList);
      })
      .catch((err: any) => {
        console.error("Error fetching company:", err);
      });
  }, [dispatch]);

  const handleAccountCreation: SubmitHandler<IAccountFormInputs> = async (data) => {
    try {
      setLoading(true);
  
      // Format date-time fields to ISO 8601 with UTC time
      const formatDateToUTC = (dateString: string | null): string | null => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString(); // Converts to ISO 8601 with UTC time
      };
  
      const formData = new FormData();
      formData.append("company_id", data.companyId.toString());
      formData.append("registration_number", data.registrationNumber);
      formData.append("name", data.name);
      formData.append("capacity", data.capacity.toString());
      formData.append("model", data.model);
      formData.append("manufactured_on", formatDateToUTC(data.manufactured_on) || "");
      if (data.insurance_upto) formData.append("insurance_upto", formatDateToUTC(data.insurance_upto) || "");
      if (data.pollution_upto) formData.append("pollution_upto", formatDateToUTC(data.pollution_upto) || "");
      if (data.fitness_upto) formData.append("fitness_upto", formatDateToUTC(data.fitness_upto) || "");
  
      console.log("FormData being sent:", {
        company_id: data.companyId,
        registration_number: data.registrationNumber,
        name: data.name,
        capacity: data.capacity,
        model: data.model,
        manufactured_on: formatDateToUTC(data.manufactured_on),
        insurance_upto: formatDateToUTC(data.insurance_upto??null),
        pollution_upto: formatDateToUTC(data.pollution_upto??null),
        fitness_upto: formatDateToUTC(data.fitness_upto??null),
      });
  
      const response = await dispatch(busCreationApi(formData)).unwrap();
      if (response?.id) {
        alert("Bus created successfully!");
        refreshList("refresh");
        onClose();
      } else {
        alert("Bus creation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during Bus creation:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySearch = (_event: React.ChangeEvent<{}>, value: string) => {
    const filtered = companies.filter((company) =>
      company.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Bus Creation
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit(handleAccountCreation)}>
          <Controller
            name="companyId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={filteredCompanies}
                getOptionLabel={(option) => option.name}
                onChange={(_event, value) => field.onChange(value ? value.id : null)}
                onInputChange={handleCompanySearch}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    required
                    fullWidth
                    label="Company Name"
                    error={!!errors.companyId}
                    helperText={errors.companyId?.message}
                    size="small"
                  />
                )}
              />
            )}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Registration Number"
            {...register("registrationNumber")}
            error={!!errors.registrationNumber}
            helperText={errors.registrationNumber?.message}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Bus Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Capacity"
            type="number"
            {...register("capacity")}
            error={!!errors.capacity}
            helperText={errors.capacity?.message}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Model"
            {...register("model")}
            error={!!errors.model}
            helperText={errors.model?.message}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Manufactured On"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("manufactured_on")}
            error={!!errors.manufactured_on}
            helperText={errors.manufactured_on?.message}
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Insurance Upto"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("insurance_upto")}
            error={!!errors.insurance_upto}
            helperText={errors.insurance_upto?.message}
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Pollution Upto"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("pollution_upto")}
            error={!!errors.pollution_upto}
            helperText={errors.pollution_upto?.message}
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Fitness Upto"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("fitness_upto")}
            error={!!errors.fitness_upto}
            helperText={errors.fitness_upto?.message}
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
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Create Bus"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BusCreationForm;