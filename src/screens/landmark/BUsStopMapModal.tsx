import { Dialog, DialogContent } from "@mui/material";
import BusStopUpdateMap from "./BusStopUpdatemap";


interface BusStopMapModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (coordinates: string) => void;
  busStopId: number | null;
  landmarkId: number | null;
}

const BusStopMapModal: React.FC<BusStopMapModalProps> = ({
  open,
  onClose,
  onSave,
  busStopId,
  landmarkId,
}) => {

console.log("BusStopMapModal props:", { busStopId, landmarkId });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          height: "80vh",
        },
      }}
    >
      <DialogContent sx={{ height: "100%", p: 0 }}>
        <BusStopUpdateMap
          onSave={onSave}
          onClose={onClose}
          busStopId={busStopId}
          landmarkId={landmarkId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BusStopMapModal;
