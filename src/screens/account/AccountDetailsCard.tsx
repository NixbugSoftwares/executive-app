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
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountCircle as UserIcon,
  Work as WorkIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { useAppDispatch } from "../../store/Hooks";
import { accountDeleteApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import AccountUpdateForm from "./AccountUpdate";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/toastMessageHelper";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import { Account } from "../../types/type";
import moment from "moment";
interface AccountCardProps {
  account: Account;
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

const AccountDetailsCard: React.FC<AccountCardProps> = ({
  account,
  refreshList,
  onDelete,
  onBack,
  onCloseDetailCard,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const dispatch = useAppDispatch();
  const loggedInUserId = localStorageHelper.getItem("@user")?.executive_id;
  const isLoggedInUser = account.id === loggedInUserId;

  const canUpdateExecutive = useSelector((state: RootState) =>
    state.app.permissions.includes("update_executive")
  );
  const canDeleteExecutive = useSelector((state: RootState) =>
    state.app.permissions.includes("delete_executive")
  );
  const handleCloseModal = () => {
    setUpdateFormOpen(false);
  };

  const handleAccountDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("id", String(account.id));
      await dispatch(accountDeleteApi(formData)).unwrap();
      setDeleteConfirmOpen(false);
      localStorageHelper.removeStoredItem(`account_${account.id}`);
      onDelete(account.id);
      onCloseDetailCard();
      refreshList("refresh");
      showSuccessToast("Account deleted successfully!");
    } catch (error: any) {
      showErrorToast(error);
    }
  };
  const getGenderValue = (genderText: string): number | undefined => {
    const option = genderOptions.find((opt) => opt.label === genderText);
    return option?.value;
  };

  const getStatusValue = (statusText: string): number | undefined => {
    const option = statusOptions.find((opt) => opt.label === statusText);
    return option?.value;
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
            {account.fullName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            ID: {account.id} | @{account.username}
          </Typography>
        </Box>

        {/* User Contact Info */}
        <Card sx={{ p: 2, bgcolor: "grey.100", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PhoneIcon color="action" sx={{ mr: 1 }} />
            <Typography>
              <b>Phone:</b>
            </Typography>
            {account.phoneNumber ? (
              <a
                href={`tel:${account.phoneNumber.replace("tel:", "")}`}
                style={{ textDecoration: "none" }}
              >
                <Typography variant="body2" color="primary">
                  {account.phoneNumber.replace("tel:", "")}
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
            {account.email_id ? (
              <a
                href={`mailto:${account.email_id}`}
                style={{ textDecoration: "none" }}
              >
                <Typography variant="body2" color="primary">
                  {account.email_id}
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
              {account.gender ? account.gender : "Not added yet"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <WorkIcon color="action" sx={{ mr: 1 }} />
            <Typography>
              <b>Designation:</b>
            </Typography>

            <Typography variant="body2">
              {account.designation ? account.designation : "Not added yet"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <DateRangeOutlinedIcon color="action" sx={{ mr: 1 }} />

            <Typography variant="body2">
              <b> Created at:</b>
              {moment(account.created_on).local().format("DD-MM-YYYY, hh:mm A")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <DateRangeOutlinedIcon color="action" sx={{ mr: 1 }} />

            <Typography variant="body2">
              <b> Last updated at:</b>
              {moment(account?.updated_on).isValid()
                ? moment(account.updated_on)
                    .local()
                    .format("DD-MM-YYYY, hh:mm A")
                : "Not updated yet"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            {account.status === "Active" ? (
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
            justifyContent: isLoggedInUser ? "left" : "left",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Box sx={{ 
  display: "flex", 
  justifyContent: "left",
  gap: 1,
  width: "100%"
}}>
  <Button
    variant="outlined"
    color="primary"
    size="small"
    onClick={onBack}
    startIcon={<BackIcon />}
  >
    Back
  </Button>

  <Box sx={{ display: "flex", gap: 1 }}>
    {/* Only show Update button if user has permission */}
    {(canUpdateExecutive || isLoggedInUser) && (
      <Button
        variant="contained"
        color="success"
        size="small"
        onClick={() => setUpdateFormOpen(true)}
        startIcon={<EditIcon />}
        sx={{
          minWidth: 100,
          '&:disabled': {
            backgroundColor: '#81c784 !important',
            color: '#ffffff99',
          }
        }}
      >
        Update
      </Button>
    )}

    {/* Only show Delete button if user has permission AND it's not their own account */}
    {canDeleteExecutive && !isLoggedInUser && (
      <Button
        variant="contained"
        color="error"
        size="small"
        onClick={() => setDeleteConfirmOpen(true)}
        startIcon={<DeleteIcon />}
        sx={{
          minWidth: 100,
          '&:disabled': {
            backgroundColor: '#e57373 !important',
            color: '#ffffff99',
          }
        }}
      >
        Delete
      </Button>
    )}
  </Box>
</Box>
        </CardActions>
      </Card>

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
            <b>ID:</b> {account.id}, <b>Username:</b> {account.username},{" "}
            <b>Full Name:</b> {account.fullName}
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

      {/* Update Form Modal */}
      <Dialog
        open={updateFormOpen}
        onClose={() => setUpdateFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <AccountUpdateForm
            accountId={account.id}
            accountData={{
              username: account.username,
              fullName: account.fullName,
              email: account.email_id,
              phoneNumber: account.phoneNumber
                .replace(/\D/g, "")
                .replace(/^91/, ""),
              designation: account.designation,
              gender: getGenderValue(account.gender),
              status: getStatusValue(account.status),
            }}
            onClose={() => setUpdateFormOpen(false)}
            onCloseDetailCard={onCloseDetailCard}
            refreshList={(value: any) => refreshList(value)}
            canUpdateExecutive={canUpdateExecutive}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountDetailsCard;
