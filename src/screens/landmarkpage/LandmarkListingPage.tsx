import { useState } from "react";
import { Table, TablePagination, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import LandmarkAddForm from "./LandmarkAddForm";
import MapComponent from "./MapComponent";
import LandmarkDetailsCard from "./LandmarkDetailCard";

// Define the Type for Landmarks
interface Landmark {
  id: number;
  name: string;
  location: string;
  status: "Verified" | "Verifying";
  importance: "low" | "medium" | "high";
}

const LandmarkListing = () => {
  const data: Landmark[] = [
    { id: 1, name: "Landmark1", location: "location1", status: "Verified", importance: "low" },
    { id: 2, name: "Landmark2", location: "location2", status: "Verifying", importance: "medium" },
    { id: 3, name: "Landmark12", location: "location12", status: "Verifying", importance: "high" },
  ];

  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [search, setSearch] = useState({ id: "", name: "", location: "" });
  const [page, setPage] = useState(0);
  const rowsPerPage = 7;

  const handleRowClick = (landmark: Landmark) => {
    setSelectedLandmark(landmark);
  };

 const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, column: keyof typeof search) => {
   setSearch((prev) => ({ ...prev, [column]: (e.target as HTMLInputElement).value }));
 };
  const filteredData = data.filter(
    (row) =>
      row.id.toString().toLowerCase().includes(search.id.toLowerCase()) &&
      row.name.toLowerCase().includes(search.name.toLowerCase()) &&
      row.location.toLowerCase().includes(search.location.toLowerCase())
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, width: "100%", height: "100vh", gap: 2 }}>
      {/* Left Side: Table */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "50%" },
          maxWidth: { xs: "100%", md: "50%" },
          transition: "all 0.3s ease",
          overflow: "hidden",
          overflowY: selectedLandmark ? "auto" : "hidden",
        }}
      >
       
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "15%" }}>
                  <b>ID</b>
                  <TextField variant="outlined" size="small" placeholder="Search" value={search.id} onChange={(e) => handleSearchChange(e, "id")} fullWidth sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }} />
                </TableCell>
                <TableCell sx={{ width: "15%" }}>
                  <b>Name</b>
                  <TextField variant="outlined" size="small" placeholder="Search" value={search.name} onChange={(e) => handleSearchChange(e, "name")} fullWidth sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }} />
                </TableCell>
                <TableCell sx={{ width: "30%" }}>
                  <b>Location</b>
                  <TextField variant="outlined" size="small" placeholder="Search" value={search.location} onChange={(e) => handleSearchChange(e, "location")} fullWidth sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }} />
                </TableCell>
                <TableCell>
                  <b>Status</b>
                </TableCell>
                <TableCell sx={{ width: "200px" }}>
                  <b>Importance</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell sx={{ cursor: "pointer", color: "blue" }} onClick={() => handleRowClick(row)}>
                    {row.name}
                  </TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell sx={{ color: row.status === "Verified" ? "green" : "red" }}>{row.status}</TableCell>
                  <TableCell>{row.importance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filteredData.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} rowsPerPageOptions={[]} labelDisplayedRows={() => ""} sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 0" }} />
      </Box>

      {/* Right Side: Map */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "50%" },
          maxWidth: { xs: "100%", md: "50%" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Map Section */}
        <Box sx={{ height: "100%", borderRadius: 2, overflow: "hidden", boxShadow: 2 }}>
          <MapComponent onDrawEnd={(coordinates) => console.log("Drawn:", coordinates)} isOpen={true} />
        </Box>
        <Button
          sx={{ ml: "auto", mr: 2, mb: 2, display: "block" }}
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateModal(true)}
        >
          Add Landmark
        </Button>

        {/* Additional Details or Selected Landmark Info */}
        {selectedLandmark && (
          <Paper sx={{ padding: 2, height: "50%", overflowY: "auto" }}>
            <LandmarkDetailsCard landmark={selectedLandmark} onBack={() => setSelectedLandmark(null)} onDelete={() => setSelectedLandmark(null)} onUpdate={() => setSelectedLandmark(null) } />
          </Paper>
        )}
      </Box>

      {/* Dialog for Adding a Landmark */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <LandmarkAddForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandmarkListing;
