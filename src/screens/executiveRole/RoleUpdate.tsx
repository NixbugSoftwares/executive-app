import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Switch,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { roleUpdationApi } from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";
type RoleFormValues = {
  id: number;
  name?: string;
  manage_executive?: boolean;
  manage_role?: boolean;
  manage_landmark?: boolean;
  manage_company?: boolean;
  manage_vendor?: boolean;
  manage_route?: boolean;
  manage_schedule?: boolean;
  manage_service?: boolean;
  manage_duty?: boolean;
  manage_fare?: boolean;
};

interface IRoleUpdateFormProps {
  roleId: number;
  roleData?: RoleFormValues; 
  onClose: () => void;
  refreshList: (value: any) => void;
  onCloseDetailCard: () => void;
}

const RoleUpdateForm: React.FC<IRoleUpdateFormProps> = ({
  onClose,
  refreshList,
  roleId,
  roleData,
  onCloseDetailCard,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
console.log("Role Data:>>>>>>>>>>>>>>>>>>>>>>>>>", roleData);

  const { handleSubmit, control,  } = useForm<RoleFormValues>(
    {
      defaultValues: {
      ...(roleData?.roleDetails || {}) 
    }
    }
  );
  // Handle Role Update
  const handleRoleUpdate: SubmitHandler<RoleFormValues> = async (data) => {
    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("id", roleId.toString());
      formData.append("manage_executive", String(data.manage_executive));
      formData.append("manage_role", String(data.manage_role));
      formData.append("manage_landmark", String(data.manage_landmark));
      formData.append("manage_company", String(data.manage_company));
      formData.append("manage_vendor", String(data.manage_vendor));
      formData.append("manage_route", String(data.manage_route));
      formData.append("manage_schedule", String(data.manage_schedule));
      formData.append("manage_service", String(data.manage_service));
      formData.append("manage_duty", String(data.manage_duty));
      formData.append("manage_fare", String(data.manage_fare));

      await dispatch(roleUpdationApi({ roleId, formData })).unwrap();

      showSuccessToast("Role updated successfully!");
      refreshList("refresh");
      onCloseDetailCard();
      onClose();
    } catch (error) {
      showErrorToast("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!roleData) {
    return <CircularProgress />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleRoleUpdate)}>
       <Typography variant="body1" align="center" gutterBottom sx={{
    fontWeight: "bold",
    color: "black",
    
    letterSpacing: 1,
  }}>
        <b>Role Name:</b> {roleData?.name}
      </Typography>


      {([
        "manage_executive",
        "manage_role",
        "manage_landmark",
        "manage_company",
        "manage_vendor",
        "manage_route",
        "manage_schedule",
        "manage_service",
        "manage_duty",
        "manage_fare"
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

      <Button type="submit" variant="contained" sx={{ bgcolor: "darkblue" }} fullWidth disabled={loading}>
        {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Update Role"}
      </Button>
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={onClose}
        sx={{ mt: 2 }}
      >
        Cancel
      </Button>
    </Box>
  );
};

export default RoleUpdateForm;
