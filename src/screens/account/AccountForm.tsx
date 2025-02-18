import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { accountFormSchema } from "../auth/validations/authValidation";
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
import { accountCreationApi } from "../../slices/appSlice";


// Account creation form interface
interface IAccountFormInputs {
  username: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: number;
  designation?: string;

}

interface IAccountCreationFormProps {
  onSuccess: () => void;
}

// Gender options mapping
const genderOptions = [
  { label: "Female", value: 1 },
  { label: "Male", value: 2 },
  { label: "Transgender", value: 3 },
  { label: "Other", value: 4 },
];

const AccountCreationForm: React.FC<IAccountCreationFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue, // Add setValue to programmatically set values
  } = useForm<IAccountFormInputs>({
    resolver: yupResolver(accountFormSchema),
    defaultValues: {
      gender: 4, // Default gender value
    },
  });
  const handleAccountCreation: SubmitHandler<IAccountFormInputs> = async (data) => {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);
      formData.append("full_name", data.fullName || "");
      formData.append("phone_number", data.phoneNumber || "");
      formData.append("email_id", data.email || "");

      // Handle gender
      if (data.gender !== undefined && data.gender !== null) {
        formData.append("gender", data.gender.toString());
      } else {
        formData.append("gender", "");
      }

      formData.append("designation", data.designation || "");

      setLoading(true);
      const response = await dispatch(accountCreationApi(formData)).unwrap();
      console.log("Full response:", response);

      if (!('error' in response)) {
        alert("Account created successfully!");
        onSuccess(); 
        console.log("Account created successfully:", response);
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Account creation failed:", error);
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
          Account Creation
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit(handleAccountCreation)}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            autoComplete="username"
            autoFocus
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="password"
            label="Password"
            type="password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            id="fullName"
            label="Full Name"
            {...register("fullName")}
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            size="small"
          />
         <TextField
            margin="normal"
            fullWidth
            id="phoneNumber"
            label="Phone Number"
            {...register("phoneNumber")}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber?.message}
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email"
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
              <TextField
                margin="normal"
                fullWidth
                select
                label="Gender"
                {...field}
                error={!!errors.gender}
                size="small"
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            margin="normal"
            fullWidth
            id="designation"
            label="Designation"
            {...register("designation")}
            error={!!errors.designation}
            helperText={errors.designation?.message}
            size="small"
          />

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

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
    </Container>
  );
};

export default AccountCreationForm;
function closeModal(): any {
  throw new Error("Function not implemented.");
}

