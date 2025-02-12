import React, { useState } from "react";
import { TextField, Button, Box, Typography, Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";




type RoleFormValues = {
  roleName: string;
  manageExecutive: boolean;
  manageRole: boolean;
  managelandmark: boolean;
  managecompany: boolean;
  
}
const RoleCreationForm: React.FC = () => {
    const [formValues, setFormValues] = useState<RoleFormValues>({
        roleName: "",
        manageExecutive: false,
        manageRole: false,
        managelandmark: false,
        managecompany: false,
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

      const handleToggle = (field: string) => {
        setFormValues((prevValues) => ({
          ...prevValues,
          [field]: !prevValues[field as keyof typeof formValues],
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

            {["manageExecutive", "manageRole", "manageLandmark", "manageCompany"].map((field) => (
              <Box key={field} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography>{field.replace("manage", "Manage")}</Typography>
                <Switch
                  checked={Boolean(formValues[field as keyof typeof formValues])}
                  onChange={() => handleToggle(field)}
                  color="success"
                />
              </Box>

      ))}


            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, gap: 1 }}>
                <Button type="submit" variant="contained" sx={{bgcolor:"darkblue"}} fullWidth onClick={() => {handleNavigate()}}>
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