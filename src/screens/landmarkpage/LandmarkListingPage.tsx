import { useState } from "react";
import { Table, TablePagination, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import LandmarkDetailsCard from './LandmarkDetailCard';
import LandmarkAddForm from "./LandmarkAddForm";

// Define the Type for Landmarks
interface Landmark {
  id: number;
  name: string;
  location: string;
  status: "Verified" | "Verifying";
  importance: "low" | "medium" | "high";
}


const LandmarkListing = () => {
  const data : Landmark[] = [
    { id: 1, name: "Landmark1", location: "location1", status: "Verified", importance: "low" },
    { id: 2, name: "Landmark2", location: "location2", status: "Verifying", importance: "medium" },
    { id: 3, name: "Landmark3", location: "location3", status: "Verified", importance: "high" },
    { id: 4, name: "Landmark4", location: "location4", status: "Verifying", importance: "low" },
    { id: 5, name: "Landmark5", location: "location5", status: "Verified", importance: "medium" },
    { id: 6, name: "Landmark6", location: "location6", status: "Verifying", importance: "high" },
    { id: 7, name: "Landmark7", location: "location7", status: "Verified", importance: "low" },
    { id: 8, name: "Landmark8", location: "location8", status: "Verifying", importance: "medium" },
    { id: 9, name: "Landmark9", location: "location9", status: "Verified", importance: "high" },
    { id: 10, name: "Landmark10", location: "location10", status: "Verifying", importance: "low" },
    { id: 11, name: "Landmark11", location: "location11", status: "Verified", importance: "medium" },
    { id: 12, name: "Landmark12", location: "location12", status: "Verifying", importance: "high" },
  ]
  
  ;

  const [selectedLandmark, setSelectedLandmark]= useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [search, setSearch] = useState({ id: "", name: "", location: ""});
  const [page, setPage] = useState(0);
  const rowsPerPage = 7;


  const handleRowClick = (landmark: any) =>{
    setSelectedLandmark(landmark)
  }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, column: keyof typeof search) => {
      setSearch((prev) => ({ ...prev, [column]: (e.target as HTMLInputElement).value }));
    };

  const filteredData = data.filter((row) =>
    row.id.toString().toLowerCase().includes(search.id.toLowerCase()) &&
    row.name.toLowerCase().includes(search.name.toLowerCase()) &&
    row.location.toLowerCase().includes(search.location.toLowerCase()) 
  );

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    };




  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", md: "row" }, 
        width: "100%", 
        height: "100vh", 
        overflow: "hidden",
        gap: 2
      }}
    >

      <Box
        sx={{
          flex: selectedLandmark ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
          maxWidth: selectedLandmark ? { xs: "100%", md: "65%" } : "100%",
          transition: "all 0.3s ease",
          overflow: "hidden", // Disable scrolling when no account is selected
          overflowY: selectedLandmark ? "auto" : "hidden", // Enable scrolling when details card is shown
        }}
      >

        <Button
          sx={{
            ml: 'auto', 
            mr: 2,
            mb: 2,  
            display: 'block',  
          }}
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateModal(true)}
        >
          Add Landmark
        </Button>
      

      {/* landmark Listing Table */}
      
      <TableContainer component={Paper} sx={{  overflowX: "auto" }}>
          <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
            <TableHead>
              <TableRow>
                {/* Table Headers */}
                <TableCell sx={{ width: "15%" }}>
                  <b>ID</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.id}
                    onChange={(e) => handleSearchChange(e, "id")}
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{ width: "15%" }}>
                  <b>Name</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.name}
                    onChange={(e) => handleSearchChange(e, "name")}
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{ width: "30%" }}>
                  <b>Location</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.location}
                    onChange={(e) => handleSearchChange(e, "location")}
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{  }}>
                  <b>Status</b>
                </TableCell>

                <TableCell sx={{  width: "200px" }}>
                  <b>Importance</b>
                </TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{  }}>{row.id}</TableCell>
                  <TableCell
                    sx={{  cursor: "pointer", color: "blue" }}
                   onClick={() => handleRowClick(row)}
                  >
                    {row.name}
                  </TableCell>
                  <TableCell sx={{  }}>{row.location}</TableCell>
                  <TableCell sx={{ color: row.status === "Verified" ? "green" : "red" }}>{row.status}</TableCell>
                  <TableCell sx={{  }}>{row.importance}</TableCell>
                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            labelDisplayedRows={() => ''}  // Remove default label text
            ActionsComponent={({ count, page, onPageChange }) => (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button
                  onClick={(event) => onPageChange(event, page - 1)}
                  disabled={page === 0}
                  sx={{ padding: '5px 10px' }}
                >
                  &lt; {/* Left Arrow */}
                </Button>
                <Button
                  onClick={(event) => onPageChange(event, page + 1)}
                  disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                  sx={{ padding: '5px 10px' }}
                >
                  &gt; {/* Right Arrow */}
                </Button>
              </Box>
            )}
            sx={{
              display: "flex",
              justifyContent: "center", // Center the pagination
              alignItems: "center",
              padding: "10px 0",
            }}
         />
        </Box>

      {selectedLandmark && (
        <Box
          sx={{
            flex: { xs: "0 0 100%", md: "0 0 35%" },
            maxWidth: { xs: "100%", md: "35%" },
            transition: "all 0.3s ease",
            bgcolor: "grey.100",
            p: 2,
            mt: { xs: 2, md: 0 },
            overflowY: "auto", // Enable scrolling for the details card
            height: "100%",      // Ensure the card is tall enough to allow scrolling
          }}
        >
          <LandmarkDetailsCard landmark={selectedLandmark} onUpdate={() => {}} onDelete={() => {}} onBack={() => setSelectedLandmark(null)} />
        </Box>
      )}
       <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <LandmarkAddForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)} color="error">Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandmarkListing;
