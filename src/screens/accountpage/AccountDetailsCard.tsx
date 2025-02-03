import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountCircle as UserIcon,
  Work as WorkIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

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
      permissions: string[]; // Ensure permissions is an array
    };
  };
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
  onBack: () => void;
}

const AccountDetailsCard: React.FC<AccountCardProps> = ({
  account,
  onUpdate,
  onDelete,
  onBack,
}) => {
  // Define all possible permissions
  const allPermissions = ["manageexecutive", "managerole", "managelandmark", "managecompany"];

  return (
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
          <Typography
            variant="body2"
            color="primary"
            component="a"
            href={`tel:${account.phoneNumber}`}
            sx={{ textDecoration: "none", cursor: "pointer" }}
          >
            {account.phoneNumber}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <EmailIcon color="action" sx={{ mr: 1 }} />
          <Typography
            variant="body2"
            color="primary"
            component="a"
            href={`mailto:${account.email}`}
            sx={{ textDecoration: "none", cursor: "pointer" }}
          >
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
          <Button variant="outlined" color="primary" onClick={onBack} startIcon={<BackIcon />}>
            Back
          </Button>
          <Button variant="contained" color="success" onClick={() => onUpdate(account.id)} startIcon={<EditIcon />}>
            Save
          </Button>
          <Button variant="contained" color="error" size="small" onClick={() => onDelete(account.id)} startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default AccountDetailsCard;
