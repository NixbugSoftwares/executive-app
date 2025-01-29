import React, { useState } from "react";
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../common/sidebar";
import MapComponent from "./MapComponent"; 

type LandmarkFormValues = {
  name: string;
  boundary: string;
  status: string;
  importance: string;
};

const LandmarkAddForm = () => {
  const [formValues, setFormValues] = useState<LandmarkFormValues>({
    name: "",
    boundary: "",
    status: "Verifying",
    importance: "low",
  });

  const [openMapModal, setOpenMapModal] = useState(false);

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

  const handleBoundaryClick = () => {
    setOpenMapModal(true); 
  };

  const handleDrawEnd = (coordinates: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      boundary: coordinates,
    }));
    setOpenMapModal(false); 
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted:", formValues);
    alert("Landmark added successfully!");
  };

  const navigate = useNavigate();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        width: 500,
        margin: "auto",
        mt: 10,
        p: 2,
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <Sidebar />
      <Typography variant="h6" align="center" gutterBottom>
        Landmark Creation Form
      </Typography>

      <TextField 
        label="Name" 
        name="name" 
        value={formValues.name} 
        onChange={handleChange} 
        variant="outlined" 
        size="small" 
        required 
      />

      <TextField
        label="Boundary"
        name="boundary"
        value={formValues.boundary}
        onClick={handleBoundaryClick} 
        variant="outlined"
        size="small"
        required
        InputProps={{
          readOnly: true, 
        }}
      />

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

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, gap: 1 }}>
        <Button type="submit" variant="contained" sx={{ bgcolor: "darkblue" }} fullWidth onClick={() => navigate("/landmark")}>
          Landmark List
        </Button>
        <Button type="submit" variant="contained" color="success" fullWidth>
          Add Landmark
        </Button>
      </Box>

      <Dialog open={openMapModal} onClose={() => setOpenMapModal(false)} fullWidth maxWidth="md">
        <DialogTitle>Select Boundary</DialogTitle>
        <DialogContent>
          <MapComponent onDrawEnd={handleDrawEnd} isOpen={openMapModal} /> 
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMapModal(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandmarkAddForm;
