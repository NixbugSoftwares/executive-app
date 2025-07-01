import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  CircularProgress,
  MenuItem,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch } from "../../store/Hooks";
import {
  accountupdationApi,
  roleListApi,
  roleAssignUpdateApi,
  fetchRoleMappingApi,
  roleAssignApi,
} from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import {
  showSuccessToast,
  showErrorToast,
} from "../../common/toastMessageHelper";

// Account update form interface
interface IAccountFormInputs {
  username?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: number;
  designation?: string;
  role?: number;
  roleAssignmentId?: number;
  status?: number;
}

interface IAccountUpdateFormProps {
  accountId: number;
  onClose: () => void;
  refreshList: (value: any) => void;
  onCloseDetailCard(): void;
  accountData?: IAccountFormInputs;
  canManageExecutive?: boolean;
}
interface IOption {
  label: string;
  value: number;
}
// Gender options mapping
const genderOptions: IOption[] = [
  { label: "Female", value: 1 },
  { label: "Male", value: 2 },
  { label: "Transgender", value: 3 },
  { label: "Other", value: 4 },
];

const statusOptions: IOption[] = [
  { label: "Active", value: 1 },
  { label: "Suspended", value: 2 },
];
const loggedInUser = localStorageHelper.getItem("@user");
const userId = loggedInUser?.executive_id;

const AccountUpdateForm: React.FC<IAccountUpdateFormProps> = ({
  accountId,
  accountData,
  onClose,
  refreshList,
  onCloseDetailCard,
  canManageExecutive,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const isLoggedInUser = accountId === userId;
  const [roleMappingError, setRoleMappingError] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IAccountFormInputs>();
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    // Fetch available roles
    dispatch(roleListApi({}))
      .unwrap()
      .then((res: { data: any[] }) => {
        setRoles(res.data.map((role) => ({ id: role.id, name: role.name })));
      })

      .catch((err: any) => {
        showErrorToast(err);
      });

    // Fetch role mapping for this account
    dispatch(fetchRoleMappingApi(accountId))
      .unwrap()
      .then((roleMapping) => {
        // Check for null, undefined, or empty object
        if (roleMapping && Object.keys(roleMapping).length > 0) {
          const formData = {
            ...accountData,
            role: roleMapping.role_id,
            roleAssignmentId: roleMapping.id,
          };
          reset(formData);
          setRoleMappingError(false);
        } else {
          reset(accountData);
          setRoleMappingError(true);
        }
      })
      .catch((error: any) => {
        showErrorToast(error);
        reset(accountData);
        setRoleMappingError(true);
      });
  }, [accountId, dispatch, reset, accountData]);

  const handleAccountUpdate: SubmitHandler<IAccountFormInputs> = async (
    data
  ) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("id", accountId.toString());
      if (data.username) formData.append("username", data.username);
      if (data.password) formData.append("password", data.password);
      formData.append("gender", data.gender?.toString() || "");
      if (data.fullName) formData.append("full_name", data.fullName);
      if (data.phoneNumber)
        formData.append("phone_number", `+91${data.phoneNumber}`);
      if (data.email) formData.append("email_id", data.email);
      if (data.designation) formData.append("designation", data.designation);
      if (data.status) formData.append("status", data.status.toString());
      const accountResponse = await dispatch(
        accountupdationApi({ accountId, formData })
      ).unwrap();
      if (!accountResponse?.id) {
        showErrorToast("Account update failed! Please try again.");
        onClose();
        return;
      }
      if (canManageExecutive && data.role) {
        try {
          if (data.roleAssignmentId) {
            await dispatch(
              roleAssignUpdateApi({
                id: data.roleAssignmentId,
                role_id: data.role,
              })
            ).unwrap();
          } else {
            await dispatch(
              roleAssignApi({
                executive_id: accountId,
                role_id: data.role,
              })
            ).unwrap();
          }
          console.log("Role assignment successful");
        } catch (error: any) {
          console.error("Role assignment error:", error);
          showErrorToast(
            error.response?.data?.detail ||
              error ||
              "Account updated, but role assignment failed!"
          );
        }
      }

      showSuccessToast("Account Updated successfully!");
      onCloseDetailCard();
      refreshList("refresh");
      onClose();
    } catch {
      showErrorToast("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!accountData) {
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
          Update Account
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
          onSubmit={handleSubmit(handleAccountUpdate)}
        >
          {/* Rest of your form fields remain the same */}
          <TextField
            margin="normal"
            fullWidth
            label="Full Name"
            {...register("fullName")}
            defaultValue={accountData.fullName || ""}
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            size="small"
          />
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => {
              let cleanValue = field.value || accountData.phoneNumber || "";
              cleanValue = cleanValue
                .replace(/^tel:/, "")
                .replace(/[^0-9]/g, "");

              if (cleanValue.startsWith("91") && cleanValue.length > 10) {
                cleanValue = cleanValue.slice(2);
              }
              if (cleanValue.length > 10) {
                cleanValue = cleanValue.slice(-10);
              }

              return (
                <TextField
                  margin="normal"
                  fullWidth
                  label="Phone Number"
                  placeholder="eg: +911234567890"
                  size="small"
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                  value={cleanValue ? `+91${cleanValue}` : ""}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.startsWith("91")) value = value.slice(2);
                    if (value.length > 10) value = value.slice(0, 10);
                    field.onChange(value || "");
                  }}
                />
              );
            }}
          />

          <TextField
            margin="normal"
            placeholder="example@gmail.com"
            fullWidth
            label="Email"
            type="email"
            {...register("email", {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            defaultValue={accountData.email || ""}
            error={!!errors.email}
            helperText={errors.email?.message}
            size="small"
          />
          {canManageExecutive && (
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
                  value={field.value || ""}
                  onChange={field.onChange}
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
          )}
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
                defaultValue={accountData.gender}
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Designation"
            {...register("designation")}
            defaultValue={accountData.designation || ""}
            error={!!errors.designation}
            helperText={errors.designation?.message}
            size="small"
          />

          {canManageExecutive && !isLoggedInUser && (
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
                  defaultValue={accountData.status}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          <TextField
            margin="normal"
            fullWidth
            label="Reset Password"
            type={showPassword ? "text" : "password"}
            {...register("password", {
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
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
              "Update Account"
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AccountUpdateForm;
