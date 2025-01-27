import React, { useState } from "react";
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";

const AccountCreationForm = () => {
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
    gender: "",
    fullName: "",
    designation: "",
    phoneNumber: "",
    email: "",
    status: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
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

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: 700,
        margin: "auto",
        mt: 5,
        p: 2,
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h5" align="center">
        Account Creation Form
      </Typography>

      <TextField
        label="Username"
        name="username"
        value={formValues.username}
        onChange={handleChange}
        variant="outlined"
        required
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        value={formValues.password}
        onChange={handleChange}
        variant="outlined"
        required
      />

      <FormControl>
        <InputLabel>Gender</InputLabel>
        <Select
          name="gender"
          value={formValues.gender}
        //   onChange={handleChange}
          required
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Full Name"
        name="fullName"
        value={formValues.fullName}
        onChange={handleChange}
        variant="outlined"
        required
      />

      <TextField
        label="Designation"
        name="designation"
        value={formValues.designation}
        onChange={handleChange}
        variant="outlined"
        required
      />

      <TextField
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        value={formValues.phoneNumber}
        onChange={handleChange}
        variant="outlined"
        required
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={formValues.email}
        onChange={handleChange}
        variant="outlined"
        required
      />

      <FormControl>
        <InputLabel>Status</InputLabel>
        <Select
          name="status"
          value={formValues.status}
        //   onChange={handleChange}
          required
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>

      <Button type="submit" variant="contained" color="primary" fullWidth>
        Create Account
      </Button>
    </Box>
  );
};

export default AccountCreationForm;
