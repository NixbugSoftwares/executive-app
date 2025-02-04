import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, TextField, Dialog, DialogActions, DialogContent, Chip, TablePagination } from "@mui/material";
import RoleDetailsCard from './RoleDetailCard';
import RoleCreatingForm from './RoleCreatingForm';


interface Role {
  id: number;
  Rolename: string;
  manageexecutive: string;
  managerole: string;
  managelandmark: string;
  managecompany: string;
}
function RoleListingPage() {
    const data : Role[] = [
        { id: 1, Rolename: "role name 1", manageexecutive: "YES", managerole: "NO", managelandmark: "NO", managecompany: "YES"  },
        { id: 2, Rolename: "role name 2", manageexecutive: "NO", managerole: "YES", managelandmark: "YES", managecompany: "NO"  },
        { id: 3, Rolename: "role name 3", manageexecutive: "YES", managerole: "NO", managelandmark: "YES", managecompany: "YES"  },
        { id: 4, Rolename: "role name 4", manageexecutive: "NO", managerole: "NO", managelandmark: "NO", managecompany: "NO"  },
        { id: 5, Rolename: "role name 5", manageexecutive: "YES", managerole: "YES", managelandmark: "YES", managecompany: "NO"  },
        { id: 6, Rolename: "role name 6", manageexecutive: "YES", managerole: "NO", managelandmark: "YES", managecompany: "YES"  },
        { id: 11, Rolename: "role name 1", manageexecutive: "YES", managerole: "NO", managelandmark: "NO", managecompany: "YES"  },
        { id: 21, Rolename: "role name 2", manageexecutive: "NO", managerole: "YES", managelandmark: "YES", managecompany: "NO"  },
        { id: 31, Rolename: "role name 3", manageexecutive: "YES", managerole: "NO", managelandmark: "YES", managecompany: "YES"  },
        { id: 41, Rolename: "role name 4", manageexecutive: "NO", managerole: "NO", managelandmark: "NO", managecompany: "NO"  },
        { id: 51, Rolename: "role name 5", manageexecutive: "YES", managerole: "YES", managelandmark: "YES", managecompany: "NO"  },
    
    ];


    const [selecteRole, setSelectedRole]= useState(null)
    const [openCreateModal, setOpenCreateModal] = useState(false);
      const handleRowClick = (role: any) =>{
        setSelectedRole(role)
     }
  
    const [search, setSearch] = useState({ id: "", Rolename: "", manageexecutive: "", managerole: "", managelandmark: "",  managecompany: "" });
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, column: keyof typeof search) => {
        setSearch((prev) => ({ ...prev, [column]: (e.target as HTMLInputElement).value }));
      };

      const filteredData = data.filter((row) =>
        row.id.toString().toLowerCase().includes(search.id.toLowerCase()) &&
        row.Rolename.toLowerCase().includes(search.Rolename.toLowerCase()) &&
        row.manageexecutive.toLowerCase().includes(search.manageexecutive.toLowerCase()) &&
        row.managerole.toLowerCase().includes(search.managerole.toLowerCase()) &&
        row.managelandmark.toLowerCase().includes(search.managelandmark.toLowerCase()) &&
        row.managecompany.toLowerCase().includes(search.managecompany.toLowerCase())
      );
    

      const [page, setPage] = useState(0);
      const rowsPerPage = 7;const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        if (newPage >= 0 && newPage < Math.ceil(filteredData.length / rowsPerPage)) {
          setPage(newPage);
        }
      };
      
      


    return (
        <Box
        sx={{
          display: "flex",
          flexDirection: { md: "row", xs: "column" },
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          gap: 2,
        }}
        >

        <Box  
          sx={{
            flex: selecteRole ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
            maxWidth: selecteRole ? { xs: "100%", md: "65%" } : "100%",
            transition: "all 0.3s ease",
            overflow: "hidden", // Disable scrolling when no account is selected
            overflowY: selecteRole ? "auto" : "hidden", // Enable scrolling when details card is shown
          }}>

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
              Create Role
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
                              <b>Role Name</b>
                              <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search"
                                value={search.Rolename}
                                onChange={(e) => handleSearchChange(e, "Rolename")}
                                fullWidth
                                sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                              />
                            </TableCell>
            
                            <TableCell sx={{  }}>
                              <b>Manage Executive</b>
                              <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search"
                                value={search.manageexecutive}
                                onChange={(e) => handleSearchChange(e, "manageexecutive")}
                                fullWidth
                                sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                              />
                            </TableCell>
            
                            <TableCell sx={{  }}>
                              <b>Manage Role</b>
                              <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search"
                                value={search.managerole}
                                onChange={(e) => handleSearchChange(e, "managerole")}
                                fullWidth
                                sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                              />
                            </TableCell>
            
                            <TableCell sx={{   }}>
                              <b>Manage Landmark</b>
                              <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search"
                                value={search.managelandmark}
                                onChange={(e) => handleSearchChange(e, "managelandmark")}
                                fullWidth
                                sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                              />
                            </TableCell>
            
                            <TableCell sx={{  }}>
                              <b>Manage Company</b>
                              <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search"
                                value={search.managecompany}
                                onChange={(e) => handleSearchChange(e, "managecompany")}
                                fullWidth
                                sx={{ "& .MuiInputBase-root": { height: 30, padding: "4px" } }}
                              />
                            </TableCell>
                          </TableRow>
                        </TableHead>

                      <TableBody>
                      {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row)  => (
                          <TableRow key={row.id} hover>
                            <TableCell sx={{  }}> {row.id}</TableCell>
                            <TableCell
                              sx={{  cursor: "pointer", color: "blue" }}
                              onClick={() => handleRowClick(row)}
                            >
                              {row.Rolename}
                            </TableCell> 
                            <TableCell sx={{  }}>
                            <Chip label={row.manageexecutive} color={row.manageexecutive === "YES" ? "success" : "error"} variant="outlined" />
                            </TableCell>
                            <TableCell sx={{  }}>
                            <Chip label={row.managerole} color={row.managerole === "YES" ? "success" : "error"} variant="outlined" />
                            </TableCell>
                            <TableCell sx={{  }}>
                            <Chip label={row.managelandmark} color={row.managelandmark === "YES" ? "success" : "error"} variant="outlined" />
                            </TableCell>
                            <TableCell sx={{  }}>
                            <Chip label={row.managecompany} color={row.managecompany === "YES" ? "success" : "error"} variant="outlined" />
                            </TableCell>   
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
         {selecteRole && (
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
          <RoleDetailsCard role={selecteRole} onUpdate={() => {}} onDelete={() => {}} onBack={() => setSelectedRole(null)} />
        </Box>
      )}
       <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <RoleCreatingForm />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)} color="error">Cancel</Button>
        </DialogActions>
      </Dialog>

    </Box>
    )
  }


export default RoleListingPage