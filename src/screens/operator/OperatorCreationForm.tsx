import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, TextField, InputAdornment, IconButton, Button, Typography, Container, CssBaseline, CircularProgress, MenuItem } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch } from "../../store/Hooks";
import { operatorCreationApi, companyListApi } from "../../slices/appSlice";

// Account creation form interface
interface IAccountFormInputs {
  username: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: number;
  companyId: number; 
}

interface IOperatorCreationFormProps {
  onClose: () => void;
  refreshList: (value:any)=>void
}

// Gender options mapping
const genderOptions = [
  { label: "Female", value: 1 },
  { label: "Male", value: 2 },
  { label: "Transgender", value: 3 },
  { label: "Other", value: 4 },
];



const OperatorCreationForm: React.FC<IOperatorCreationFormProps> = ({ onClose, refreshList}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IAccountFormInputs>({
    defaultValues: {
      gender: 4, 
    },
  });

  // Fetch companies on mount
  useEffect(() => {
    dispatch(companyListApi())
      .unwrap()
      .then((res: any[]) => {
        setCompanies(res.map((company) => ({ id: company.id, name: company.name })));
        console.log("company list>>>>>>>>>>>>>>>>>>>:", res);
      })
      
      
      .catch((err: any) => {
        console.error("Error fetching company:", err);
      });
  }, [dispatch]);

  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle Account Creation & Role Assignment 
  const handleAccountCreation: SubmitHandler<IAccountFormInputs> = async (data) => {
    console.log("Form data:", data); // Debugging line
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("company_id", data.companyId.toString());
      formData.append("username", data.username);
      formData.append("password", data.password);
      formData.append("gender", data.gender?.toString() || "");
  
      if (data.fullName) formData.append("full_name", data.fullName);
      if (data.phoneNumber) formData.append("phone_number", `+91${data.phoneNumber}`);
      if (data.email) formData.append("email_id", data.email);
      console.log("Dispatching operatorCreationApi with form data:", formData);
      const response = await dispatch(operatorCreationApi(formData)).unwrap();
      console.log("operator created>>>>>>>>>>>>>>>>>>>>:", response);
      alert("operator created successfully!");
      refreshList('refresh');
      onClose();
    } catch (error) {
      console.error("Error creating operator:", error);
      alert("Failed to create operator. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Account Creation
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit(handleAccountCreation)}>

          <Controller
            name="companyId"
            control={control}
            rules={{ required: "Role is required" }}
            render={({ field }) => (
              <TextField
                margin="normal"
                required
                fullWidth
                select
                label="company name"
                {...field}
                error={!!errors.companyId}
                helperText={errors.companyId?.message}
                size="small"
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            autoFocus
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            size="small"
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Full Name"
            {...register("fullName")}
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            size="small"
          />
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <TextField
                margin="normal"
                fullWidth
                label="Phone Number"
                placeholder="+911234567890"
                size="small"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                value={field.value ? `+91${field.value}` : ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/^\+91/, ""); // Remove +91 if manually entered
                  value = value.replace(/\D/g, ""); // Ensure only digits
                  if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
                  field.onChange(value || undefined); // Remove if empty
                }}
                onFocus={() => {
                  if (!field.value) field.onChange(""); // Ensure empty field is editable
                }}
                onBlur={() => {
                  if (field.value === "") field.onChange(undefined); // Remove field if empty
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

          {/* Gender Selection */}
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <TextField margin="normal" fullWidth select label="Gender" {...field} error={!!errors.gender} size="small">
                {genderOptions.map((option) => (
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
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Create Account"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OperatorCreationForm;
