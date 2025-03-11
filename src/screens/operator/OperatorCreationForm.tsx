import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { operatorCreationSchema } from "../auth/validations/authValidation";
import { Box, TextField, InputAdornment, IconButton, Button, Typography, Container, CssBaseline, CircularProgress, MenuItem, Autocomplete } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch } from "../../store/Hooks";
import { operatorCreationApi, companyListApi, operatorRoleListApi, operatorRoleAssignApi } from "../../slices/appSlice";

// Account creation form interface
interface IAccountFormInputs {
  username: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: number;
  companyId: number; 
  role: number; 
  roleAssignmentId?: number;
}

interface IOperatorCreationFormProps {
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

const OperatorCreationForm: React.FC<IOperatorCreationFormProps> = ({ onClose, refreshList }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<{ id: number; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IAccountFormInputs>({
    resolver: yupResolver(operatorCreationSchema),
    defaultValues: {
      gender: 4, 
    },
  });

  useEffect(() => {
      dispatch(operatorRoleListApi())
        .unwrap()
        .then((res: any[]) => {
          setRoles(res.map((role) => ({ id: role.id, name: role.name })));
          console.log("Roles>>>>>>>>>>>>>>>>>>>:", res);
        })
        
        
        .catch((err: any) => {
          console.error("Error fetching roles:", err);
        });
    }, [dispatch]);

  // Fetch companies on mount
  useEffect(() => {
    dispatch(companyListApi())
      .unwrap()
      .then((res: any[]) => {
        const companyList = res.map((company) => ({ id: company.id, name: company.name }));
        setCompanies(companyList);
        setFilteredCompanies(companyList); 
        console.log("company list>>>>>>>>>>>>>>>>>>>:", res);
      })
      .catch((err: any) => {
        console.error("Error fetching company:", err);
      });
  }, [dispatch]);

  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle Account Creation & Role Assignment 
  const handleAccountCreation: SubmitHandler<IAccountFormInputs> = async (data) => {
    console.log("Form data:", data); 
    try {
      setLoading(true);
      const formData = new FormData();
      if (data.companyId) {
        formData.append("company_id", data.companyId.toString());
      }
      formData.append("username", data.username);
      formData.append("password", data.password);
      formData.append("gender", data.gender?.toString() || "");
  
      if (data.fullName) formData.append("full_name", data.fullName);
      if (data.phoneNumber) formData.append("phone_number", `+91${data.phoneNumber}`);
      if (data.email) formData.append("email_id", data.email);
      console.log("Dispatching operatorCreationApi with form data:", formData);
      const response = await dispatch(operatorCreationApi(formData)).unwrap();
     if (response?.id) {
             // Step 2: Assign role
             const roleResponse = await dispatch(
               operatorRoleAssignApi({ operator_id: response.id, role_id: data.role })
             ).unwrap();
     
             if (roleResponse?.id && roleResponse?.role_id) {
               // Store the role assignment ID in the account object or state
               const updatedAccount = {
                 ...response,
                 roleAssignmentId: roleResponse.id, // Store the role assignment ID
               };
     
               console.log("Role Assignment ID>>>>>>>>>>>>>>>>>>>:", updatedAccount);
     
               alert("Account and role assigned successfully!");
               refreshList('refresh');
               onClose();
             } else {
               console.error("Role assignment failed:", roleResponse);
               alert("Account created, but role assignment failed!");
             }
           } else {
             console.error("Unexpected account creation response:", response);
             alert("Account creation failed!");
           }
         } catch (error) {
           console.error("Error during account creation:", error);
           alert("Something went wrong. Please try again.");
         } finally {
           setLoading(false);
         }
  };

  // Handle company search input change
  const handleCompanySearch = (_event: React.ChangeEvent<{}>, value: string) => {
    const filtered = companies.filter((company) =>
      company.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Account Creation
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleSubmit(handleAccountCreation)}>

          {/* Company Name Field with Searchable Dropdown */}
          <Controller
            name="companyId"
            control={control}
            rules={{ required: "Company is required" }}
            render={({ field }) => (
              <Autocomplete
                options={filteredCompanies}
                getOptionLabel={(option) => option.name}
                onChange={(_event, value) => field.onChange(value ? value.id : null)} 
                onInputChange={handleCompanySearch} 
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    required
                    fullWidth
                    label="Company Name"
                    error={!!errors.companyId}
                    helperText={errors.companyId?.message}
                    size="small"
                  />
                )}
              />
            )}
          />

          {/* Rest of the form fields */}
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
            autoComplete="current-password"
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
                placeholder="+911234567890"
                size="small"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                value={field.value ? `+91${field.value}` : ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/^\+91/, ""); // Remove +91 if manually entered
                  value = value.replace(/\D/g, ""); // Ensure only digits
                  if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
                  field.onChange(value || undefined); // Remove if empty
                }}
                onFocus={() => {
                  if (!field.value) field.onChange(""); // Ensure empty field is editable
                }}
                onBlur={() => {
                  if (field.value === "") field.onChange(undefined); // Remove field if empty
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
              <TextField margin="normal" fullWidth select label="Gender" {...field} error={!!errors.gender} size="small">
                {genderOptions.map((option) => (
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
          <Button
            type="submit"
            fullWidth
            color="primary"
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: "darkblue" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Create Account"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OperatorCreationForm;