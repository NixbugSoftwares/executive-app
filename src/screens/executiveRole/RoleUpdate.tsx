import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Switch,
  CircularProgress,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { roleUpdationApi, roleListApi } from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";
type RoleFormValues = {
  id: number;
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

interface IRoleUpdateFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
  roleId: number;
  handleCloseDetailCard: () => void;
}

const RoleUpdateForm: React.FC<IRoleUpdateFormProps> = ({
  onClose,
  refreshList,
  roleId,
  handleCloseDetailCard,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [roleData, setRoleData] = useState<RoleFormValues | null>(null);

  const { handleSubmit, control, reset } = useForm<RoleFormValues>();

  // Fetch role data on mount
  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        setLoading(true);
        const roles = await dispatch(roleListApi()).unwrap();
        const role = roles.find((r: any) => r.id === roleId);

        if (role) {
          setRoleData({
            id: role.id,
            name: role.name,
            manageExecutive: role.manage_executive,
            manageRole: role.manage_role,
            manageLandmark: role.manage_landmark,
            manageCompany: role.manage_company,
            manageVendor: role.manage_vendor,
            manageRoute: role.manage_route,
            manageSchedule: role.manage_schedule,
            manageService: role.manage_service,
            manageDuty: role.manage_duty,
          });

          reset({
            id: role.id,
            name: role.name,
            manageExecutive: role.manage_executive,
            manageRole: role.manage_role,
            manageLandmark: role.manage_landmark,
            manageCompany: role.manage_company,
            manageVendor: role.manage_vendor,
            manageRoute: role.manage_route,
            manageSchedule: role.manage_schedule,
            manageService: role.manage_service,
            manageDuty: role.manage_duty,
          });
        }
      } catch (error) {
        showErrorToast("Failed to fetch role data. Please try again.");
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
      formData.append("manage_executive", String(data.manageExecutive));
      formData.append("manage_role", String(data.manageRole));
      formData.append("manage_landmark", String(data.manageLandmark));
      formData.append("manage_company", String(data.manageCompany));
      formData.append("manage_vendor", String(data.manageVendor));
      formData.append("manage_route", String(data.manageRoute));
      formData.append("manage_schedule", String(data.manageSchedule));
      formData.append("manage_service", String(data.manageService));
      formData.append("manage_duty", String(data.manageDuty));

      await dispatch(roleUpdationApi({ roleId, formData })).unwrap();

      showSuccessToast("Role updated successfully!");
      refreshList("refresh");
      handleCloseDetailCard();
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

      {(
        [
          "manageExecutive",
          "manageRole",
          "manageLandmark",
          "manageCompany",
          "manageVendor",
          "manageRoute",
          "manageSchedule",
          "manageService",
          "manageDuty",
        ] as (keyof RoleFormValues)[]
      ).map((field) => (
        <Box
          key={field}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>{field.replace("manage", "Manage ")}</Typography>
          <Controller
            name={field}
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                color="success"
              />
            )}
          />
        </Box>
      ))}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ mt: 3, mb: 2, bgcolor: "darkblue" }}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: "white" }} />
        ) : (
          "Update Role"
        )}
      </Button>
    </Box>
  );
};

export default RoleUpdateForm;
