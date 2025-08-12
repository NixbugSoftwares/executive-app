import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  Checkbox,
  FormControlLabel,
  Alert,
  useTheme,
  TextField,
  Switch,
  Stack,
} from "@mui/material";
import {
  Diversity3 as RolesIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAppDispatch } from "../../store/Hooks";
import { roleDeleteApi, roleUpdationApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import { RoleDetails } from "../../types/type";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { roleCreationSchema } from "../auth/validations/authValidation";

interface RoleCardProps {
  role: {
    id: number;
    name: string;
    roleDetails?: RoleDetails;
  };
  onBack: () => void;
  onDelete: (id: number) => void;
  refreshList: (value: any) => void;
  handleCloseDetailCard: () => void;
  onCloseDetailCard: () => void;
}

const permissionGroups = [
  {
    groupName: "Token Management",
    permissions: [
      { label: "Executive", key: "manage_ex_token" },
      { label: "Operator", key: "manage_op_token" },
      { label: "Vendor", key: "manage_ve_token" },
    ],
  },
  {
    groupName: "Executive Management",
    permissions: [
      { label: "Create", key: "create_executive" },
      { label: "Update", key: "update_executive" },
      { label: "Delete", key: "delete_executive" },
    ],
  },
  {
    groupName: "Landmark Management",
    permissions: [
      { label: "Create", key: "create_landmark" },
      { label: "Update", key: "update_landmark" },
      { label: "Delete", key: "delete_landmark" },
    ],
  },
  {
    groupName: "Company Management",
    permissions: [
      { label: "Create", key: "create_company" },
      { label: "Update", key: "update_company" },
      { label: "Delete", key: "delete_company" },
    ],
  },
  {
    groupName: "Operator Management",
    permissions: [
      { label: "Create", key: "create_operator" },
      { label: "Update", key: "update_operator" },
      { label: "Delete", key: "delete_operator" },
    ],
  },
  {
    groupName: "Business Management",
    permissions: [
      { label: "Create", key: "create_business" },
      { label: "Update", key: "update_business" },
      { label: "Delete", key: "delete_business" },
    ],
  },
  {
    groupName: "Executive Role Management",
    permissions: [
      { label: "Create", key: "create_ex_role" },
      { label: "Update", key: "update_ex_role" },
      { label: "Delete", key: "delete_ex_role" },
    ],
  },
  {
    groupName: "Operator Role Management",
    permissions: [
      { label: "Create", key: "create_op_role" },
      { label: "Update", key: "update_op_role" },
      { label: "Delete", key: "delete_op_role" },
    ],
  },
  {
    groupName: "Vendor Role Management",
    permissions: [
      { label: "Create", key: "create_ve_role" },
      { label: "Update", key: "update_ve_role" },
      { label: "Delete", key: "delete_ve_role" },
    ],
  },
  {
    groupName: "Route Management",
    permissions: [
      { label: "Create", key: "create_route" },
      { label: "Update", key: "update_route" },
      { label: "Delete", key: "delete_route" },
    ],
  },
  {
    groupName: "Bus Management",
    permissions: [
      { label: "Create", key: "create_bus" },
      { label: "Update", key: "update_bus" },
      { label: "Delete", key: "delete_bus" },
    ],
  },
  {
    groupName: "Vendor Management",
    permissions: [
      { label: "Create", key: "create_vendor" },
      { label: "Update", key: "update_vendor" },
      { label: "Delete", key: "delete_vendor" },
    ],
  },
  {
    groupName: "Schedule Management",
    permissions: [
      { label: "Create", key: "create_schedule" },
      { label: "Update", key: "update_schedule" },
      { label: "Delete", key: "delete_schedule" },
    ],
  },
  {
    groupName: "Service Management",
    permissions: [
      { label: "Create", key: "create_service" },
      { label: "Update", key: "update_service" },
      { label: "Delete", key: "delete_service" },
    ],
  },
  {
    groupName: "Fare Management",
    permissions: [
      { label: "Create", key: "create_fare" },
      { label: "Update", key: "update_fare" },
      { label: "Delete", key: "delete_fare" },
    ],
  },
  {
    groupName: "Duty Management",
    permissions: [
      { label: "Create", key: "create_duty" },
      { label: "Update", key: "update_duty" },
      { label: "Delete", key: "delete_duty" },
    ],
  },
  
];

const RoleDetailsCard: React.FC<RoleCardProps> = ({
  role,
  onBack,
  onDelete,
  refreshList,
  onCloseDetailCard,
}) => {
  const theme = useTheme();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const canDeleteRole = useSelector((state: RootState) =>
    state.app.permissions.includes("delete_ex_role")
  );

  const canUpdateRole = useSelector((state: RootState) =>
    state.app.permissions.includes("update_ex_role")
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(roleCreationSchema),
    defaultValues: {
      name: role.name,
      ...role.roleDetails,
    },
  });
  useEffect(() => {
    reset({
      name: role.name,
      ...role.roleDetails,
    });
  }, [role, reset]);

  const handleGroupToggle = (groupName: string, checked: boolean) => {
    const group = permissionGroups.find((g) => g.groupName === groupName);
    if (group) {
      group.permissions.forEach((permission) => {
        setValue(
          permission.key as keyof typeof role.roleDetails,
          checked as (typeof role.roleDetails)[keyof typeof role.roleDetails]
        );
      });
    }
  };

  const isGroupAllSelected = (groupName: string) => {
    const group = permissionGroups.find((g) => g.groupName === groupName);
    if (!group) return false;

    return group.permissions.every((permission) =>
      watch(permission.key as keyof typeof role.roleDetails)
    );
  };

  const handleAllPermissionsToggle = (checked: boolean) => {
    permissionGroups.forEach((group) => {
      group.permissions.forEach((permission) => {
        setValue(
          permission.key as keyof typeof role.roleDetails,
          checked as (typeof role.roleDetails)[keyof typeof role.roleDetails]
        );
      });
    });
  };

  const isAllPermissionsSelected = () => {
    return permissionGroups.every((group) =>
      group.permissions.every((permission) =>
        watch(permission.key as keyof typeof role.roleDetails)
      )
    );
  };

  const handleRoleDelete = async () => {
    if (!role.id) {
      showErrorToast("Error: role ID is missing");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", String(role.id));
      await dispatch(roleDeleteApi(formData)).unwrap();
      setDeleteConfirmOpen(false);
      localStorageHelper.removeStoredItem(`role_${role.id}`);
      onDelete(role.id);
      onCloseDetailCard();
      showSuccessToast("Role deleted successfully!");
      refreshList("refresh");
    } catch (error) {
      showErrorToast("Failed to delete role. Please try again.");
    } finally {
      setAcknowledgedWarning(false);
    }
  };

  const handleRoleUpdate = async (data: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", String(role.id));
      formData.append("name", data.name);

      permissionGroups.forEach((group) => {
        group.permissions.forEach((permission) => {
          formData.append(permission.key, String(data[permission.key]));
        });
      });

      const response = await dispatch(
        roleUpdationApi({ roleId: role.id, formData })
      ).unwrap();

      if (response?.id) {
        showSuccessToast("Role updated successfully!");
        refreshList("refresh");
        onCloseDetailCard();
      } else {
        showErrorToast("Role update failed. Please try again.");
      }
    } catch (error: any) {
      showErrorToast(error || "Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        sx={{ maxWidth: 800, margin: "auto", boxShadow: 3, borderRadius: 2 }}
      >
        <Box sx={{ p: 2, bgcolor: "darkblue", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "white", width: 40, height: 40 }}>
              <RolesIcon color="primary" />
            </Avatar>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    backgroundColor: "white",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: "transparent",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "transparent",
                      },
                    },
                  }}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Box>
          <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
            Role ID: {role.id}
          </Typography>
        </Box>

        <CardContent>
          <Box display={"flex"} justifyContent={"space-between"} sx={{ mb: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Permissions
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={isAllPermissionsSelected()}
                  indeterminate={
                    !isAllPermissionsSelected() &&
                    permissionGroups.some((group) =>
                      group.permissions.some((permission) =>
                        watch(permission.key as keyof typeof role.roleDetails)
                      )
                    )
                  }
                  onChange={(e) => handleAllPermissionsToggle(e.target.checked)}
                />
              }
              label="Select All Permissions"
              labelPlacement="start"
              sx={{ m: 0, mb: 1 }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
            }}
          >
            {permissionGroups.map((group) => (
              <Box
                key={group.groupName}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="medium">
                    {group.groupName}
                  </Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={isGroupAllSelected(group.groupName)}
                        indeterminate={
                          !isGroupAllSelected(group.groupName) &&
                          group.permissions.some((permission) =>
                            watch(
                              permission.key as keyof typeof role.roleDetails
                            )
                          )
                        }
                        onChange={(e) =>
                          handleGroupToggle(group.groupName, e.target.checked)
                        }
                      />
                    }
                    label=""
                    labelPlacement="start"
                    sx={{ m: 0 }}
                  />
                </Box>

                <Stack spacing={1}>
                  {group.permissions.map((permission) => (
                    <Controller
                      key={permission.key}
                      name={permission.key as keyof typeof role.roleDetails}
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
                            <Typography variant="body2">
                              {permission.label}
                            </Typography>
                          }
                          labelPlacement="start"
                          sx={{
                            m: 0,
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        />
                      )}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </CardContent>

        <CardActions
          sx={{
            display: "flex",
            justifyContent: "left",
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={onBack}
            startIcon={<BackIcon />}
            sx={{ minWidth: 100 }}
          >
            Back
          </Button>

          <Box sx={{ display: "flex", gap: 1 }}>
            <>
              {canUpdateRole && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSubmit(handleRoleUpdate)}
                  startIcon={<EditIcon />}
                  color="success"
                  disabled={loading}
                  sx={{
                    minWidth: 100,
                    "&.Mui-disabled": {
                      backgroundColor: theme.palette.action.disabledBackground,
                    },
                  }}
                >
                  Update
                </Button>
              )}

              {canDeleteRole && (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={!canDeleteRole}
                  startIcon={<DeleteIcon />}
                  sx={{
                    "&.Mui-disabled": {
                      backgroundColor: "#e57373 !important",
                      color: "#ffffff99",
                    },
                  }}
                >
                  Delete
                </Button>
              )}
            </>
          </Box>
        </CardActions>
      </Card>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Role Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Warning:</strong> Deleting this role will remove all
            associated permissions from assigned users.
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Typography>
              <strong>Role:</strong> {role.name}
            </Typography>
            <Typography>
              <strong>ID:</strong> {role.id}
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={acknowledgedWarning}
                onChange={(e) => setAcknowledgedWarning(e.target.checked)}
                color="primary"
              />
            }
            label="I understand the consequences"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleRoleDelete}
            color="error"
            disabled={!acknowledgedWarning}
            variant="contained"
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RoleDetailsCard;
