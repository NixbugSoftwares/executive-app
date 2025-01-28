import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Chip } from "@mui/material";
import {  Add as AddIcon } from "@mui/icons-material"
import { useNavigate } from 'react-router-dom';
import RoleDetailsCard from './RoleDetailCard';
function RoleListingPage() {
    const data = [
        { roleid: 1, Rolename: "role name 1", manageexecutive: "YES", managerole: "NO", managelandmark: "NO", managecompany: "YES"  },
        { roleid: 2, Rolename: "role name 2", manageexecutive: "NO", managerole: "YES", managelandmark: "YES", managecompany: "NO"  },
        { roleid: 3, Rolename: "role name 3", manageexecutive: "YES", managerole: "NO", managelandmark: "YES", managecompany: "YES"  },
        { roleid: 4, Rolename: "role name 4", manageexecutive: "NO", managerole: "NO", managelandmark: "NO", managecompany: "NO"  },
        { roleid: 5, Rolename: "role name 5", manageexecutive: "YES", managerole: "YES", managelandmark: "YES", managecompany: "NO"  },
        { roleid: 6, Rolename: "role name 6", manageexecutive: "YES", managerole: "NO", managelandmark: "YES", managecompany: "YES"  }
    
    ];
      const navigate = useNavigate();
      const handleNavigate = () => {
        navigate("/exerole/create");
      }

      const [open, setOpen]= useState(false)
      const [selecteRole, setSelectedRole]= useState(null)

      const handleRowClick = (role: any) =>{
        setSelectedRole(role)
        setOpen(true)
      }
      const handleClose = () => {
        setOpen(false);
        setSelectedRole(null);
      };
      const RoleDetailsModal = () => (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Account Details</DialogTitle>
          <DialogContent>
            {selecteRole && (
              <RoleDetailsCard
                role={selecteRole}
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
              placeholder="Search by Role ID or Name..."
              variant="outlined"
              size="small"
              sx={{ width: "40%" }}
            />
    
            {/* New Account Button */}
            <Button
              sx={{ ml: 2 }}
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleNavigate}
            >
              Add Role
            </Button>
          </Box>
    
          {/* Account Listing Table */}
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Role  ID</b></TableCell>
                    <TableCell><b>Role Name</b></TableCell>
                    <TableCell><b>Manage Executive</b></TableCell>
                    <TableCell><b>Manage Role</b></TableCell>
                    <TableCell><b>Manage Landmark</b></TableCell>
                    <TableCell><b>Manage Company</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.roleid} sx={{ cursor: "pointer" }} hover onClick={() => handleRowClick(row)}>
                      <TableCell>{row.roleid}</TableCell>
                      <TableCell>{row.Rolename}</TableCell>
                      <TableCell>
                        <Chip label={row.manageexecutive} color={row.manageexecutive === "YES" ? "success" : "error"} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={row.managerole} color={row.managerole === "YES" ? "success" : "error"} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={row.managelandmark} color={row.managelandmark === "YES" ? "success" : "error"} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={row.managecompany} color={row.managecompany === "YES" ? "success" : "error"} variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <RoleDetailsModal/>
    
        </Box>
  )
}

export default RoleListingPage