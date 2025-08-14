import React from "react";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import UpdateMapComponent from "./LandmarkUpdateMap";



interface MapModalProps {
  open: boolean;
  onClose: () => void;
  initialBoundary?: string;
  onSave: (coordinates: string) => void;
  editingLandmarkId?: number; 
}

const MapModal: React.FC<MapModalProps> = ({
  open,
  onClose,
  initialBoundary,
  onSave,
  editingLandmarkId, 
}) => {
  const handleSave = (coordinates: string) => {
    onSave(coordinates);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ height: "100%", p: 0 }}>
        <UpdateMapComponent
        
          initialBoundary={initialBoundary}
          onSave={handleSave}
          onClose={onClose}
          editingLandmarkId={editingLandmarkId ?? 0} 
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapModal;
