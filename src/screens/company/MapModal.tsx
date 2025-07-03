import React, { useState} from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import MapComponent from "./map";

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    // name: string;
    lat: number;
    lng: number;
  }) => void;
  initialCoordinates?: { lat: number; lng: number }; // Add initialCoordinates prop
}

const MapModal: React.FC<MapModalProps> = ({
  open,
  onClose,
  onSelectLocation,
  initialCoordinates,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    // name: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Fetch location name when initialCoordinates changes
  

  const handleLocationSelect = (coordinates: {
    lat: number;
    lng: number;
    // name: string;
  }) => {
    setSelectedLocation({
      // name: coordinates.name,
      lat: coordinates.lat,
      lng: coordinates.lng,
    });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Select Location
        </Typography>
        <Box sx={{ height: 450, overflow: "hidden" }}>
          <MapComponent
            onSelectLocation={handleLocationSelect}
            isOpen={open}
            initialCoordinates={initialCoordinates}
          />
        </Box>
        <Button
          onClick={handleConfirm}
          disabled={!selectedLocation}
          sx={{ mt: 2 }}
        >
          Confirm
        </Button>
      </Box>
    </Modal>
  );
};

export default MapModal;
