import React, { useState } from "react";
import { Card, CardContent, CardActions, Typography, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, Avatar, Chip } from "@mui/material";
import { Diversity3 as Diversity3Icon } from "@mui/icons-material";

interface RoleCardProps {
  role: {
    id: number;
    Rolename: string;
    manageexecutive: boolean;
    managerole: boolean;
    managelandmark: boolean;
    managecompany: boolean;
  };
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
  onBack: () => void;
}

const RoleDetailsCard: React.FC<RoleCardProps> = ({ role, onBack, onDelete, onUpdate }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <>
      <Card sx={{ maxWidth: 420, margin: 2, boxShadow: 4, borderRadius: 3, p: 1  }}>
        {/* Avatar Section */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <Diversity3Icon fontSize="large" />
          </Avatar>
          <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
            {role.Rolename}
          </Typography>
        </Box>
        {/* Permissions Section */}
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
            Permissions:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, }}>
            <Chip label={`Manage Executive: ${role.manageexecutive ? "Yes" : "No"}`} color={role.manageexecutive ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Role: ${role.managerole ? "Yes" : "No"}`} color={role.managerole ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Landmark: ${role.managelandmark ? "Yes" : "No"}`} color={role.managelandmark ? "success" : "error"} variant="outlined" />
            <Chip label={`Manage Company: ${role.managecompany ? "Yes" : "No"}`} color={role.managecompany ? "success" : "error"} variant="outlined" />
          </Box>
        </CardContent>

        {/* Action Buttons */}
        <CardActions sx={{ justifyContent: "space-between", gap: 1 }}>
          <Button size="small" variant="contained" color="primary" onClick={onBack}>
            Back
          </Button>
          <Button size="small" variant="contained" color="success" onClick={() => onUpdate(role.id)}>
            Update
          </Button>
          <Button size="small" variant="contained" color="error" onClick={() => setDeleteConfirmOpen(true)}>
            Delete
          </Button>
        </CardActions>
          
      </Card>
      

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this Role?</Typography>
          <Typography>
            <b>ID:</b> {role.id}, <b>Role Name:</b> {role.Rolename}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => onDelete(role.id)} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RoleDetailsCard;
