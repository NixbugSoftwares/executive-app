import React, { useEffect, useState } from "react";
import { TextField, Button, Box, Typography, Switch, Autocomplete } from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { operatorRoleCreationApi, companyListApi } from "../../slices/appSlice";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { operatorRoleCreationSchema } from "../auth/validations/authValidation";

type RoleFormValues = {
  name: string;
  companyId: number; 
  manage_bus?: boolean;
  manage_route?: boolean;
  manage_schedule?: boolean;
  manage_role?: boolean;
  manage_operator?: boolean;
  manage_company?: boolean;
};

interface IRoleCreationFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
  defaultCompanyId?: number;
}

const RoleCreationForm: React.FC<IRoleCreationFormProps> = ({ onClose, refreshList, defaultCompanyId }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);
  const filteredCompanies = defaultCompanyId ? companies.filter(company => company.id === defaultCompanyId): companies;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: yupResolver(operatorRoleCreationSchema), 
    defaultValues: {
      name: "",
      companyId: defaultCompanyId || undefined, 
      manage_bus: false,
      manage_route: false,
      manage_schedule: false,
      manage_role: false,
      manage_operator: false,
      manage_company: false,
      
    },
  });

useEffect(() => {
    dispatch(companyListApi())
      .unwrap()
      .then((res: any[]) => {
        const companyList = res.map((company) => ({ 
          id: company.id, 
          name: company.name 
        }));
        setCompanies(companyList);
      })
      .catch((err: any) => {
        console.error("Error fetching company:", err);
      });
  }, [dispatch]);

  const handleRoleCreation: SubmitHandler<RoleFormValues> = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      const companyIdToUse = defaultCompanyId || data.companyId;
      if (companyIdToUse) {
        formData.append("company_id", companyIdToUse.toString());
      }
      formData.append("manage_bus", String(data.manage_bus));
      formData.append("manage_route", String(data.manage_route));
      formData.append("manage_schedule", String(data.manage_schedule));
      formData.append("manage_role", String(data.manage_role));
      formData.append("manage_operator", String(data.manage_operator));
      formData.append("manage_company", String(data.manage_company));

      const response = await dispatch(operatorRoleCreationApi(formData)).unwrap();
      if (response?.id) {
        alert("Role created successfully!");
        refreshList("refresh");
        onClose();
      } else {
        alert("Role creation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Failed to create role. Please try again.");
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
        gap: 2,
        width: 500,
        margin: "auto",
        mt: 10,
        p: 3,
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Create Role
      </Typography>

      <Controller
        name="companyId"
        control={control}
        rules={{ required: "Company is required" }}
        render={({ field }) => (
          <Autocomplete
            options={filteredCompanies}
            getOptionLabel={(option) => option.name}
            onChange={(_event, value) => field.onChange(value ? value.id : null)}
            value={filteredCompanies.find(c => c.id === field.value) || null}
            disabled={!!defaultCompanyId && filteredCompanies.length === 1}
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

      <TextField
        label="Role Name"
        {...register("name")}
        error={!!errors.name}
        helperText={errors.name?.message}
        variant="outlined"
        size="small"
      />

      {/* Permission Toggles */}
      {([
        "manage_bus",
        "manage_route",
        "manage_schedule",
        "manage_role",
        "manage_operator",
        "manage_company",
      ] as (keyof RoleFormValues)[]).map((field) => (
        <Box key={field} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography>{field.replace("manage", "Manage ")}</Typography>
          <Controller
            name={field}
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch checked={!!value} onChange={(e) => onChange(e.target.checked)} color="success" />
            )}
          />
        </Box>
      ))}

      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
        {loading ? "Creating..." : "Create Role"}
      </Button>
    </Box>
  );
};

export default RoleCreationForm;