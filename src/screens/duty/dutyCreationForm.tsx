import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  CircularProgress,
  Autocomplete,
  Stack,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import {
  dutyCreationApi,
  operatorListApi,
  serviceListingApi,
} from "../../slices/appSlice";
import { showErrorToast, showSuccessToast } from "../../common/toastMessageHelper";
import { Duty } from "../../types/type";

interface IOperatorCreationFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
  companyId: number;
}

interface DropdownItem {
  id: number;
  name: string;
}

const DutyCreationForm: React.FC<IOperatorCreationFormProps> = ({
  onClose,
  refreshList,
  companyId,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [operatorList, setOperatorList] = useState<DropdownItem[]>([]);
  const [serviceList, setServiceList] = useState<DropdownItem[]>([]);

  const [operatorSearch, setOperatorSearch] = useState("");
  const [operatorPage, setOperatorPage] = useState(0);
  const [hasMoreOperators, setHasMoreOperators] = useState(true);

  const [servicePage, setServicePage] = useState(0);
  const [hasMoreServices, setHasMoreServices] = useState(true);

  const rowsPerPage = 10;
  const { handleSubmit, control, formState: { errors } } = useForm<Duty>();

  // Fetch operators
  const fetchOperators = useCallback(async (pageNumber: number, searchText = "") => {
    try {
      const offset = pageNumber * rowsPerPage;
      const res = await dispatch(operatorListApi({
        limit: rowsPerPage,
        offset,
        status: 1,
        full_name: searchText,
        company_id: companyId,
      })).unwrap();

      const operators = res.data || [];
      const formatted = operators.map((op: any) => ({
        id: op.id,
        name: op.full_name ?? op.username,
      }));

      setOperatorList(prev =>
        pageNumber === 0 ? formatted : [...prev, ...formatted]
      );
      setHasMoreOperators(operators.length === rowsPerPage);
    } catch (error: any) {
      showErrorToast(error.message || "Failed to fetch operators");
    }
  }, [dispatch, companyId, rowsPerPage]);

  // Fetch services
  const fetchServices = useCallback(async (pageNumber: number) => {
    try {
      const offset = pageNumber * rowsPerPage;
      const res = await dispatch(serviceListingApi({
        limit: rowsPerPage,
        offset,
        company_id: companyId,
        status_list: [1, 2],
      })).unwrap();

      const services = res.data || [];
      const formatted = services.map((s: any) => ({
        id: s.id,
        name: s.name ?? "-",
      }));

      setServiceList(prev =>
        pageNumber === 0 ? formatted : [...prev, ...formatted]
      );
      setHasMoreServices(services.length === rowsPerPage);
    } catch (error: any) {
      showErrorToast(error.message || "Failed to fetch services");
    }
  }, [dispatch, companyId, rowsPerPage]);

  // Initial load
  useEffect(() => {
    fetchOperators(0);
    fetchServices(0);
  }, [fetchOperators, fetchServices]);

  // Debounced operator search
  useEffect(() => {
    const timer = setTimeout(() => {
      setOperatorPage(0);
      fetchOperators(0, operatorSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [operatorSearch, fetchOperators]);

  const handleDutyCreation: SubmitHandler<Duty> = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("company_id", companyId.toString());
      formData.append("operator_id", data.operator_id.toString());
      formData.append("service_id", data.service_id.toString());

      const res = await dispatch(dutyCreationApi(formData)).unwrap();
      if (res?.id) {
        showSuccessToast("Duty created successfully!");
        refreshList("refresh");
        onClose();
      } else {
        showErrorToast("Duty creation failed.");
      }
    } catch (error: any) {
      if (error.status === 406) {
        showErrorToast("Duty already exists for this operator and service.");
      } else {
        showErrorToast(error.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOperatorScroll = (e: React.UIEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop === el.clientHeight && hasMoreOperators) {
      const next = operatorPage + 1;
      setOperatorPage(next);
      fetchOperators(next, operatorSearch);
    }
  };

  const handleServiceScroll = (e: React.UIEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop === el.clientHeight && hasMoreServices) {
      const next = servicePage + 1;
      setServicePage(next);
      fetchServices(next);
    }
  };

  // Memoize Autocomplete components
  const OperatorAutocomplete = useMemo(() => (
    <Controller
      name="operator_id"
      control={control}
      rules={{ required: "Operator is required" }}
      render={({ field }) => (
        <Autocomplete
          options={operatorList}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          value={operatorList.find((x) => x.id === field.value) || null}
          onChange={(_, val) => field.onChange(val?.id)}
          onInputChange={(_, val) => setOperatorSearch(val)}
          renderInput={(params) => (
            <TextField {...params} label="Select Operator" error={!!errors.operator_id} helperText={errors.operator_id?.message} required fullWidth />
          )}
          ListboxProps={{ onScroll: handleOperatorScroll, style: { maxHeight: 200, overflow: "auto" } }}
        />
      )}
    />
  ), [operatorList, control, errors.operator_id, handleOperatorScroll]);

  const ServiceAutocomplete = useMemo(() => (
    <Controller
      name="service_id"
      control={control}
      rules={{ required: "Service is required" }}
      render={({ field }) => (
        <Autocomplete
          options={serviceList}
          getOptionLabel={(s) => s.name}
          isOptionEqualToValue={(s, v) => s.id === v.id}
          value={serviceList.find((x) => x.id === field.value) || null}
          onChange={(_, val) => field.onChange(val?.id)}
          renderInput={(params) => (
            <TextField {...params} label="Select Service" error={!!errors.service_id} helperText={errors.service_id?.message} required fullWidth />
          )}
          ListboxProps={{ onScroll: handleServiceScroll, style: { maxHeight: 200, overflow: "auto" } }}
        />
      )}
    />
  ), [serviceList, control, errors.service_id, handleServiceScroll]);

  const SubmitButton = useMemo(() => (
    <Button
      type="submit"
      variant="contained"
      color="primary"
      sx={{ minWidth: 150, bgcolor: "darkblue" }}
      disabled={loading}
    >
      {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Create Duty"}
    </Button>
  ), [loading]);

  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <Box sx={{ mt: 4, mb: 4, px: 2, py: 3, borderRadius: 2, backgroundColor: "#f9f9f9", boxShadow: 3 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Duty Creation
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit(handleDutyCreation)}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
            <Box flex={1}>{OperatorAutocomplete}</Box>
            <Box flex={1}>{ServiceAutocomplete}</Box>
          </Stack>
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            {SubmitButton}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default DutyCreationForm;
