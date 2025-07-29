import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Divider,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAppDispatch } from "../../store/Hooks";
import { roleCreationApi } from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { roleCreationSchema } from "../auth/validations/authValidation";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";

type RoleFormValues = {
  name: string;
  // Token Management
  manage_ex_token?: boolean;
  manage_op_token?: boolean;
  manage_ve_token?: boolean;
  // Executive Permissions
  create_executive?: boolean;
  update_executive?: boolean;
  delete_executive?: boolean;
  // Landmark Permissions
  create_landmark?: boolean;
  update_landmark?: boolean;
  delete_landmark?: boolean;
  // Company Permissions
  create_company?: boolean;
  update_company?: boolean;
  delete_company?: boolean;
  // Operator Permissions
  create_operator?: boolean;
  update_operator?: boolean;
  delete_operator?: boolean;
  // Business Permissions
  create_business?: boolean;
  update_business?: boolean;
  delete_business?: boolean;
  // Route Permissions
  create_route?: boolean;
  update_route?: boolean;
  delete_route?: boolean;
  // Bus Permissions
  create_bus?: boolean;
  update_bus?: boolean;
  delete_bus?: boolean;
  // Vendor Permissions
  create_vendor?: boolean;
  update_vendor?: boolean;
  delete_vendor?: boolean;
  // Schedule Permissions
  create_schedule?: boolean;
  update_schedule?: boolean;
  delete_schedule?: boolean;
  // Service Permissions
  create_service?: boolean;
  update_service?: boolean;
  delete_service?: boolean;
  // Fare Permissions
  create_fare?: boolean;
  update_fare?: boolean;
  delete_fare?: boolean;
  // Duty Permissions
  create_duty?: boolean;
  update_duty?: boolean;
  delete_duty?: boolean;
  // Role Permissions
  create_ex_role?: boolean;
  update_ex_role?: boolean;
  delete_ex_role?: boolean;
  create_op_role?: boolean;
  update_op_role?: boolean;
  delete_op_role?: boolean;
  create_ve_role?: boolean;
  update_ve_role?: boolean;
  delete_ve_role?: boolean;
};

interface IRoleCreationFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
}

const permissionGroups = [
  {
    groupName: "Token Management",
    permissions: [
      { label: "Executive Token", key: "manage_ex_token" },
      { label: "Operator Token", key: "manage_op_token" },
      { label: "Vendor Token", key: "manage_ve_token" },
    ],
  },
  {
    groupName: "Executive",
    permissions: [
      { label: "Create", key: "create_executive" },
      { label: "Update", key: "update_executive" },
      { label: "Delete", key: "delete_executive" },
    ],
  },
  {
    groupName: "Landmark",
    permissions: [
      { label: "Create", key: "create_landmark" },
      { label: "Update", key: "update_landmark" },
      { label: "Delete", key: "delete_landmark" },
    ],
  },
  {
    groupName: "Company",
    permissions: [
      { label: "Create", key: "create_company" },
      { label: "Update", key: "update_company" },
      { label: "Delete", key: "delete_company" },
    ],
  },
  {
    groupName: "Operator",
    permissions: [
      { label: "Create", key: "create_operator" },
      { label: "Update", key: "update_operator" },
      { label: "Delete", key: "delete_operator" },
    ],
  },
  {
    groupName: "Business",
    permissions: [
      { label: "Create", key: "create_business" },
      { label: "Update", key: "update_business" },
      { label: "Delete", key: "delete_business" },
    ],
  },
  {
    groupName: "Route",
    permissions: [
      { label: "Create", key: "create_route" },
      { label: "Update", key: "update_route" },
      { label: "Delete", key: "delete_route" },
    ],
  },
  {
    groupName: "Bus",
    permissions: [
      { label: "Create", key: "create_bus" },
      { label: "Update", key: "update_bus" },
      { label: "Delete", key: "delete_bus" },
    ],
  },
  {
    groupName: "Vendor",
    permissions: [
      { label: "Create", key: "create_vendor" },
      { label: "Update", key: "update_vendor" },
      { label: "Delete", key: "delete_vendor" },
    ],
  },
  {
    groupName: "Schedule",
    permissions: [
      { label: "Create", key: "create_schedule" },
      { label: "Update", key: "update_schedule" },
      { label: "Delete", key: "delete_schedule" },
    ],
  },
  {
    groupName: "Service",
    permissions: [
      { label: "Create", key: "create_service" },
      { label: "Update", key: "update_service" },
      { label: "Delete", key: "delete_service" },
    ],
  },
  {
    groupName: "Fare",
    permissions: [
      { label: "Create", key: "create_fare" },
      { label: "Update", key: "update_fare" },
      { label: "Delete", key: "delete_fare" },
    ],
  },
  {
    groupName: "Duty",
    permissions: [
      { label: "Create", key: "create_duty" },
      { label: "Update", key: "update_duty" },
      { label: "Delete", key: "delete_duty" },
    ],
  },
  {
    groupName: "Executive Role",
    permissions: [
      { label: "Create", key: "create_ex_role" },
      { label: "Update", key: "update_ex_role" },
      { label: "Delete", key: "delete_ex_role" },
    ],
  },
  {
    groupName: "Operator Role",
    permissions: [
      { label: "Create", key: "create_op_role" },
      { label: "Update", key: "update_op_role" },
      { label: "Delete", key: "delete_op_role" },
    ],
  },
  {
    groupName: "Vendor Role",
    permissions: [
      { label: "Create", key: "create_ve_role" },
      { label: "Update", key: "update_ve_role" },
      { label: "Delete", key: "delete_ve_role" },
    ],
  },
];

const RoleCreationForm: React.FC<IRoleCreationFormProps> = ({
  onClose,
  refreshList,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const defaultValues = permissionGroups.reduce((acc, group) => {
    group.permissions.forEach((permission) => {
      acc[permission.key as keyof RoleFormValues] = false as any;
    });
    return acc;
  }, {} as Partial<RoleFormValues>);

  defaultValues.name = "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: yupResolver(roleCreationSchema),
    defaultValues: defaultValues as RoleFormValues,
  });

  const handleRoleCreation: SubmitHandler<RoleFormValues> = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      // Append all permissions to formData
      permissionGroups.forEach((group) => {
        group.permissions.forEach((permission) => {
          formData.append(
            permission.key,
            String(data[permission.key as keyof RoleFormValues])
          );
        });
      });

      const response = await dispatch(roleCreationApi(formData)).unwrap();
      if (response?.id) {
        showSuccessToast("Role created successfully!");
        refreshList("refresh");
        onClose();
      } else {
        showErrorToast("Role creation failed. Please try again.");
      }
    } catch (error: any) {
      showErrorToast(error || "Failed to create role. Please try again.");
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
        gap: 1,
        width: "100%",
        maxHeight: "70vh",
        overflowY: "auto",
        pr: 1,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Create New Role
      </Typography>

      <TextField
        label="Role Name"
        {...register("name")}
        error={!!errors.name}
        helperText={errors.name?.message}
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 1 }} />

      <Typography variant="subtitle2" gutterBottom>
        Permissions
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
          alignItems: "flex-start",
        }}
      >
        {permissionGroups.map((group) => (
          <Box
            key={group.groupName}
            sx={{ minWidth: 200, flex: "1 1 200px", maxWidth: "100%" }}
          >
            <Accordion
              defaultExpanded={false}
              sx={{
                boxShadow: "none",
                border: `1px solid ${theme.palette.divider}`,
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon fontSize="small" />}
                sx={{
                  minHeight: "40px !important",
                  "& .MuiAccordionSummary-content": {
                    my: 0.5,
                  },
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {group.groupName}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {group.permissions.map((permission) => (
                    <Controller
                      key={permission.key}
                      name={permission.key as keyof RoleFormValues}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={!!field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Typography variant="caption">
                              {permission.label}
                            </Typography>
                          }
                          sx={{
                            m: 0,
                            justifyContent: "space-between",
                            "& .MuiFormControlLabel-label": {
                              flex: 1,
                            },
                          }}
                        />
                      )}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Button
          type="button"
          variant="outlined"
          size="small"
          fullWidth
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="small"
          fullWidth
          disabled={loading}
          sx={{ bgcolor: "darkblue" }}
        >
          {loading ? "Creating..." : "Create Role"}
        </Button>
      </Box>
    </Box>
  );
};

export default RoleCreationForm;
