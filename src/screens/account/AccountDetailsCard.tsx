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
  Tooltip,
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
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { useAppDispatch } from "../../store/Hooks";
import { accountDeleteApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import AccountUpdateForm from "./AccountUpdate";
import { showSuccessToast } from "../../common/toastMessageHelper";

interface AccountCardProps {
  account: {
    id: number;
    fullName: string;
    username: string;
    password: string;
    gender: string;
    designation: string;
    email: string;
    phoneNumber: string;
    status: string;
  };
  role?: {
    name: string;
    manage_company?: boolean;
    manage_duty?: boolean;
    manage_executive?: boolean;
    manage_landmark?: boolean;
    manage_role?: boolean;
    manage_route?: boolean;
    manage_schedule?: boolean;
    manage_service?: boolean;
    manage_vendor?: boolean;
  };
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onBack: () => void;
  refreshList: (value: any) => void;
  canManageExecutive: boolean;
  onCloseDetailCard: () => void;
}

const loggedInUser = localStorageHelper.getItem("@user");
const userId = loggedInUser?.executive_id;

const AccountDetailsCard: React.FC<AccountCardProps> = ({
  account,
  refreshList,
  onDelete,
  onBack,
  canManageExecutive,
  onCloseDetailCard,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const dispatch = useAppDispatch();
  const isLoggedInUser = account.id === userId;


  const handleCloseModal = () => {
    setUpdateFormOpen(false);
  };


  const handleAccountDelete = async () => {
    if (!account.id) {
      console.error("Error: Account ID is missing");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", String(account.id));

      const response = await dispatch(accountDeleteApi(formData)).unwrap();
      console.log("Account deleted:", response);

      setDeleteConfirmOpen(false);
      localStorageHelper.removeStoredItem(`account_${account.id}`);
      onDelete(account.id);
      onCloseDetailCard();
      refreshList("refresh");
      showSuccessToast("Account deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
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
            {account.email ? (
              <a
                href={`mailto:${account.email}`}
                style={{ textDecoration: "none" }}
              >
                <Typography variant="body2" color="primary">
                  {account.email}
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
            <Typography variant="body2">
              {account.gender ? account.gender : "Not added yet"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <WorkIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {account.designation ? account.designation : "Not added yet"}
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
            justifyContent: isLoggedInUser ? "center" : "space-between",
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

            {/* Update Button with Tooltip */}
            <Tooltip
              title={
                !canManageExecutive
                  ? "You don't have permission, contact the admin"
                  : ""
              }
              arrow
              placement="top-start"
            >
              <span
                style={{
                  cursor: !canManageExecutive ? "not-allowed" : "default",
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => {
                    setUpdateFormOpen(true);
                  }}
                  startIcon={<EditIcon />}
                  disabled={!canManageExecutive}
                  sx={{
                    "&.Mui-disabled": {
                      backgroundColor: "#81c784 !important",
                      color: "#ffffff99",
                    },
                  }}
                >
                  Update
                </Button>
              </span>
            </Tooltip>

            {/* Delete Button (Hidden for Logged-in User) */}
            {!isLoggedInUser && (
              <Tooltip
                title={
                  !canManageExecutive
                    ? "You don't have permission, contact the admin"
                    : ""
                }
                arrow
                placement="top-start"
              >
                <span
                  style={{
                    cursor: !canManageExecutive ? "not-allowed" : "default",
                  }}
                >
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => setDeleteConfirmOpen(true)}
                    startIcon={<DeleteIcon />}
                    disabled={!canManageExecutive}
                    sx={{
                      "&.Mui-disabled": {
                        backgroundColor: "#e57373 !important",
                        color: "#ffffff99",
                      },
                    }}
                  >
                    Delete
                  </Button>
                </span>
              </Tooltip>
            )}
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
            refreshList={(value: any) => refreshList(value)}
            accountId={account.id}
            onClose={() => setUpdateFormOpen(false)}
            onCloseDetailCard={onCloseDetailCard}
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
