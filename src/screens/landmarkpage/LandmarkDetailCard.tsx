import React, { useState } from "react";
import { Card, CardContent, CardActions, Typography, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Avatar} from "@mui/material";
import { Delete, Edit, ArrowBack, LocationOn, CheckCircle, PriorityHigh } from "@mui/icons-material";

interface LandmarkCardProps {
  landmark: {
    id: number;
    name: string;
    location: string;
    status: "Verified" | "unverified";
    importance: "low" | "medium" | "high";
  };
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
  onBack: () => void;
}

const LandmarkDetailsCard: React.FC<LandmarkCardProps> = ({ landmark, onBack, onDelete, onUpdate }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <>
      <Card sx={{ maxWidth: 420, margin: 2, boxShadow: 4, borderRadius: 3, p: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <LocationOn fontSize="large" />
          </Avatar>
          <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
            {landmark.name}
          </Typography>
        </Box>

        <CardContent>
          {/* Details */}
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationOn color="primary" />
              <Typography variant="body1">
                <b>Location:</b> {landmark.location}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle color={landmark.status === "Verified" ? "success" : "warning"} />
              <Typography variant="body1">
                <b>Status:</b> {landmark.status}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PriorityHigh color={landmark.importance === "high" ? "error" : landmark.importance === "medium" ? "warning" : "info"} />
              <Typography variant="body1">
                <b>Importance:</b> {landmark.importance}
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ justifyContent: "space-between" }}>
          <Button startIcon={<ArrowBack />} variant="contained" size="small" color="primary" onClick={onBack}>
            Back
          </Button>
          <Button startIcon={<Edit />} variant="contained" size="small" color="success" onClick={() => onUpdate(landmark.id)}>
            Update
          </Button>
          <IconButton color="error" onClick={() => setDeleteConfirmOpen(true)}>
            <Delete />
          </IconButton>
        </CardActions>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this role?</Typography>
          <Typography>
            <b>ID:</b> {landmark.id}, <b>Role Name:</b> {landmark.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => onDelete(landmark.id)} color="error" >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LandmarkDetailsCard;
