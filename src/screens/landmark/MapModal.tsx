import React from "react";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import UpdateMapComponent from "./updateMap";

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  initialBoundary?: string;
  onSave: (coordinates: string) => void;
}

const MapModal: React.FC<MapModalProps> = ({ open, onClose, initialBoundary, onSave }) => {
  const handleSave = (coordinates: string) => {
    onSave(coordinates);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md"  fullWidth>
      <DialogContent>
        <UpdateMapComponent initialBoundary={initialBoundary} onSave={handleSave} onClose={function (): void {
          throw new Error("Function not implemented.");
        } } />
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