import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { accountFormSchema } from "../auth/validations/authValidation";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Typography,
  Container,
  CssBaseline,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch } from "../../store/Hooks";
import {
  accountCreationApi,
  roleListApi,
  roleAssignApi,
} from "../../slices/appSlice";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/toastMessageHelper";
// Account creation form interface
interface IAccountFormInputs {
  username: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: number;
  designation?: string;
  role: number;
  roleAssignmentId?: number;
}

interface IAccountCreationFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
}

// Gender options mapping
const genderOptions = [
  { label: "Female", value: 1 },
  { label: "Male", value: 2 },
  { label: "Transgender", value: 3 },
  { label: "Other", value: 4 },
];

const AccountCreationForm: React.FC<IAccountCreationFormProps> = ({
  onClose,
  refreshList,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IAccountFormInputs>({
    resolver: yupResolver(accountFormSchema),
    defaultValues: {
      gender: 4,
    },
  });

  // Fetch roles
  useEffect(() => {
    dispatch(roleListApi())
      .unwrap()
      .then((res: any[]) => {
        setRoles(res.map((role) => ({ id: role.id, name: role.name })));
      })

      .catch((err: any) => {
        showErrorToast(err);
      });
  }, [dispatch]);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle Account Creation & Role Assignment
  const handleAccountCreation: SubmitHandler<IAccountFormInputs> = async (
    data
  ) => {
    try {
      setLoading(true);

      // Prepare form data for account creation
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);
      formData.append("gender", data.gender?.toString() || "");

      if (data.fullName) {
        formData.append("full_name", data.fullName);
      }
      if (data.phoneNumber) {
        formData.append("phone_number", `+91${data.phoneNumber}`);
      }
      if (data.email) {
        formData.append("email_id", data.email);
      }
      if (data.designation) {
        formData.append("designation", data.designation);
      }

      //  Create account
      const accountResponse = await dispatch(
        accountCreationApi(formData)
      ).unwrap();
      if (accountResponse?.id) {
        // Assign role to the created account
        const roleResponse = await dispatch(
          roleAssignApi({
            executive_id: accountResponse.id,
            role_id: data.role,
          })
        ).unwrap();

        if (roleResponse?.id && roleResponse?.role_id) {
          showSuccessToast("Account and role assigned successfully!");
          refreshList("refresh");
          onClose();
        } else {
          throw new Error("Account created, but role assignment failed!");
        }
      } else {
        throw new Error("Account creation failed!");
      }
    } catch (error: any) {
      throw error;
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
                    {showPassword ? <Visibility /> : <VisibilityOff />}
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

          <Controller
            name="role"
            control={control}
            rules={{ required: "Role is required" }}
            render={({ field }) => (
              <TextField
                margin="normal"
                required
                fullWidth
                select
                label="Role"
                {...field}
                error={!!errors.role}
                helperText={errors.role?.message}
                size="small"
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Designation"
            {...register("designation")}
            error={!!errors.designation}
            helperText={errors.designation?.message}
            size="small"
          />

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
