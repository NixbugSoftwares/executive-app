import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, Typography, Box, TextField, Chip 
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";  

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

  return (
    <Box sx={{ width: "100%", margin: "auto", mt: 5, mb: 5 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Land Marks
      </Typography>

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
          placeholder="Search by name..."
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
        <TableContainer component={Paper} sx={{ minWidth: 600 }}>
          <Table sx={{ width: "100%" }}>
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
                <TableRow key={row.id} sx={{ cursor: "pointer" }} hover>
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
