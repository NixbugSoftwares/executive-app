import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Box, Button, TablePagination, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AccountDetailsCard from "./AccountDetailsCard";
import AccountCreationForm from "./AccountForm";


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
  role: {
    roleName: string;
    permissions: string[];
  };
};

const AccountListingTable = () => {
  const data: Account[] = [
    { id: 1309, fullName: "Rihab Shihan", username: "rihab", password: "rihab@123", gender: "Male", designation: "React Native", email: "rihab@example.com", phoneNumber: "123-456-7890", status: "Active", role: { roleName: "Admin", permissions: [" managerole", "managelandmark "] } },
    { id: 2572, fullName: "Ashin Joseph", username: "ashin", password: "ashin123", gender: "Female", designation: "Python", email: "ashin@example.com", phoneNumber: "987-654-3210", status: "Active", role: { roleName: "Admin", permissions: ["manageexecutive", "managelandmark", "managecompany"] } },
    { id: 3509, fullName: "Reshma", username: "reshma", password: "reshma@123", gender: "Female", designation: "Devops", email: "reshma@example.com", phoneNumber: "123-7890-456", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive", "managelandmark"] } },
    { id: 4567, fullName: "Al Mehaboob", username: "mehaboob", password: "mehaboob@123", gender: "Male", designation: "React", email: "mehaboob@example.com", phoneNumber: "859-2805-065", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive", "managerole", "managelandmark"] } },
    { id: 5098, fullName: "Thinkal VB", username: "thinkal ", password: "thinkal123", gender: "Male", designation: "Python", email: "thinkal@example.com", phoneNumber: "872-555-0978", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive", "managerole", "managelandmark", "managecompany"] } },
    { id: 6287, fullName: "subin Raj", username: "subin ", password: "subin123", gender: "Male", designation: "React-Native", email: "subin@example.com", phoneNumber: "555-555-5555", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive, managerole", "managelandmark", "managecompany"] } },
    { id: 7990, fullName: "Ganesh Parthan", username: "ganeshan ", password: "ganeshan123", gender: "Male", designation: "python", email: "ganeshan@example.com", phoneNumber: "7890-555-123", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive", "managerole", "managelandmark", "managecompany"] } },
    { id: 8967, fullName: "Leomessi", username: "messi10", password: "messi@123", gender: "Male", designation: "RWF", email: "rihab@example.com", phoneNumber: "123-456-7890", status: "Active", role: { roleName: "Admin", permissions: [" managerole", "managelandmark "] } },
    { id: 4565, fullName: "C.ronaldo", username: "cr7", password: "cr@123", gender: "Male", designation: "CF", email: "cr@example.com", phoneNumber: "987-654-3210", status: "Active", role: { roleName: "Admin", permissions: ["manageexecutive", "managelandmark", "managecompany"] } },
    { id: 9900, fullName: "Neymar", username: "neymar11", password: "neymar@123", gender: "Male", designation: "LWF", email: "ney@example.com", phoneNumber: "123-7890-456", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive", "managelandmark"] } },
    { id: 1765, fullName: "D.Maradona", username: "maradona10", password: "maradona@123", gender: "Male", designation: "AMF", email: "mardona@example.com", phoneNumber: "859-2805-065", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive", "managerole", "managelandmark"] } },
    { id: 6623, fullName: "J.cryuff", username: "cruyff", password: "cruyf@123", gender: "Male", designation: "SS", email: "cruyf@example.com", phoneNumber: "872-555-0978", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive", "managerole", "managelandmark", "managecompany"] } },
    { id: 9009, fullName: "Z.Zidane", username: "zidane ", password: "zidane123", gender: "Male", designation: "AMF", email: "zidane@example.com", phoneNumber: "555-555-5555", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive, managerole", "managelandmark", "managecompany"] } },
    { id: 2232, fullName: "Lamin Yamal", username: "yamal ", password: "yamal123", gender: "Male", designation: "RWF", email: "yamal@example.com", phoneNumber: "7890-555-123", status: "inactive", role: { roleName: "Admin", permissions: ["manageexecutive", "managerole", "managelandmark", "managecompany"] } },
  
  ];
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [search, setSearch] = useState({ id: "", fullName: "", designation: "", gender: "", email: "", phoneNumber: "" });

  const [page, setPage] = useState(0);
  const rowsPerPage = 7;

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, column: keyof typeof search) => {
    setSearch((prev) => ({ ...prev, [column]: (e.target as HTMLInputElement).value }));
  };

  const filteredData = data.filter((row) =>
    row.id.toString().toLowerCase().includes(search.id.toLowerCase()) &&
    row.fullName.toLowerCase().includes(search.fullName.toLowerCase()) &&
    row.designation.toLowerCase().includes(search.designation.toLowerCase()) &&
    row.gender.toLowerCase().includes(search.gender.toLowerCase()) &&
    row.email.toLowerCase().includes(search.email.toLowerCase()) &&
    row.phoneNumber.toLowerCase().includes(search.phoneNumber.toLowerCase())
  );

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const [openCreateModal, setOpenCreateModal] = useState(false);


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
          flex: selectedAccount ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
          maxWidth: selectedAccount ? { xs: "100%", md: "65%" } : "100%",
          transition: "all 0.3s ease",
          overflow: "hidden", // Disable scrolling when no account is selected
          overflowY: selectedAccount ? "auto" : "hidden", // Enable scrolling when details card is shown
        }}
      >

        <Button
          sx={{
            ml: 'auto', 
            mb: 2,  
            display: 'block',  
          }}
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateModal(true)}
        >
          Create Account
        </Button>


        <TableContainer component={Paper} sx={{  overflowX: "auto" }}>
          <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
            <TableHead>
              <TableRow>
                {/* Table Headers */}
                <TableCell sx={{  }}>
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

                <TableCell sx={{  }}>
                  <b>Full Name</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.fullName}
                    onChange={(e) => handleSearchChange(e, "fullName")}
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{  }}>
                  <b>Designation</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.designation}
                    onChange={(e) => handleSearchChange(e, "designation")}
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{  }}>
                  <b>Gender</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.gender}
                    onChange={(e) => handleSearchChange(e, "gender")}
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{  width: "200px" }}>
                  <b>Phone</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.phoneNumber}
                    onChange={(e) => handleSearchChange(e, "phoneNumber")}
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>

                <TableCell sx={{  }}>
                  <b>Email</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.email}
                    onChange={(e) => handleSearchChange(e, "email")}
                    fullWidth
                    sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                  />
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{  }}><AccountCircleOutlinedIcon /> {row.id}</TableCell>
                  <TableCell
                    sx={{  cursor: "pointer", color: "blue" }}
                    onClick={() => handleRowClick(row)}
                  >
                    {row.fullName}
                  </TableCell>
                  <TableCell sx={{  }}>{row.designation}</TableCell>
                  <TableCell sx={{  }}>{row.gender}</TableCell>
                  <TableCell sx={{  }}>{row.phoneNumber}</TableCell>
                  <TableCell sx={{  }}>{row.email}</TableCell>   
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
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

      {/* Right Side - Account Details Card */}
      {selectedAccount && (
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
          <AccountDetailsCard account={selectedAccount} onUpdate={() => {}} onDelete={() => {}} onBack={() => setSelectedAccount(null)} />
        </Box>
      )}
       <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <AccountCreationForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)} color="error">Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountListingTable;
