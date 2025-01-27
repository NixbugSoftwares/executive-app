import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, TextField } from "@mui/material";

const AccountListingTable = () => {
  // Sample data for the table
  const data = [
    { id: 1, fullName: "John Doe", designation: "Developer", email: "john.doe@example.com" },
    { id: 2, fullName: "Jane Smith", designation: "Designer", email: "jane.smith@example.com" },
    { id: 3, fullName: "Michael Johnson", designation: "Manager", email: "michael.j@example.com" },
    { id: 4, fullName: "John Doe", designation: "Developer", email: "john.doe@example.com" },
    { id: 5, fullName: "Jane Smith", designation: "Designer", email: "jane.smith@example.com" },
    { id: 6, fullName: "Michael Johnson", designation: "Manager", email: "michael.j@example.com" },
    { id: 7, fullName: "John Doe", designation: "Developer", email: "john.doe@example.com" },
    { id: 8, fullName: "Jane Smith", designation: "Designer", email: "jane.smith@example.com" },
    { id: 9, fullName: "Michael Johnson", designation: "Manager", email: "michael.j@example.com" },
    { id: 10, fullName: "John Doe", designation: "Developer", email: "john.doe@example.com" },

  ];

  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/AccountCreationForm"); // Navigate to the desired route
  };

  // Action Handlers
  const handleView = (id: number) => {
    alert(`View clicked for user ID: ${id}`);
  };

  const handleUpdate = (id: number) => {
    alert(`Update clicked for user ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    alert(`Delete clicked for user ID: ${id}`);
  };

  return (
    <Box sx={{ width: "100%", margin: "auto", mt: 5, mb: 5 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Accounts
      </Typography>


 {/* ****************************************************** Search Bar & Account creation button ******************************************** */}
      <Box
          sx={{
            display: "flex",
            justifyContent: "left",
            alignItems: "center",
            mb: 3,
          }}
        >
          <TextField
            placeholder="Search by name, email..."
            variant="outlined"
            size="small"
            sx={{ width: "40%" }}
          />

          {/* New Account Button */}
          <Button
            sx={{ ml: 2 }}
            variant="contained"
            color="success"
            onClick={handleNavigate}
          >
            New Account
          </Button>
        </Box>


{/* ************************************************************ Account Listing Table ************************************************************ */}
      <TableContainer component={Paper} sx={{  }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Full Name</b></TableCell>
              <TableCell><b>Designation</b></TableCell>
              <TableCell><b>Email ID</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.fullName}</TableCell>
                <TableCell>{row.designation}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleView(row.id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleUpdate(row.id)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(row.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AccountListingTable;
