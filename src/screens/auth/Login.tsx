import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  Avatar,
  CircularProgress,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch } from "../../store/Hooks";
import { LoginApi } from "../../slices/authSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "./validations/authValidation";
import {
  userLoggedIn,
  fetchRoleMappingApi,
  loggedinUserRoleDetails,
  setRoleDetails,
} from "../../slices/appSlice";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";
import localStorageHelper from "../../utils/localStorageHelper";
import { setPermissions } from "../../slices/appSlice";
interface ILoginFormInputs {
  username: string;
  password: string;
}
const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ILoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };
const handleLogin: SubmitHandler<ILoginFormInputs> = async (data) => {
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const response = await dispatch(LoginApi(formData)).unwrap();

    if (response?.access_token) {
      // Store basic user info
      const user = {
        username: data?.username,
        executive_id: response?.executive_id,
      };
      const access_token = response?.access_token;
      const expiresAt = Date.now() + response?.expires_in * 1000;

      // Store authentication data
      localStorageHelper.storeItem("@token", access_token);
      localStorageHelper.storeItem("@token_expires", expiresAt);
      localStorageHelper.storeItem("@user", user);
      dispatch(userLoggedIn(user));
      showSuccessToast("Login successful");

      // Fetch role mapping
      const roleResponse = await dispatch(
        fetchRoleMappingApi(response.executive_id)
      ).unwrap();

      if (!roleResponse || !roleResponse.role_id) {
        // Clear any existing permissions if no role found
        localStorage.removeItem("@permissions");
        localStorage.removeItem("@assignedRole");
        dispatch(setPermissions([]));
        dispatch(setRoleDetails(null));
        throw new Error("No role assigned to this user");
      }

      // Store assigned role
      const assignedRole = {
        id: roleResponse?.id,
        userId: roleResponse?.operator_id,
        roleId: roleResponse?.role_id,
      };
      localStorage.setItem("@assignedRole", JSON.stringify(assignedRole));

      // Fetch role details
      const roleListingResponse = await dispatch(
        loggedinUserRoleDetails(assignedRole.roleId)
      ).unwrap();

      console.log("Role details:", roleListingResponse[0]);

      if (!roleListingResponse || roleListingResponse.length === 0) {
        // Clear permissions if role details not found
        localStorage.removeItem("@permissions");
        dispatch(setPermissions([]));
        dispatch(setRoleDetails(null));
        throw new Error("Role details not found");
      }

      // Process role details
      const roleDetails = roleListingResponse[0];
      dispatch(setRoleDetails(roleDetails));

      // Extract permissions (only keys with true values)
      const permissions = Object.entries(roleDetails)
        .filter(([_, value]) => value === true)
        .map(([key]) => key);

      console.log("Permissions:", permissions);

      if (permissions.length > 0) {
        localStorage.setItem("@permissions", JSON.stringify(permissions));
        dispatch(setPermissions(permissions));
      } else {
        // No permissions found for this role
        localStorage.removeItem("@permissions");
        dispatch(setPermissions([]));
        // throw new Error("No permissions assigned for this role");
      }
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    // Clear sensitive data on error
    localStorage.removeItem("@permissions");
    localStorage.removeItem("@assignedRole");
    dispatch(setPermissions([]));
    dispatch(setRoleDetails(null));
    showErrorToast(error.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <Container component="main" maxWidth="xs" sx={{ mb: 10 }}>
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card sx={{ width: "100%", p: 3, boxShadow: 3 }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "darkblue" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign In
            </Typography>
            <Box
              component="form"
              noValidate
              sx={{ mt: 1 }}
              onSubmit={handleSubmit(handleLogin)}
            >
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
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, bgcolor: "darkblue" }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
