import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "./validations/authValidation";
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
import { useAppDispatch, useAppSelector } from "../../store/Hooks";
import { LoginApi, selectAuth } from "../../slices/authSlice";
import { User } from "../../types/type";
import {
  userLoggedIn,
  fetchRoleMappingApi,
  roleListApi,
} from "../../slices/appSlice";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";
// Login form interface
interface ILoginFormInputs {
  username: string;
  password: string;
}

// Login component
const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin: SubmitHandler<ILoginFormInputs> = async (data) => {
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);
      const response = await dispatch(LoginApi(formData)).unwrap();
      if (response?.access_token) {
        const expiresAt = Date.now() + response.expires_in * 1000;
        localStorage.setItem("@token", response.access_token);
        localStorage.setItem("@token_expires", expiresAt.toString());
        const user: User = {
          executive_id: response.executive_id,
        };
        if (response.executive_id) {
          showSuccessToast("User signed in successfully!");
        }
        localStorage.setItem("@user", JSON.stringify(user));
        dispatch(userLoggedIn(user));

        // Fetch Role Mapping API
        const roleResponse = await dispatch(
          fetchRoleMappingApi(response.executive_id)
        ).unwrap();
        const assignedRole: any = {
          id: roleResponse?.id,
          userId: roleResponse?.executive_id,
          roleId: roleResponse?.role_id,
        };
        // Store role_id in localStorage
        localStorage.setItem("@assignedRole", JSON.stringify(assignedRole));
        const roleListingResponse = await dispatch(roleListApi()).unwrap();
        const userRoleDetails = roleListingResponse.find(
          (role: { id: any }) => role.id === assignedRole.roleId
        );
        if (userRoleDetails) {
          localStorage.setItem("@roleDetails", JSON.stringify(userRoleDetails));
        } else {
          showErrorToast("Role not found for the given roleId");
        }
      }
    } catch (error: any) {
      showErrorToast(error.message);
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
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
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
