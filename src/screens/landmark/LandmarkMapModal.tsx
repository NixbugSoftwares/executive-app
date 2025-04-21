import React from "react";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import UpdateMapComponent from "./LandmarkUpdateMap";

interface Landmark {
  id: number;
  name: string;
  boundary: string;
}

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  initialBoundary?: string;
  onSave: (coordinates: string) => void;
  landmarks?: Landmark[];
}

const MapModal: React.FC<MapModalProps> = ({
  open,
  onClose,
  initialBoundary,
  onSave,
  landmarks = [],
}) => {
  const handleSave = (coordinates: string) => {
    onSave(coordinates);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <UpdateMapComponent
          initialBoundary={initialBoundary}
          onSave={handleSave}
          onClose={onClose}
          landmarks={landmarks}
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
