import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, TextField, Chip, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";  
import LandmarkDetailsCard from './LandmarkDetailCard';


// Define the Type for Landmarks
interface Landmark {
  id: number;
  name: string;
  location: string;
  status: "verified" | "unverified";
  importance: "low" | "medium" | "high";
}

const LandmarkListing: React.FC = () => {
  const [data] = useState<Landmark[]>([
    { id: 1, name: "Landmark1", location: "location1", status: "verified", importance: "low" },
  ]);

  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/landmark/create"); 
  };

        const [open, setOpen]= useState(false)
        const [selecteRole, setSelectedLandmark]= useState(null)

  const handleRowClick = (landmark: any) =>{
    setSelectedLandmark(landmark)
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false);
    setSelectedLandmark(null);
  };

  const LandmarkDetailsModal = () => (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Account Details</DialogTitle>
      <DialogContent>
        {selecteRole && (
          <LandmarkDetailsCard
            landmark={selecteRole}
            onBack={handleClose} // Back function
            onUpdate={(id: number) => console.log("Update account", id)} // Update logic
            onDelete={(id: number) => console.log("Delete account", id)} // Delete logic
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );



  return (
    <Box sx={{ width: "100%", margin: "auto", mt: 5, mb: 5 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Land Marks
      </Typography>
      <LandmarkDetailsModal />

      {/* Search Bar & land mark Creation Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "left",
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          placeholder="Search by ID or name..."
          variant="outlined"
          size="small"
          sx={{ width: "40%" }}
        />

        <Button
          sx={{ ml: 2 }}
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleNavigate}
        >
          Add Landmark
        </Button>
      </Box>

      {/* landmark Listing Table */}
      <Box>
        <TableContainer component={Paper} >
          <Table >
            <TableHead>
              <TableRow>
                <TableCell><b>Landmark ID</b></TableCell>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Location</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Importance</b></TableCell>
                <TableCell><b>Action</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} sx={{ cursor: "pointer" }} hover onClick={() => handleRowClick(row)}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={row.status === "verified" ? "success" : "error"} 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>{row.importance}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" size="small">
                      Edit
                    </Button>
                    <Button variant="contained" color="error" size="small" sx={{ ml: 2 }}>
                      Delete  
                    </Button>
                    <Button variant="contained" color="secondary" size="small" sx={{ ml: 2 }}>
                      View
                    </Button>
                  </TableCell>  

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      
    </Box>
  );
};

export default LandmarkListing;
