
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "./validations/authValidation";
import { Box, TextField, Button, Typography, Container, CssBaseline, Avatar } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import commonApi from "../../utils/commonApi";
import { useAppDispatch } from "../../store/Hooks";
import { Loginapi } from "../../slices/authSlice";


// ************************************************************** login form interface ********************************************
interface ILoginFormInputs {
  username: string;
  password: string;
}



// ************************************************************** login form component ********************************************
const LoginPage: React.FC = () => {

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginFormInputs>({
    resolver: yupResolver(loginSchema), 
  });
  const handleLogin: SubmitHandler<ILoginFormInputs> = async (data) => {
    try {
      console.log("Form Data:", data);
  
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);
  
      const response = await dispatch(Loginapi({
        
       
      }))
  
      console.log("response====>", response);
  
      if (response?.access_token) {
        localStorage.setItem("access_token", response.access_token);
        navigate("/home");
      } else {
        console.error(response.payload);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message); // Safely access the message property
      } else {
        console.error("An unexpected error occurred:", error);
      }
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
            type="password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: "darkblue" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
