import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Container,
  MenuItem,
  CssBaseline,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import {
  operatorupdationApi,
  operatorListApi,
  operatorRoleListApi,
  operatorRoleAssignUpdateApi,
  fetchOperatorRoleMappingApi,
  operatorRoleAssignApi
} from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { showErrorToast, showSuccessToast, showWarningToast } from "../../common/toastMessageHelper";

type operatorFormValues = {
  id: number;
  username: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: number;
  status?: string;
  companyId?: number;
  role?: number;
  roleAssignmentId?: number;
};

interface IOperatorUpdateFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
  operatorId: number;
  roleAssignmentId?: number;
  onCloseDetailCard(): void;
}

const genderOptions = [
  { label: "Female", value: 1 },
  { label: "Male", value: 2 },
  { label: "Transgender", value: 3 },
  { label: "Other", value: 4 },
];

const statusOptions = [
  { label: "Active", value: 1 },
  { label: "Suspended", value: 2 },
];

const OperatorUpdateForm: React.FC<IOperatorUpdateFormProps> = ({
  onClose,
  refreshList,
  operatorId,
  onCloseDetailCard
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string; company_id: number }[]>([]);
  const [operatorData, setOperatorData] = useState<operatorFormValues | null>(null);
  const [filteredRoles, setFilteredRoles] = useState<{ id: number; name: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [roleMappingError, setRoleMappingError] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<operatorFormValues>();
  
  const selectedCompanyId = watch("companyId");

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Filter roles based on company ID
  useEffect(() => {
    if (selectedCompanyId) {
      const filtered = roles.filter(role => role.company_id === selectedCompanyId);
      setFilteredRoles(filtered.map(role => ({ id: role.id, name: role.name })));
    } else {
      setFilteredRoles([]);
    }
  }, [selectedCompanyId, roles]);

  // Fetch operator data on mount
  useEffect(() => {
    const fetchOperatorData = async () => {
      try {
        setLoading(true);
        const operators = await dispatch(operatorListApi(selectedCompanyId??0)).unwrap();
        const operator = operators.find((r: any) => r.id === operatorId);

        if (operator) {
          const operatorFormData: operatorFormValues = {
            id: operator.id,
            username: operator.username,
            password: operator.password,
            fullName: operator.full_name,
            phoneNumber: operator.phone_number
              ? operator.phone_number.replace(/\D/g, "").replace(/^91/, "")
              : "",
            email: operator.email_id,
            gender: operator.gender,
            status: operator.status,
            companyId: operator.company_id,
          };

          // Try to fetch role mapping, but don't fail if it doesn't exist
          try {
            const roleMapping = await dispatch(
              fetchOperatorRoleMappingApi(operatorId)
            ).unwrap();

            if (roleMapping) {
              operatorFormData.role = roleMapping.role_id;
              operatorFormData.roleAssignmentId = roleMapping.id;
            }
          } catch (error: any) {
            console.error("Role mapping error:", error);
            setRoleMappingError(true);
          }

          // Fetch roles for the operator's company
          try {
            const companyRoles = await dispatch(
              operatorRoleListApi(operator.company_id)
            ).unwrap();
            
            setRoles(companyRoles.map((role: any) => ({
              id: role.id,
              name: role.name,
              company_id: role.company_id
            })));

            setOperatorData(operatorFormData);
            reset(operatorFormData);
          } catch (error) {
            console.error("Error fetching roles:", error);
            showErrorToast("Failed to fetch roles for this company");
          }
        }
      } catch (error) {
        console.error("Error fetching operator data:", error);
        showErrorToast("Failed to fetch operator data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorData();
  }, [operatorId, dispatch, reset]);

  // Handle operator update
  const handleOperatorUpdate: SubmitHandler<operatorFormValues> = async (data) => {
    try {
      setLoading(true);

      const formData = new URLSearchParams();
      formData.append("id", operatorId.toString());
      formData.append("username", data.username);
      if (data.password) {
        formData.append("password", data.password);
      }
      formData.append("gender", data.gender?.toString() || "");
      if (data.fullName) {
        formData.append("full_name", data.fullName);
      }
      if (data.phoneNumber) {
        formData.append("phone_number", `+91${data.phoneNumber}`);
      }
      if (data.email) {
        formData.append("email_id", data.email);
      }
      if (data.status) {
        formData.append("status", data.status.toString());
      }

      // Step 1: Update operator
      const operatorResponse = await dispatch(
        operatorupdationApi({ operatorId, formData })
      ).unwrap();

      if (!operatorResponse || !operatorResponse.id) {
        showErrorToast("Operator update failed! Please try again.");
        onClose();
        return;
      }

      // Step 2: Handle role assignment
      if (data.role) {
        try {
          // If we have a roleAssignmentId, try to update
          if (data.roleAssignmentId) {
            const roleUpdateResponse = await dispatch(
              operatorRoleAssignUpdateApi({
                id: data.roleAssignmentId,
                role_id: data.role,
              })
            ).unwrap();

            if (!roleUpdateResponse || !roleUpdateResponse.id) {
              throw new Error("Role assignment update failed");
            }
          } else {
            // If no roleAssignmentId, create a new role assignment
            const createResponse = await dispatch(
              operatorRoleAssignApi({
                operator_id: operatorId,
                role_id: data.role,
              })
            ).unwrap();

            if (!createResponse || !createResponse.id) {
              showErrorToast(
                "Operator updated, but role assignment creation failed!"
              );
            }
          }
        } catch (error) {
          // If update fails, try to create a new role assignment
          try {
            const createResponse = await dispatch(
              operatorRoleAssignApi({
                operator_id: operatorId,
                role_id: data.role,
              })
            ).unwrap();

            if (!createResponse || !createResponse.id) {
              showErrorToast(
                "Operator updated, but role assignment creation failed!"
              );
            }
          } catch (createError) {
            showErrorToast("Operator updated, but role assignment failed!");
          }
        }
      } else {
        showWarningToast("No role selected. Skipping role assignment.");
      }

      showSuccessToast("Operator updated successfully!");
      onCloseDetailCard();
      refreshList("refresh");
      onClose();
    } catch (error) {
      console.error("Error updating operator:", error);
      showErrorToast("Failed to update operator");
    } finally {
      setLoading(false);
    }
  };

  if (!operatorData) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Update Operator
        </Typography>
        {roleMappingError && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            Note: Previous role assignment not found. Please select a new role.
          </Typography>
        )}
        <Box
          component="form"
          noValidate
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(handleOperatorUpdate)}
        >
          <TextField
            margin="normal"
            fullWidth
            label="Full Name"
            {...register("fullName")}
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            size="small"
          />

          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <TextField
                margin="normal"
                fullWidth
                label="Phone Number"
                placeholder="eg:+911234567890"
                size="small"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                value={field.value ? `+91${field.value}` : ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.startsWith("91")) value = value.slice(2);
                  if (value.length > 10) value = value.slice(0, 10);
                  field.onChange(value || "");
                }}
              />
            )}
          />

          <TextField
            margin="normal"
            placeholder="example@gmail.com"
            fullWidth
            label="Email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            size="small"
          />

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <TextField
                margin="normal"
                fullWidth
                select
                label="Gender"
                {...field}
                error={!!errors.gender}
                size="small"
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                margin="normal"
                fullWidth
                select
                label="Status"
                {...field}
                error={!!errors.status}
                size="small"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="role"
            control={control}
            rules={{ required: "Role is required" }}
            render={({ field }) => (
              <TextField
                margin="normal"
                required
                fullWidth
                select
                label="Role"
                {...field}
                error={!!errors.role}
                helperText={errors.role?.message}
                size="small"
              >
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No roles available for this company
                  </MenuItem>
                )}
              </TextField>
            )}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Reset password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: "darkblue" }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Update Operator"
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OperatorUpdateForm;