import React, { useState } from "react";
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../common/sidebar";


type AccountFormValues = {
  username: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  gender: string;
  designation: string;
}
const AccountCreationForm = () => {
  const [formValues, setFormValues] = useState<AccountFormValues>({
    username: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    gender: "",
    designation: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name!]: value,
    }));
  };
  

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name!]: value,
    }));
  };
 
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted:", formValues);
    alert("Account created successfully!");
  };



  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/account");
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5, // Reduce gap between fields
        width: 500, // Narrower form
        margin: "auto",
        mt: 10,
        p: 2,
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <Sidebar/>
      <Typography variant="h6" align="center" gutterBottom>
        Account Creation Form
      </Typography>

      <TextField
        label="Username"
        name="username"
        value={formValues.username}
        onChange={handleChange}
        variant="outlined"
        size="small" // Smaller input size
        required
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        value={formValues.password}
        onChange={handleChange}
        variant="outlined"
        size="small"
        required
      />

      <TextField
        label="Full Name"
        name="fullName"
        value={formValues.fullName}
        onChange={handleChange}
        variant="outlined"
        size="small"
        required
      />

      <TextField
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        value={formValues.phoneNumber}
        onChange={handleChange}
        variant="outlined"
        size="small"
        required
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={formValues.email}
        onChange={handleChange}
        variant="outlined"
        size="small"
        required
      />

      <FormControl size="small" required>
        <InputLabel>Gender</InputLabel>
        <Select
          name="gender"
          value={formValues.gender}
          onChange={handleSelectChange}
          label="Gender"
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Designation"
        name="designation"
        value={formValues.designation}
        onChange={handleChange}
        variant="outlined"
        size="small"
        required
      />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, gap: 1 }}>
              <Button type="submit" variant="contained" sx={{bgcolor:"darkblue"}} fullWidth onClick={() => {handleNavigate()}}>
                Account List
            </Button>
            <Button type="submit" variant="contained" color="success" fullWidth>
                Create Account
            </Button>

        </Box>
      
    </Box>
  );
};

export default AccountCreationForm;
