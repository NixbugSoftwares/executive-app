import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import BusStopUpdateMap from "./updatemap";

interface BusStop {
  id: number;
  name: string;
  location: string;
  status?: string;
}

interface BusStopMapModalProps {
  open: boolean;
  onClose: () => void;
  initialLocation?: string;
  onSave: (coordinates: string) => void;
  busStops?: BusStop[];
}

const BusStopMapModal: React.FC<BusStopMapModalProps> = ({
  open,
  onClose,
  initialLocation,
  onSave,
  busStops = [],
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          height: "80vh",
          maxHeight: "800px",
        },
      }}
    >
      <DialogContent sx={{ height: "100%", p: 0 }}>
        <BusStopUpdateMap
          initialLocation={initialLocation}
          onSave={onSave}
          onClose={onClose}
          busStops={busStops}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BusStopMapModal;