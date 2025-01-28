import React, { useState } from "react";
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent } from "@mui/material";
import { useNavigate } from "react-router-dom";



const RoleCreationForm: React.FC = () => {


    const [formValues, setFormValues] = useState({
        roleName: "",
        manageExecutive: "",
        manageRole: "",
        managelandmark: "",
        managecompany: "",
    })

    const handleTextFieldChange = (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        const { name, value } = event.target;
        setFormValues((prevValues) => ({
          ...prevValues,
          [name]: value,
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
        alert("Role created successfully!");
    };

    const navigate = useNavigate();
    const handleNavigate = () => {
        navigate("/exerole");
    }


    return (
        <Box
        component={"form"} 
        onSubmit={handleSubmit}
        sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            width:500,
            margin: "auto",
            mt: 10,
            p: 2,
            border:"0 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",


        }}

        >
            <Typography variant="h6" align="center" gutterBottom >
                Create Role
            </Typography>

            <TextField
            label="Role Name"
            name="roleName"
            value={formValues.roleName}
            onChange={handleTextFieldChange}
            variant="outlined"
            size="small"
            required
            >
            </TextField>

            <FormControl>
                <InputLabel>Manage Executive</InputLabel>
                <Select
                label="Manage Executive"
                name="manageExecutive"
                value={formValues.manageExecutive}
                onChange={handleSelectChange}
                variant="outlined"
                size="small"
                required
                >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                </Select>
            </FormControl>

            <FormControl>
                <InputLabel>Manage Role</InputLabel>
                <Select
                label="Manage Role"
                name="manageRole"
                value={formValues.manageRole}
                onChange={handleSelectChange}
                variant="outlined"
                size="small"
                required
                >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                </Select>
            </FormControl>

            <FormControl>
                <InputLabel>Manage Landmark</InputLabel>
                <Select
                label="Manage Landmark"
                name="manageLandmark"
                value={formValues.managelandmark}
                onChange={handleSelectChange}
                variant="outlined"
                size="small"
                required
                >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                </Select>
            </FormControl>


            <FormControl>
                <InputLabel>Manage Company</InputLabel>
                <Select
                label="Manage Company"
                name="manageCompany"
                value={formValues.managecompany}
                onChange={handleSelectChange}
                variant="outlined"
                size="small"
                required
                >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                </Select>
            </FormControl>


            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, gap: 1 }}>
                <Button type="submit" variant="contained" color="secondary" fullWidth onClick={() => {handleNavigate()}}>
                    Role List
                </Button>
                <Button type="submit" variant="contained" color="success" fullWidth>
                    Create Role
                </Button>
    
            </Box>
            
        </Box>

    );
};

export default RoleCreationForm;