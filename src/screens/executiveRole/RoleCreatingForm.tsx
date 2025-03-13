import React, { useState } from "react";
import { TextField, Button, Box, Typography, Switch } from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { roleCreationApi } from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { roleCreationSchema } from "../auth/validations/authValidation";

type RoleFormValues = {
  name: string;
  manageExecutive?: boolean;
  manageRole?: boolean;
  manageLandmark?: boolean;
  manageCompany?: boolean;
  manageVendor?: boolean;
  manageRoute?: boolean;
  manageSchedule?: boolean;
  manageService?: boolean;
  manageDuty?: boolean;
};

interface IRoleCreationFormProps {
  onClose: () => void;
  refreshList: (value:any)=>void
}

const RoleCreationForm: React.FC<IRoleCreationFormProps> = ({ onClose, refreshList }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: yupResolver(roleCreationSchema),
    defaultValues: {
      name: "",
      manageExecutive: false,
      manageRole: false,
      manageLandmark: false,
      manageCompany: false,
      manageVendor: false,
      manageRoute: false,
      manageSchedule: false,
      manageService: false,
      manageDuty: false,
    },
  });

  const handleRoleCreation: SubmitHandler<RoleFormValues> = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("manage_executive", String(data.manageExecutive));
      formData.append("manage_role", String(data.manageRole));
      formData.append("manage_landmark", String(data.manageLandmark));
      formData.append("manage_company", String(data.manageCompany));
      formData.append("manage_vendor", String(data.manageVendor));
      formData.append("manage_route", String(data.manageRoute));
      formData.append("manage_schedule", String(data.manageSchedule));
      formData.append("manage_service", String(data.manageService));
      formData.append("manage_duty", String(data.manageDuty));

      const response = await dispatch(roleCreationApi(formData)).unwrap();
      console.log("Role created>>>>>>>>>>>>>>>>>>>>:", response);
      if (response?.id) {
        alert("Role created successfully!");
        refreshList("refresh");
        onClose();
      } else {
        alert("Role creation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Failed to create role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleRoleCreation)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: 500,
        margin: "auto",
        mt: 10,
        p: 3,
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Create Role
      </Typography>

      <TextField
        label="Role Name"
        {...register("name")}
        error={!!errors.name}
        helperText={errors.name?.message}
        variant="outlined"
        size="small"
       
      />

      {/*  Permission Toggles */}
      {([
        "manageExecutive",
        "manageRole",
        "manageLandmark",
        "manageCompany",
        "manageVendor",
        "manageRoute",
        "manageSchedule",
        "manageService",
        "manageDuty",
      ] as (keyof RoleFormValues)[]).map((field) => (
        <Box key={field} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography>{field.replace("manage", "Manage ")}</Typography>
          <Controller
            name={field}
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch checked={!!value} onChange={(e) => onChange(e.target.checked)} color="success" />
            )}
          />
        </Box>
      ))}

      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
        {loading ? "Creating..." : "Create Role"}
      </Button>
    </Box>
  );
};

export default RoleCreationForm;
