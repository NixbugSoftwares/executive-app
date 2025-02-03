import React, { useState } from "react";
import { Card, CardActions, Typography, Button, Box, Avatar, Divider, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as BackIcon, Email as EmailIcon, Phone as PhoneIcon, AccountCircle as UserIcon, Work as WorkIcon, Group as GroupIcon, Person as PersonIcon, CheckCircle as CheckIcon, Cancel as CancelIcon } from "@mui/icons-material";

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
    role?: {
      roleName: string;
      permissions: string[];
    };
  };
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
  onBack: () => void;
}

const AccountDetailsCard: React.FC<AccountCardProps> = ({ account, onUpdate, onDelete, onBack }) => {
  const allPermissions = ["manageexecutive", "managerole", "managelandmark", "managecompany"];

  // State for Delete Confirmation Modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <>
      <Card sx={{ maxWidth: 450, width: "100%", margin: "auto", boxShadow: 3, p: 2 }}>
        {/* User Avatar & Info */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }}>
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
            <Typography variant="body2" color="primary">
              {account.phoneNumber}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <EmailIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="primary">
              {account.email}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PersonIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2">{account.gender}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <WorkIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2">{account.designation}</Typography>
          </Box>
        </Card>

        {/* Role & Permissions */}
        {account.role && (
          <Card sx={{ p: 2, bgcolor: "grey.100", mb: 2 }}>
            <Typography variant="h6">
              <GroupIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Role
            </Typography>
            <Typography variant="body1">
              <b>Name:</b> {account.role.roleName}
            </Typography>
            <Divider sx={{ my: 1 }} />

            {/* Permissions Section */}
            <Typography variant="body1">
              <b>Permissions:</b>
            </Typography>
            <Box sx={{ maxHeight: "250px", overflowY: "auto", mt: 1 }}>
              {allPermissions.map((perm) => (
                <Box key={perm} sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  {account.role?.permissions.includes(perm) ? (
                    <CheckIcon sx={{ color: "green", mr: 1 }} />
                  ) : (
                    <CancelIcon sx={{ color: "red", mr: 1 }} />
                  )}
                  <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                    {perm.replace(/manage/, "Manage ")}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        )}

        {/* Actions */}
        <CardActions sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" color="primary" size="small" onClick={onBack} startIcon={<BackIcon />}>
              Back
            </Button>
            <Button variant="contained" color="success" size="small" onClick={() => onUpdate(account.id)} startIcon={<EditIcon />}>
              Update
            </Button>
            <Button variant="contained" color="error" size="small" onClick={() => setDeleteConfirmOpen(true)} startIcon={<DeleteIcon />}>
              Delete
            </Button>
          </Box>
        </CardActions>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this account?</Typography>
          <Typography>
            <b>ID:</b> {account.id}, <b>Username:</b> {account.username}, <b>Full Name:</b> {account.fullName}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => onDelete(account.id)} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountDetailsCard;
