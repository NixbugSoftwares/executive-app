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
} from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type operatorFormValues = {
  id: number;
  username: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: number;
  status?: number;
  role: number;
  roleAssignmentId?: number;
};

interface IOperatorUpdateFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
  operatorId: number;
  roleAssignmentId?: number;
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
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [operatorData, setOperatorData] = useState<operatorFormValues | null>(
    null
  );
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<operatorFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Fetch operator data on mount
  useEffect(() => {
    dispatch(operatorRoleListApi())
      .unwrap()
      .then((res: any[]) => {
        setRoles(res.map((role) => ({ id: role.id, name: role.name })));
      })
      .catch((err: any) => {
        console.error("Error fetching roles:", err);
      });
    const fetchOperatorData = async () => {
      try {
        setLoading(true);
        const operators = await dispatch(operatorListApi()).unwrap();
        const operator = operators.find((r: any) => r.id === operatorId);

        if (operator) {
          const roleMapping = await dispatch(
            fetchOperatorRoleMappingApi(operatorId)
          ).unwrap();
          console.log("account===============>", operator);
          console.log("Fetched Role Mapping:", roleMapping);
          setOperatorData({
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
            role: roleMapping.role_id,
            roleAssignmentId: roleMapping.id,
          });

          reset({
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
            role: roleMapping.role_id,
            roleAssignmentId: roleMapping.id,
          });
        }
      } catch (error) {
        console.error("Error fetching operator data:", error);
        alert("Failed to fetch operator data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorData();
  }, [operatorId, dispatch, reset]);

  // Handle operator update
  const handleOperatorUpdate: SubmitHandler<operatorFormValues> = async (
    data
  ) => {
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
      console.log(
        "Form Data for Account Update:",
        Object.fromEntries(formData.entries())
      );

      const operatorResponse = await dispatch(
        operatorupdationApi({ operatorId, formData })
      ).unwrap();
      console.log("operator updated:", operatorResponse);
      if (!operatorResponse || !operatorResponse.id) {
        alert("Account update failed! Please try again.");
        onClose();
        return;
      }
      refreshList("refresh");

      if (data.roleAssignmentId && data.role) {
        console.log("Calling roleAssignUpdateApi with:", {
          roleAssignmentId: data.roleAssignmentId,
          role: data.role,
        });

        try {
          const roleUpdateResponse = await dispatch(
            operatorRoleAssignUpdateApi({
              id: data.roleAssignmentId,
              role_id: data.role,
            })
          ).unwrap();
          console.log("Role Assignment Update Response:", roleUpdateResponse);

          if (!roleUpdateResponse || !roleUpdateResponse.id) {
            alert("Account updated, but role assignment update failed!");
            onClose();
            return;
          }
        } catch (roleError) {
          console.error("Error during role assignment update:", roleError);
          alert("Account updated, but role assignment update failed!");
        }
      } else {
        console.warn(
          "Role Assignment ID or Role ID is missing. Skipping role assignment update."
        );
      }

      alert("Account updated successfully!");
      refreshList("refresh");
      onClose();
    } catch (error) {
      console.error("Error updating operator:", error);
      alert("Failed to update operator. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!operatorData) {
    return <CircularProgress />;
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
                  let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                  if (value.startsWith("91")) value = value.slice(2); // Prevent extra +91
                  if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
                  field.onChange(value || ""); // Allow empty value
                }}
                onFocus={() => {
                  if (!field.value) field.onChange(""); // Ensure user can start fresh
                }}
                onBlur={() => {
                  if (!field.value) field.onChange(""); // Keep field empty if cleared
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
                label="status"
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
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
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
            color="primary"
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
