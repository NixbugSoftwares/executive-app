import React from "react";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import UpdateMapComponent from "./LandmarkUpdateMap";

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  initialBoundary?: string;
  editingLandmarkId?: number;
  refreshList?: (value: string) => void;
    onBoundaryUpdated?: () => void; 
}

const MapModal: React.FC<MapModalProps> = ({
  open,
  onClose,
  initialBoundary,
  editingLandmarkId,
  refreshList,
  onBoundaryUpdated

}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ height: "100%", p: 0 }}>
        <UpdateMapComponent
          initialBoundary={initialBoundary}
          onClose={onClose}
          editingLandmarkId={editingLandmarkId ?? 0}
          refreshList={refreshList}
          onBoundaryUpdated={onBoundaryUpdated}
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
