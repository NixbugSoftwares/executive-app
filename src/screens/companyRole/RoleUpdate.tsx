import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Switch, CircularProgress } from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { operatorRoleUpdationApi, operatorRoleListApi } from "../../slices/appSlice"; 
import { useForm, SubmitHandler, Controller } from "react-hook-form";

type RoleFormValues = {
  id: number; 
  name: string;
  manage_bus?: boolean;
  manage_route?: boolean;
  manage_schedule?: boolean;
  manage_role?: boolean;
  manage_operator?: boolean;
  manage_company?: boolean;
};

interface IRoleUpdateFormProps {
  onClose: () => void; 
  refreshList: (value: any) => void; 
  roleId: number; 
}

const RoleUpdateForm: React.FC<IRoleUpdateFormProps> = ({
  onClose,
  refreshList,
  roleId,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [roleData, setRoleData] = useState<RoleFormValues | null>(null); 

  const {
    register,
    handleSubmit,
    control,
    reset, 
    formState: { errors },
  } = useForm<RoleFormValues>();

  // Fetch role data on mount
  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        setLoading(true);
        const roles = await dispatch(operatorRoleListApi(null)).unwrap();
        const role = roles.find((r: any) => r.id === roleId);

        if (role) {
          setRoleData({
            id: role.id,
            name: role.name,
            manage_bus: role.manage_bus,
            manage_route: role.manage_route,
            manage_schedule: role.manage_schedule,
            manage_role: role.manage_role,
            manage_operator: role.manage_operator,
            manage_company: role.manage_company
          });

          reset({
            id: role.id,
            name: role.name,
            manage_bus: role.manage_bus,
            manage_route: role.manage_route,  
            manage_schedule: role.manage_schedule,
            manage_role: role.manage_role,  
            manage_operator: role.manage_operator,
            manage_company: role.manage_company
          });
        }
      } catch (error) {
        console.error("Error fetching role data:", error);
        alert("Failed to fetch role data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  }, [roleId, dispatch, reset]);

  // Handle Role Update
  const handleRoleUpdate: SubmitHandler<RoleFormValues> = async (data) => {
    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("id", roleId.toString()); 
      formData.append("name", data.name);
      formData.append("manage_bus", String(data.manage_bus));
      formData.append("manage_route", String(data.manage_route));
      formData.append("manage_schedule", String(data.manage_schedule));
      formData.append("manage_role", String(data.manage_role));
      formData.append("manage_operator", String(data.manage_operator));
      formData.append("manage_company", String(data.manage_company));

      //  update API
      const response = await dispatch(operatorRoleUpdationApi({roleId, formData })).unwrap();
      console.log("Role updated:", response);
      alert("Role updated successfully!");
      refreshList("refresh"); 
      onClose(); 
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!roleData) {
    return <CircularProgress />; 
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleRoleUpdate)}
      
    >
      <Typography variant="h5" align="center" gutterBottom>
        Update Role
      </Typography>

      
      <TextField
        label="Role Name"
        {...register("name")}
        error={!!errors.name}
        helperText={errors.name?.message}
        variant="outlined"
        size="small"
        fullWidth
      />

      
      {([
        "manage_bus",
        "manage_route",
        "manage_schedule",
        "manage_role",
        "manage_operator",
        "manage_company",
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

      {/* Submit Button */}
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
        {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Update Role"}
      </Button>
    </Box>
  );
};

export default RoleUpdateForm;