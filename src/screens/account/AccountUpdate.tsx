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
} from "../../slices/appSlice";

// Account update form interface
interface IAccountFormInputs {
  username: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: number;
  designation?: string;
  role: number;
  roleAssignmentId?: number;
  status?: number;
}

interface IAccountUpdateFormProps {
  accountId: number;
  roleAssignmentId?: number;
  onClose: () => void;
  refreshList: (value: any) => void;
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
  { label: "suspended", value: 2 },
];

const AccountUpdateForm: React.FC<IAccountUpdateFormProps> = ({
  accountId,
  onClose,
  refreshList,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [accountData, setAccountData] = useState<IAccountFormInputs | null>(
    null
  );

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
  // Fetch roles and account data
  useEffect(() => {
    dispatch(roleListApi())
      .unwrap()
      .then((res: any[]) => {
        setRoles(res.map((role) => ({ id: role.id, name: role.name })));
      })
      .catch((err: any) => {
        console.error("Error fetching roles:", err);
      });

    dispatch(accountListApi())
      .unwrap()
      .then(async (res: any[]) => {
        const account = res.find((acc) => acc.id === accountId);
        const accountpasssword = account?.password;
        console.log("accountId===============>", accountId);
        console.log("accountpasssword===============>", accountpasssword);

        if (account) {
          // Fetch role mapping for the account
          const roleMapping = await dispatch(
            fetchRoleMappingApi(accountId)
          ).unwrap();
          console.log("account===============>", account);
          console.log("Fetched Role Mapping:", roleMapping);

          setAccountData({
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
            role: roleMapping.role_id,
            roleAssignmentId: roleMapping.id,
          });

          reset({
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
            role: roleMapping.role_id,
            roleAssignmentId: roleMapping.id,
          });
        }
      })
      .catch((err: any) => {
        console.error("Error fetching account data:", err);
      });
  }, [accountId, dispatch, reset]);

  // Handle Account Update & Role Assignment Update
  const handleAccountUpdate: SubmitHandler<IAccountFormInputs> = async (
    data
  ) => {
    try {
      setLoading(true);

      console.log("Form Data:", data);

      const formData = new URLSearchParams();
      formData.append("id", accountId.toString());
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
      if (data.designation) {
        formData.append("designation", data.designation);
      }
      if (data.status) {
        formData.append("status", data.status.toString());
      }

      console.log(
        "Form Data for Account Update:",
        Object.fromEntries(formData.entries())
      );

      // Step 1: Update account
      const accountResponse = await dispatch(
        accountupdationApi({ accountId, formData })
      ).unwrap();
      console.log("Account Update Response:", accountResponse);

      if (!accountResponse || !accountResponse.id) {
        alert("Account update failed! Please try again.");
        onClose();
        return;
      }
      refreshList("refresh");

      // Step 2: Update role assignment if roleAssignmentId exists
      if (data.roleAssignmentId && data.role) {
        console.log("Calling roleAssignUpdateApi with:", {
          roleAssignmentId: data.roleAssignmentId,
          role: data.role,
        });

        try {
          const roleUpdateResponse = await dispatch(
            roleAssignUpdateApi({
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
      console.error("Error during account update:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!accountData) {
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
          Update Account
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(handleAccountUpdate)}
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
          <TextField
            margin="normal"
            fullWidth
            label="Designation"
            {...register("designation")}
            error={!!errors.designation}
            helperText={errors.designation?.message}
            size="small"
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
              "Update Account"
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AccountUpdateForm;
