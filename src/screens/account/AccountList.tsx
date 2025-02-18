import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Select, MenuItem } from "@mui/material";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AccountDetailsCard from "./AccountDetailsCard";
import AccountCreationForm from "./AccountForm";
import { SelectChangeEvent } from "@mui/material";


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
    { id: 8967, fullName: "Leomessi", username: "messi10", password: "messi@123", gender: "Male", designation: "RWF", email: "messi@example.com", phoneNumber: "123-456-7890", status: "Active", role: { roleName: "Admin", permissions: [" managerole", "managelandmark "] } },
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
  const rowsPerPage = selectedAccount ? 9 :8 ;

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, column: keyof typeof search) => {
    setSearch((prev) => ({ ...prev, [column]: (e.target as HTMLInputElement).value }));
  };
    
  const handleSelectChange = (e: SelectChangeEvent<string>, _p0?: string) => {
    setSearch({ ...search, gender: e.target.value });
  };


  const filteredData = data.filter((row) =>
    row.id.toString().toLowerCase().includes(search.id.toLowerCase()) &&
    row.fullName.toLowerCase().includes(search.fullName.toLowerCase()) &&
    row.designation.toLowerCase().includes(search.designation.toLowerCase()) &&
    (!search.gender || row.gender.toLowerCase() === search.gender.toLowerCase()) &&
    row.email.toLowerCase().includes(search.email.toLowerCase()) &&
    row.phoneNumber.toLowerCase().includes(search.phoneNumber.toLowerCase())
  );

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const handleCloseModal = () => {
    setOpenCreateModal(false);
  };

  return (
    <Box 
    sx={{ 
      display: "flex", 
      flexDirection: { xs: "column", md: "row" }, 
      width: "100%", 
      height: "100vh", 
      gap: 2
    }}
    >
      
      <Box
       sx={{
        flex: selectedAccount ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
        maxWidth: selectedAccount ? { xs: "100%", md: "65%" } : "100%",
        transition: "all 0.3s ease",
        overflowY: selectedAccount ? "auto" : "hidden",
        
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
          Create Account
        </Button>


        <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {/* ID Column */}
            <TableCell><b>ID</b>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search"
                value={search.id}
                onChange={(e) => handleSearchChange(e, "id")}
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: 30,
                    padding: "4px",
                    fontSize: selectedAccount ? '0.8rem' : '1rem', 
                  },
                  "& .MuiInputBase-input": {
                    fontSize: selectedAccount ? '0.8rem' : '1rem', 
                  }
                }}
              />
            </TableCell>

            {/* Full Name Column */}
            <TableCell><b>Full Name</b>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search"
                value={search.fullName}
                onChange={(e) => handleSearchChange(e, "fullName")}
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: 30,
                    padding: "4px",
                    fontSize: selectedAccount ? '0.8rem' : '1rem',
                  },
                  "& .MuiInputBase-input": {
                    fontSize: selectedAccount ? '0.8rem' : '1rem',
                  }
                }}
              />
            </TableCell>

            {/* Designation Column */}
            <TableCell><b>Designation</b>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search"
                value={search.designation}
                onChange={(e) => handleSearchChange(e, "designation")}
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: 30,
                    padding: "4px",
                    fontSize: selectedAccount ? '0.8rem' : '1rem',
                  },
                  "& .MuiInputBase-input": {
                    fontSize: selectedAccount ? '0.8rem' : '1rem',
                  }
                }}
              />
            </TableCell>


            {/* Phone Column */}
            <TableCell><b>Phone</b>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search"
                value={search.phoneNumber}
                onChange={(e) => handleSearchChange(e, "phoneNumber")}
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: 30,
                    padding: "4px",
                    fontSize: selectedAccount ? '0.8rem' : '1rem',
                  },
                  "& .MuiInputBase-input": {
                    fontSize: selectedAccount ? '0.8rem' : '1rem',
                  }
                }}
              />
            </TableCell>

            {/* Email Column */}
            <TableCell><b>Email</b>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search"
                value={search.email}
                onChange={(e) => handleSearchChange(e, "email")}
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: 30,
                    padding: "4px",
                    fontSize: selectedAccount ? '0.8rem' : '1rem',
                  },
                  "& .MuiInputBase-input": {
                    fontSize: selectedAccount ? '0.8rem' : '1rem',
                  }
                }}
              />
            </TableCell>

            {/* Gender Column */}
            <TableCell size="small">
              <b>Gender</b>
              <FormControl fullWidth size="small">
                <Select
                  value={search.gender}
                  onChange={(e) => handleSelectChange(e, "gender")}
                  displayEmpty
                  size="small"
                  sx={{
                    fontSize: selectedAccount ? '0.8rem' : '1rem', // Adjust font size based on account selection
                    "& .MuiInputBase-root": {
                      height: 30,  // Maintain height consistency
                      padding: "4px",  // Adjust padding to match the TextField
                    },
                    "& .MuiSelect-icon": {
                      fontSize: selectedAccount ? '1rem' : '1.25rem', // Adjust dropdown icon size as needed
                    },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Transgender">Transgender</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </TableCell>

          </TableRow>

        </TableHead>
        
        <TableBody sx={{ fontSize: selectedAccount ? '0.8rem' : '1rem', whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
            const isSelected = selectedAccount?.id === row.id;

    return (
      <TableRow
      key={row.id}
      hover
      onClick={() => handleRowClick(row)}
      sx={{
        cursor: "pointer",
        backgroundColor: isSelected ? "#1565C0 !important" : "inherit",
        color: isSelected ? "white !important" : "inherit",
        "&:hover": {
          backgroundColor: isSelected ? "#1565C0 !important" : "#E3F2FD",
        },
        "& td": {
          color: isSelected ? "white !important" : "inherit",
        },
      }}
    >

      <TableCell sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AccountCircleOutlinedIcon sx={{ marginRight: 1 }} />
          {row.id}
        </Box>
      </TableCell>


      <TableCell sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {row.fullName}
      </TableCell>


      <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {row.designation}
      </TableCell>


      <TableCell sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {row.phoneNumber}
      </TableCell>


      <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {row.email}
      </TableCell>


      <TableCell sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {row.gender}
      </TableCell>
    </TableRow>
    );
  })}
</TableBody>

      </Table>
    </TableContainer>

{/* Pagination */}
<Box sx={{ display: 'flex', justifyContent: 'right', alignItems: 'right', gap: 1, mt: 1, mr: 20 }}>
  
  <Button
    onClick={() => handleChangePage(null, page - 1)}
    disabled={page === 0}
    sx={{ padding: '5px 10px', minWidth: 40 }}
  >
    &lt;
  </Button>


  {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, index) => index)
    .slice(Math.max(0, page - 1), Math.min(page + 2, Math.ceil(filteredData.length / rowsPerPage)))
    .map((pageNumber) => (
      <Button
        key={pageNumber}
        onClick={() => handleChangePage(null, pageNumber)}
        sx={{
          padding: '5px 10px',
          minWidth: 40,
          bgcolor: page === pageNumber ? "rgba(21, 101, 192, 0.2)" : "transparent",
          fontWeight: page === pageNumber ? "bold" : "normal",
          borderRadius: "5px",
          transition: "all 0.3s",
          "&:hover": {
            bgcolor: "rgba(21, 101, 192, 0.3)",
          },
        }}
      >
        {pageNumber + 1}
      </Button>
    ))}

  <Button
    onClick={() => handleChangePage(null, page + 1)}
    disabled={page >= Math.ceil(filteredData.length / rowsPerPage) - 1}
    sx={{ padding: '5px 10px', minWidth: 40 }}
  >
    &gt;
  </Button>
</Box>


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
          overflowY: "auto", 
          overflowX: "hidden", 
          height: "100%", 
        }}
      >
        <AccountDetailsCard 
          account={selectedAccount} 
          onUpdate={() => {}} 
          onDelete={() => {}} 
          onBack={() => setSelectedAccount(null)} 
        />
      </Box>
      )}
       <Dialog open={openCreateModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <AccountCreationForm onSuccess={handleCloseModal} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="error">Cancel</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AccountListingTable;
