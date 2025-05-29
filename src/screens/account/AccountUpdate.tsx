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
  accountListApi,
  fetchRoleMappingApi,
  roleAssignApi,
} from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
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
}

// Gender options mapping
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
const loggedInUser = localStorageHelper.getItem("@user");
const userId = loggedInUser?.executive_id;

const AccountUpdateForm: React.FC<IAccountUpdateFormProps> = ({
  accountId,
  onClose,
  refreshList,
  onCloseDetailCard,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const isLoggedInUser = accountId === userId;
  const [accountData, setAccountData] = useState<IAccountFormInputs | null>(
    null
  );
  const [roleMappingError, setRoleMappingError] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IAccountFormInputs>({});
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Fetch roles and account data
  useEffect(() => {
    dispatch(roleListApi())
      .unwrap()
      .then((res: any[]) => {
        setRoles(res.map((role) => ({ id: role.id, name: role.name })));
      })
      .catch((err: any) => {
        showErrorToast(err);
      });

    // Then fetch account data
    dispatch(accountListApi())
      .unwrap()
      .then(async (res: any[]) => {
        const account = res.find((acc) => acc.id === accountId);
        if (account) {
          const accountFormData: IAccountFormInputs = {
            username: account.username,
            password: account.password,
            fullName: account.full_name,
            phoneNumber: account.phone_number
              ? account.phone_number.replace(/\D/g, "").replace(/^91/, "")
              : "",
            email: account.email_id,
            gender: account.gender,
            designation: account.designation,
            status: account.status,
          };

          // Try to fetch role mapping, but don't fail if it doesn't exist
          try {
            const roleMapping = await dispatch(
              fetchRoleMappingApi(accountId)
            ).unwrap();

            if (roleMapping) {
              accountFormData.role = roleMapping.role_id;
              accountFormData.roleAssignmentId = roleMapping.id;
            }
          } catch (error: any) {
            showErrorToast(error);
            setRoleMappingError(true);
          }

          setAccountData(accountFormData);
          reset(accountFormData);
        }
      })
      .catch((err: any) => {
        showErrorToast(err);
      });
  }, [accountId, dispatch, reset]);

  // Handle Account Update & Role Assignment Update/Creation
  const handleAccountUpdate: SubmitHandler<IAccountFormInputs> = async (
    data
  ) => {
    try {
      setLoading(true);

      const formData = new URLSearchParams();
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

      // Step 1: Update account
      const accountResponse = await dispatch(
        accountupdationApi({ accountId, formData })
      ).unwrap();

      if (!accountResponse || !accountResponse.id) {
        showErrorToast("Account update failed! Please try again.");
        onClose();
        return;
      }

      // Step 2: Handle role assignment
      if (data.role) {
        try {
          // If we have a roleAssignmentId, try to update
          if (data.roleAssignmentId) {
            const roleUpdateResponse = await dispatch(
              roleAssignUpdateApi({
                id: data.roleAssignmentId,
                role_id: data.role,
              })
            ).unwrap();

            if (!roleUpdateResponse || !roleUpdateResponse.id) {
              throw new Error("Role assignment update failed");
            }
          } else {
            const createResponse = await dispatch(
              roleAssignApi({
                executive_id: accountId,
                role_id: data.role,
              })
            ).unwrap();

            if (!createResponse || !createResponse.id) {
              showErrorToast(
                "Account updated, but role assignment creation failed!"
              );
            }
          }
        } catch (error) {
          try {
            const createResponse = await dispatch(
              roleAssignApi({
                executive_id: accountId,
                role_id: data.role,
              })
            ).unwrap();

            if (!createResponse || !createResponse.id) {
              showErrorToast(
                "Account updated, but role assignment creation failed!"
              );
            }
          } catch (createError) {
            showErrorToast("Account updated, but role assignment failed!");
          }
        }
      } else {
        showWarningToast("No role selected. Skipping role assignment.");
      }

      showSuccessToast("Account Updated successfully!");
      onCloseDetailCard();
      refreshList("refresh");
      onClose();
    } catch (error) {
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
                onFocus={() => {
                  if (!field.value) field.onChange("");
                }}
                onBlur={() => {
                  if (!field.value) field.onChange("");
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
          <TextField
            margin="normal"
            fullWidth
            label="Designation"
            {...register("designation")}
            error={!!errors.designation}
            helperText={errors.designation?.message}
            size="small"
          />

          {!isLoggedInUser && (
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
          )}

          

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
