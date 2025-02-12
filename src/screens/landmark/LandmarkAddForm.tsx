import React, { useState, useEffect } from "react";
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent } from "@mui/material";
import { useLocation } from "react-router-dom"; // Import useLocation

type LandmarkFormValues = {
  name: string;
  boundary: string;
  status: string;
  importance: string;
  onClose: () => void;
};


const LandmarkAddForm: React.FC<LandmarkFormValues> = ({ boundary, onClose }) =>  {
  const location = useLocation();
  const Mapboundary = location.state?.boundary || ""; 

  const [formValues, setFormValues] = useState({
    name: "",
    boundary: Mapboundary, 
    status: "Verifying",
    importance: "low",
  });
  
  useEffect(() => {
    setFormValues((prev) => ({ ...prev, boundary }));
  }, [boundary]);

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
    alert("Landmark added successfully!");
    onClose();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5, width: 500, margin: "auto", mt: 10, p: 2, border: "1px solid #ccc", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
      <Typography variant="h6" align="center" gutterBottom>
        Landmark Creation Form
      </Typography>

      <TextField label="Name" name="name" value={formValues.name} onChange={handleChange} variant="outlined" size="small" required />

      <TextField label="Boundary" name="boundary" value={formValues.boundary} variant="outlined" required fullWidth InputProps={{ readOnly: true }} />

      <FormControl size="small" required fullWidth>
        <InputLabel>Status</InputLabel>
        <Select name="status" value={formValues.status} onChange={handleSelectChange} label="Status">
          <MenuItem value="Verifying">Verifying</MenuItem>
          <MenuItem value="Verified">Verified</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" required>
        <InputLabel>Importance</InputLabel>
        <Select name="importance" value={formValues.importance} onChange={handleSelectChange} label="Importance">
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>
      </FormControl>

      <Button type="submit" variant="contained" color="success" fullWidth>
        Add Landmark
      </Button>
    </Box>
  );
};

export default LandmarkAddForm;
