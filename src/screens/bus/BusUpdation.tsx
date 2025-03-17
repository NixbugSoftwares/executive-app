import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Container,
  CssBaseline,
} from "@mui/material";
import { useAppDispatch } from "../../store/Hooks";
import { busUpdationApi, busListApi } from "../../slices/appSlice";
import { useForm, SubmitHandler } from "react-hook-form";

type BusFormValues = {
  id: number;
  registration_number: string;
  name: string;
  capacity: number;
  model: string;
  manufactured_on: string;
  insurance_upto?: string | null;
  pollution_upto?: string | null;
  fitness_upto?: string | null;
};

interface IOperatorUpdateFormProps {
  onClose: () => void;
  refreshList: (value: any) => void;
  busId: number;
}

const BusUpdateForm: React.FC<IOperatorUpdateFormProps> = ({
  onClose,
  refreshList,
  busId,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [busData, setBusData] = useState<BusFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusFormValues>();

  // Convert UTC date to local date string (YYYY-MM-DD)
  const formatUTCDateToLocal = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Fetch bus data and reset form
  useEffect(() => {
    const fetchBusData = async () => {
      try {
        setLoading(true);
        const busses = await dispatch(busListApi()).unwrap();
        const bus = busses.find((b: any) => b.id === busId);

        if (bus) {
          setBusData(bus);
          reset({
            ...bus,
            manufactured_on: formatUTCDateToLocal(bus.manufactured_on),
            insurance_upto: formatUTCDateToLocal(bus.insurance_upto),
            pollution_upto: formatUTCDateToLocal(bus.pollution_upto),
            fitness_upto: formatUTCDateToLocal(bus.fitness_upto),
          });
        }
      } catch (error) {
        console.error("Error fetching bus data:", error);
        alert("Failed to fetch bus data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusData();
  }, [busId, dispatch, reset]);

  // Handle bus update
  const handleBusUpdate: SubmitHandler<BusFormValues> = async (data) => {
    try {
      setLoading(true);

      // Convert local date strings to UTC format
      const formatDateToUTC = (dateString: string | null): string | null => {
        if (!dateString) return null;
        return new Date(dateString).toISOString();
      };

      const formData = new FormData();
      formData.append("id", busId.toString()); // Add busId to FormData
      formData.append("registration_number", data.registration_number);
      formData.append("name", data.name);
      formData.append("capacity", data.capacity.toString());
      formData.append("model", data.model);
      formData.append("manufactured_on", formatDateToUTC(data.manufactured_on) || "");
      if (data.insurance_upto) formData.append("insurance_upto", formatDateToUTC(data.insurance_upto) || "");
      if (data.pollution_upto) formData.append("pollution_upto", formatDateToUTC(data.pollution_upto) || "");
      if (data.fitness_upto) formData.append("fitness_upto", formatDateToUTC(data.fitness_upto) || "");

      console.log("FormData being sent:", {
        id: busId, // Log busId for debugging
        registration_number: data.registration_number,
        name: data.name,
        capacity: data.capacity,
        model: data.model,
        manufactured_on: formatDateToUTC(data.manufactured_on),
        insurance_upto: formatDateToUTC(data.insurance_upto??null),
        pollution_upto: formatDateToUTC(data.pollution_upto??null),
        fitness_upto: formatDateToUTC(data.fitness_upto??null),
      });

      const updateResponse = await dispatch(busUpdationApi({ busId, formData })).unwrap();
      console.log("Bus updated:", updateResponse);
      alert("Bus updated successfully!");
      refreshList("refresh");
      onClose();
    } catch (error) {
      console.error("Error updating bus:", error);
      alert("Failed to update bus. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!busData) {
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
          Update Bus
        </Typography>
        <Box
          component="form"
          noValidate
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(handleBusUpdate)}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Registration Number"
            {...register("registration_number")}
            error={!!errors.registration_number}
            helperText={errors.registration_number?.message}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Bus Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Capacity"
            type="number"
            {...register("capacity")}
            error={!!errors.capacity}
            helperText={errors.capacity?.message}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Model"
            {...register("model")}
            error={!!errors.model}
            helperText={errors.model?.message}
            size="small"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Manufactured On"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("manufactured_on")}
            error={!!errors.manufactured_on}
            helperText={errors.manufactured_on?.message}
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Insurance Upto"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("insurance_upto")}
            error={!!errors.insurance_upto}
            helperText={errors.insurance_upto?.message}
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Pollution Upto"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("pollution_upto")}
            error={!!errors.pollution_upto}
            helperText={errors.pollution_upto?.message}
            size="small"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Fitness Upto"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("fitness_upto")}
            error={!!errors.fitness_upto}
            helperText={errors.fitness_upto?.message}
            size="small"
          />
          <Button
            type="submit"
            fullWidth
            color="primary"
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: "darkblue" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Update Bus"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BusUpdateForm;