import React, { useState } from "react";
import {
  Card,
  CardActions,
  Typography,
  Button,
  Box,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountCircle as UserIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { useAppDispatch } from "../../store/Hooks";
import { operatorDeleteApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/toastMessageHelper";
import FormModal from "../../common/formModal";
import AccountUpdateForm from "./UpdationForm";
import { Operator } from "../../types/type";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import moment from "moment";
interface AccountCardProps {
  operator: Operator;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onBack: () => void;
  refreshList: (value: any) => void;
  onCloseDetailCard: () => void;
}
const genderOptions = [
  { label: "Other", value: 1 },
  { label: "Female", value: 2 },
  { label: "Male", value: 3 },
  { label: "Transgender", value: 4 },
];

const statusOptions = [
  { label: "Active", value: 1 },
  { label: "Suspended", value: 2 },
];

const OperatorDetailsCard: React.FC<AccountCardProps> = ({
  operator,
  refreshList,
  onDelete,
  onBack,
  onCloseDetailCard,
}) => {
  console.log("operator", operator);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const dispatch = useAppDispatch();
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const canUpdateOperator = useSelector((state: RootState) =>
    state.app.permissions.includes("update_operator")
  );
  const canDeleteOperator = useSelector((state: RootState) =>
    state.app.permissions.includes("delete_operator")
  );
  const getGenderValue = (genderText: string): number | undefined => {
    const option = genderOptions.find((opt) => opt.label === genderText);
    return option?.value;
  };

  const getStatusValue = (statusText: string): number | undefined => {
    const option = statusOptions.find((opt) => opt.label === statusText);
    return option?.value;
  };
  const handleAccountDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("id", String(operator.id));
      await dispatch(operatorDeleteApi(formData)).unwrap();
      setDeleteConfirmOpen(false);
      localStorageHelper.removeStoredItem(`operator_${operator.id}`);
      onDelete(operator.id);
      onCloseDetailCard();
      refreshList("refresh");
      showSuccessToast("Operator deleted successfully!");
    } catch (error: any) {
      showErrorToast(error.message);
    }
  };

  return (
    <>
      <Card
        sx={{
          maxWidth: 450,
          width: "100%",
          margin: "auto",
          boxShadow: 3,
          p: 2,
        }}
      >
        {/* User Avatar & Info */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Avatar sx={{ width: 80, height: 80, bgcolor: "darkblue" }}>
            <UserIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {operator.fullName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            ID: {operator.id} | @{operator.username}
          </Typography>
        </Box>

        {/* User Contact Info */}
        <Card sx={{ p: 2, bgcolor: "grey.100", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PhoneIcon color="action" sx={{ mr: 1 }} />
            <Typography>
              <b>Phone:</b>
            </Typography>
            {operator.phoneNumber ? (
              <a
                href={`tel:${operator.phoneNumber.replace("tel:", "")}`}
                style={{ textDecoration: "none" }}
              >
                <Typography variant="body2" color="primary">
                  {operator.phoneNumber.replace("tel:", "")}
                </Typography>
              </a>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Not added yet
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <EmailIcon color="action" sx={{ mr: 1 }} />
            <Typography>
              <b>Email:</b>
            </Typography>
            {operator.email_id ? (
              <a
                href={`mailto:${operator.email_id}`}
                style={{ textDecoration: "none" }}
              >
                <Typography variant="body2" color="primary">
                  {operator.email_id}
                </Typography>
              </a>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Not added yet
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PersonIcon color="action" sx={{ mr: 1 }} />

            <Typography>
              <b>Gender:</b>
            </Typography>
            <Typography variant="body2">
              {operator.gender ? operator.gender : "Not added yet"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <DateRangeOutlinedIcon color="action" sx={{ mr: 1 }} />

            <Typography variant="body2">
              <b> Created at:</b>
              {moment(operator.created_on)
                .local()
                .format("DD-MM-YYYY, hh:mm A")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <DateRangeOutlinedIcon color="action" sx={{ mr: 1 }} />

            <Typography variant="body2">
              <b> Last updated at:</b>
              {moment(operator?.updated_on).isValid()
                ? moment(operator.updated_on)
                    .local()
                    .format("DD-MM-YYYY, hh:mm A")
                : "Not updated yet"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            {operator.status === "Active" ? (
              <>
                <ToggleOnIcon sx={{ color: "green", fontSize: 30 }} />
                <Typography sx={{ color: "green", fontWeight: "bold" }}>
                  Active
                </Typography>
              </>
            ) : (
              <>
                <ToggleOffIcon sx={{ color: "#d93550", fontSize: 30 }} />
                <Typography sx={{ color: "#d93550", fontWeight: "bold" }}>
                  Suspended
                </Typography>
              </>
            )}
          </Box>
        </Card>

        {/* Action Buttons */}
        <CardActions
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={onBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>

            {canUpdateOperator && (
              <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => {
                    setUpdateFormOpen(true);
                  }}
                  startIcon={<EditIcon />}
                  disabled={!canUpdateOperator}
                  sx={{
                    "&.Mui-disabled": {
                      backgroundColor: "#81c784 !important",
                      color: "#ffffff99",
                    },
                  }}
                >
                  Update
                </Button>)}

            {canDeleteOperator && (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => setDeleteConfirmOpen(true)}
                  startIcon={<DeleteIcon />}
                  disabled={!canDeleteOperator}
                  sx={{
                    "&.Mui-disabled": {
                      backgroundColor: "#e57373 !important",
                      color: "#ffffff99",
                    },
                  }}
                >
                  Delete
                </Button>)}
          </Box>
        </CardActions>
      </Card>
      <FormModal
        open={updateFormOpen}
        onClose={() => setUpdateFormOpen(false)}
        // title="Update Account"
      >
        <AccountUpdateForm
          operatorId={operator.id}
          company_id={operator.company_id}
          operatorData={{
            fullName: operator.fullName,
            phoneNumber: operator.phoneNumber
              .replace(/\D/g, "")
              .replace(/^91/, ""),
            email: operator.email_id,
            gender: getGenderValue(operator.gender),
            status: getStatusValue(operator.status),
            company_id: operator.company_id,
          }}
          refreshList={refreshList}
          onClose={() => setUpdateFormOpen(false)}
          onCloseDetailCard={onCloseDetailCard}
        />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this account?
          </DialogContentText>
          <Typography>
            <b>ID:</b> {operator.id}, <b>Username:</b> {operator.username},{" "}
            <b>Full Name:</b> {operator.fullName}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAccountDelete} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OperatorDetailsCard;
