import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "./validations/authValidation";
import { Box, TextField, Button, Typography, Container, CssBaseline, Avatar, CircularProgress } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/Hooks";
import { LoginApi, selectAuth } from "../../slices/authSlice";
import { User } from "../../types/type";

// Login form interface
interface ILoginFormInputs {
  username: string;
  password: string;
}

// Login component
const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector(selectAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const handleLogin: SubmitHandler<ILoginFormInputs> = async (data) => {
    try {
      console.log("Form Data:", data);
  
      // FormData for multipart request
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);
  
      // Dispatch API call
      const response = await dispatch(LoginApi(formData)).unwrap();
  
      console.log("Login Response:", response);
  
      if (response?.access_token) {
        const expiresAt = Date.now() + response.expires_in * 1000; 
  
        localStorage.setItem("@token", response.access_token);
        localStorage.setItem("@token_expires", expiresAt.toString());

        const user: User = {
          executive_id: response.executive_id,
          access_token: response.access_token,
          token_type: response.token_type,
          created_on: response.created_on,
          expires_in: response.expires_in,
          client_id: response.client_id
        };

        localStorage.setItem("@user", JSON.stringify(user));
        
        navigate("/home");
      } else {
        console.error("Login failed", response);
      }
    } catch (error) {
      console.error("Login Error:", error);
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
        <Avatar sx={{ m: 1, bgcolor: "darkblue" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit(handleLogin)}>
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
            type="password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
          />
          {error && (
            <Typography color="error" variant="body2">
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
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Sign In"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
