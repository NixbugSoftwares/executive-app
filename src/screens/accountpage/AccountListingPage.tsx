import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Box, Button, Typography, Stack } from "@mui/material";
import { Edit as EditIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AccountDetailsCard from "./AccountDetailsCard";
import { Add as AddIcon } from "@mui/icons-material";

interface Account {
  id: number;
  fullName: string;
  username: string;
  password: string;
  gender: string;
  designation: string;
  email: string;
  phoneNumber: string;
  status: string;
}

const AccountListingTable = () => {
  const data: Account[] = [
    { id: 1, fullName: "Rihab Shihan", username: "rihab", password: "rihab@123", gender: "Male", designation: "React Native", email: "rihab@example.com", phoneNumber: "123-456-7890", status: "Active" },
    { id: 2, fullName: "Ashin joseph", username: "Ashin", password: "ashin123", gender: "Female", designation: "Python", email: "ashin@example.com", phoneNumber: "987-654-3210", status: "Active" },
    { id: 3, fullName: "Reshma R", username: "reshma ", password: "reshma123", gender: "Female", designation: "python", email: "rershma@example.com", phoneNumber: "555-555-5555", status: "Active" },
    { id: 4, fullName: "Al Mehaboob", username: " mehaboob ", password: "al123", gender: "Male", designation: "React", email: "allu@example.com", phoneNumber: "2345678901", status: "Active" },
    { id: 5, fullName: "Thinkal VB", username: "thinkal ", password: "thinkal123", gender: "Male", designation: "Python", email: "thinkal@example.com", phoneNumber: "555-555-5555", status: "inactive" },
    { id: 6, fullName: "subin Raj", username: "subin ", password: "subin123", gender: "Male", designation: "React-Native", email: "subin@example.com", phoneNumber: "555-555-5555", status: "inactive" },
    { id: 7, fullName: "Ganesh Parthan", username: "ganeshan ", password: "ganeshan123", gender: "Male", designation: "python", email: "ganeshan@example.com", phoneNumber: "555-555-5555", status: "inactive" },
  ];

  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/account/create");
  };

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [search, setSearch] = useState({ id: "", fullName: "", designation: "", gender: "" });

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, column: string) => {
    setSearch((prev) => ({ ...prev, [column]: (e.target as HTMLInputElement).value }));
  };
  

  // **🔹 Filter Data Based on Search Input**
  const filteredData = data.filter((row) =>
    row.id.toString().toLowerCase().includes(search.id.toLowerCase()) &&
    row.fullName.toLowerCase().includes(search.fullName.toLowerCase()) &&
    row.designation.toLowerCase().includes(search.designation.toLowerCase()) &&
    row.gender.toLowerCase().includes(search.gender.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* Table Section - Default 80%, Shrinks to 60% when details are visible */}
      <Box
        sx={{
          flex: selectedAccount ? "0 0 60%" : "0 0 80%",
          maxWidth: selectedAccount ? "60%" : "80%",
          transition: "all 0.3s ease",
          overflow: "hidden",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Accounts
        </Typography>
        <Button sx={{ ml: 2 }} variant="contained" color="success" startIcon={<AddIcon />} onClick={handleNavigate}>
          Create Account
        </Button>

        <TableContainer component={Paper} sx={{ border: "1px thin gray", overflow: "hidden" }}>
          <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ border: "1px thin gray" }}>
                  <b>ID</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search here"
                    value={search.id}
                    onChange={(e) => handleSearchChange(e, "id")}
                    fullWidth
                    onClick={(e) => e.stopPropagation()} // Prevents row click event
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{ border: "1px thin gray" }}>
                  <b>Full Name</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search here"
                    value={search.fullName}
                    onChange={(e) => handleSearchChange(e, "fullName")}
                    fullWidth
                    onClick={(e) => e.stopPropagation()} // Prevents row click event
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{ border: "1px thin gray" }}>
                  <b>Designation</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search here"
                    value={search.designation}
                    onChange={(e) => handleSearchChange(e, "designation")}
                    fullWidth
                    onClick={(e) => e.stopPropagation()} // Prevents row click event
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{ border: "1px thin gray" }}>
                  <b>Gender</b>
                </TableCell>
                <TableCell sx={{ border: "1px thin gray" }}>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id} hover sx={{ cursor: "pointer" }} onClick={() => handleRowClick(row)}>
                  <TableCell sx={{ border: "1px thin gray" }}>
                    <AccountCircleOutlinedIcon /> {row.id}
                  </TableCell>
                  <TableCell sx={{ border: "1px thin gray" }}>{row.fullName}</TableCell>
                  <TableCell sx={{ border: "1px thin gray" }}>{row.designation}</TableCell>
                  <TableCell sx={{ border: "1px thin gray" }}>{row.gender}</TableCell>
                  <TableCell sx={{ border: "1px thin gray" }}>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" color="info" size="small" startIcon={<VisibilityIcon />} onClick={(e) => e.stopPropagation()}></Button>
                      <Button variant="outlined" color="secondary" size="small" startIcon={<EditIcon />} onClick={(e) => e.stopPropagation()}></Button>
                      <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={(e) => e.stopPropagation()}></Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Right Panel - Initially Hidden, Appears at 40% when a row is clicked */}
      {selectedAccount && (
        <Box sx={{ flex: "0 0 40%", maxWidth: "40%", transition: "all 0.3s ease", bgcolor: "grey.100", p: 2, ml: 2 }}>
          <AccountDetailsCard account={selectedAccount} onUpdate={() => {}} onDelete={() => {}} onBack={() => setSelectedAccount(null)} />
        </Box>
      )}
    </Box>
  );
};

export default AccountListingTable;
