import React, { useState } from "react";
import { Card, CardContent, CardActions, Typography, Button, Box,} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Wc as GenderIcon,
  Work as WorkIcon,
  Verified as StatusIcon,
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
  return (
    <Card sx={{ maxWidth: 400, margin: 2, boxShadow: 3 }}>
      <CardContent>
        {/* Full Name */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <PersonIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{account.fullName}</Typography>
        </Box>

        {/* Username */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <PersonIcon color="secondary" sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Username: {account.username}
          </Typography>
        </Box>

        {/* Email */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <EmailIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Email: {account.email}
          </Typography>
        </Box>

        {/* Phone Number */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <PhoneIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Phone: {account.phoneNumber}
          </Typography>
        </Box>

        {/* Gender */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <GenderIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Gender: {account.gender}
          </Typography>
        </Box>

        {/* Designation */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <WorkIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Designation: {account.designation}
          </Typography>
        </Box>

        {/* Status */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <StatusIcon color={account.status === "Active" ? "success" : "error"} sx={{ mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            Status: {account.status}
          </Typography>
        </Box>
      </CardContent>

      {/* Card Actions */}
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Back Button */}
          <Button
            variant="outlined"
            color="primary"
            onClick={onBack}
            startIcon={<BackIcon />}
          >
            Back
          </Button>

          {/* Update Button */}
          <Button
            variant="contained"
            color="success"
            onClick={() => onUpdate(account.id)}
            startIcon={<EditIcon />}
          >
            Update
          </Button>

          {/* Delete Button */}
          <Button
            variant="contained"
            color="error"
            onClick={() => onDelete(account.id)}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default AccountDetailsCard;
