import React, { useState } from "react";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";
import MapComponent from "./map";

interface MapModalProps {
  open: boolean;
  onClose: () => void;
  onSelectLocation: (location: { name: string; lat: number; lng: number }) => void;
}

const MapModal: React.FC<MapModalProps> = ({ open, onClose, onSelectLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  const handleLocationSelect = (coordinates: { lat: number; lng: number }) => {
    setSelectedLocation({ name: locationName, lat: coordinates.lat, lng: coordinates.lng });
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
      width: 400, 
      maxHeight: 450,
      overflowY: "auto", 
      bgcolor: "background.paper",
      boxShadow: 24,
      p: 3,
      borderRadius: 2, 
    }}
  >
    <Typography variant="h6" component="h2">
      Select Location
    </Typography>
    <TextField
      fullWidth
      label="Location Name"
      value={locationName}
      onChange={(e) => setLocationName(e.target.value)}
      sx={{ mb: 2 }}
    />
    <Box sx={{ height: 250, overflow: "hidden" }}>
      <MapComponent onSelectLocation={handleLocationSelect} isOpen={open} />
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