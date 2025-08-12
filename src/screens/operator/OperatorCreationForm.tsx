import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { operatorCreationSchema } from "../auth/validations/authValidation";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Typography,
  Container,
  CssBaseline,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch } from "../../store/Hooks";
import {
  operatorCreationApi,
  operatorRoleListApi,
  operatorRoleAssignApi,
} from "../../slices/appSlice";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/toastMessageHelper";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";

interface IAccountFormInputs {
  username: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  gender?: number;
  companyId: number;
  role?: number;
  roleAssignmentId?: number;
}

interface IOperatorCreationFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
  defaultCompanyId?: number;
}

const genderOptions = [
  { label: "Other", value: 1 },
  { label: "Female", value: 2 },
  { label: "Male", value: 3 },
  { label: "Transgender", value: 4 },
];

const OperatorCreationForm: React.FC<IOperatorCreationFormProps> = ({
  onClose,
  refreshList,
  defaultCompanyId,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<
    { id: number; name: string; company_id: number }[]
  >([]);
  const [filteredRoles, setFilteredRoles] = useState<
    { id: number; name: string; company_id: number }[]
  >([]);
  const [showPassword, setShowPassword] = useState(false);
  const canAssignRole = useSelector((state: RootState) =>
    state.app.permissions.includes("update_op_role")
  );
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<IAccountFormInputs>({
    resolver: yupResolver(operatorCreationSchema),
    defaultValues: {
      gender: 1,
      companyId: defaultCompanyId || undefined,
    },
  });

  const selectedCompanyId = watch("companyId");

  useEffect(() => {
    dispatch(operatorRoleListApi({}))
      .unwrap()
      .then((res: { data: any[] }) => {
        setRoles(
          res.data.map((role) => ({
            id: role.id,
            name: role.name,
            company_id: role.company_id,
          }))
        );
      })

      .catch((err: any) => {
        showErrorToast(err);
      });
  }, [dispatch]);

  useEffect(() => {
    if (selectedCompanyId) {
      const filtered = roles.filter(
        (role) => role.company_id === selectedCompanyId
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles([]);
    }
  }, [selectedCompanyId, roles]);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleAccountCreation: SubmitHandler<IAccountFormInputs> = async (
    data
  ) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Use the defaultCompanyId if it exists, otherwise use the selected companyId
      const companyIdToUse = defaultCompanyId || data.companyId;
      if (companyIdToUse) {
        formData.append("company_id", companyIdToUse.toString());
      }
      formData.append("username", data.username);
      formData.append("password", data.password);
      formData.append("gender", data.gender?.toString() || "");

      if (data.fullName) formData.append("full_name", data.fullName);
      if (data.phoneNumber)
        formData.append("phone_number", `+91${data.phoneNumber}`);
      if (data.email) formData.append("email_id", data.email);

      const response = await dispatch(operatorCreationApi(formData)).unwrap();

      if (response?.id) {
        // Only attempt role assignment if role was provided and user has permission
        if (data.role && canAssignRole) {
          try {
            await dispatch(
              operatorRoleAssignApi({
                operator_id: response.id,
                role_id: data.role,
              })
            ).unwrap();
            showSuccessToast("Account created and role assigned successfully!");
          } catch (roleError) {
            showSuccessToast("Account created but role assignment failed!");
            console.error("Role assignment failed:", roleError);
          }
        } else {
          showSuccessToast("Account created without role assignment!");
        }

        refreshList("refresh");
        onClose();
      } else {
        throw new Error("Account creation failed!");
      }
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

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
          Account Creation
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(handleAccountCreation)}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
            autoFocus
            size="small"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
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

          <TextField
            margin="normal"
            fullWidth
            required
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
                placeholder="+911234567890"
                size="small"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                value={field.value ? `+91${field.value}` : ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/^\+91/, "");
                  value = value.replace(/\D/g, "");
                  if (value.length > 10) value = value.slice(0, 10);
                  field.onChange(value || undefined);
                }}
                onFocus={() => {
                  if (!field.value) field.onChange("");
                }}
                onBlur={() => {
                  if (field.value === "") field.onChange(undefined);
                }}
              />
            )}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Email"
            placeholder="example@gmail.com"
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
          {canAssignRole && (
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField
                  margin="normal"
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
                      {selectedCompanyId
                        ? "No roles available for this company"
                        : "Select a company first"}
                    </MenuItem>
                  )}
                </TextField>
              )}
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: "darkblue",
              "&:hover": {
                bgcolor: "darkblue",
                opacity: 0.9,
              },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Create Operator"
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OperatorCreationForm;
