import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import AccountDetailsCard from "./AccountDetailsCard";  

const AccountListingTable = () => {

  const data = [
    { id: 1, fullName: "Rihab Shihan", username: "rihab", password: "rihab@123", gender: "Male", designation: "React Native", email: "rihab@example.com", phoneNumber: "123-456-7890", status: "Active" },
    { id: 2, fullName: "Ashin joseph", username: "Ashin", password: "ashin123", gender: "Female", designation: "Python", email: "ashin@example.com", phoneNumber: "987-654-3210", status: "Active" },
    { id: 3, fullName: "Reshma R", username: "reshma ", password: "reshma123", gender: "Female", designation: "python", email: "rershma@example.com", phoneNumber: "555-555-5555", status: "Active" },
    { id: 4, fullName: "Al mehaboob", username: " mehaboob ", password: "al123", gender: "Male", designation: "React", email: "allu@example.com", phoneNumber: "2345678901", status: "Active" },
    { id: 5, fullName: "Thinkal VB", username: "tinkal ", password: "thinkal123", gender: "Male", designation: "Python", email: "thinkal@example.com", phoneNumber: "555-555-5555", status: "inactive" },
    { id: 6, fullName: "subin Raj", username: "subin ", password: "subin123", gender: "Male", designation: "React-Native", email: "subin@example.com", phoneNumber: "555-555-5555", status: "inactive" },
    { id: 7, fullName: "Ganesh Parthan", username: "ganeshan ", password: "ganeshan123", gender: "Male", designation: "python", email: "ganeshan@example.com", phoneNumber: "555-555-5555", status: "inactive" },
  ];

  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/AccountCreationForm"); 
  };

 
  const [open, setOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Function to handle row click
  const handleRowClick = (account: any) => {
    setSelectedAccount(account);
    setOpen(true);  // Open modal on row click
  };

  // Close the modal
  const handleClose = () => {
    setOpen(false);
    setSelectedAccount(null);
  };

  // Modal with Account Details (Card)
  const AccountDetailsModal = () => (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Account Details</DialogTitle>
      <DialogContent>
        {selectedAccount && (
          <AccountDetailsCard
            account={selectedAccount}
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
        Accounts
      </Typography>

      {/* Search Bar & Account Creation Button */}
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

      {/* Account Listing Table */}
      <Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>User Name</b></TableCell>
                <TableCell><b>Email ID</b></TableCell>
                <TableCell><b>Designation</b></TableCell>
                <TableCell><b>Status</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id} sx={{ cursor: "pointer" }} hover onClick={() => handleRowClick(row)}>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.designation}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Account Details Modal */}
      <AccountDetailsModal />
    </Box>
  );
};

export default AccountListingTable;
