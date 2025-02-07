import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, TextField, Dialog, DialogActions, DialogContent, Chip, TablePagination } from "@mui/material";
import RoleDetailsCard from './RoleDetailCard';
import RoleCreatingForm from './RoleCreatingForm';


interface Role {
  id: number;
  Rolename: string;
  manageexecutive: boolean;
  managerole: boolean;
  managelandmark: boolean;
  managecompany: boolean;
}
function RoleListingPage() {
    const data : Role[] = [
        { id: 1, Rolename: "Chief Technology Officer", manageexecutive: true, managerole: false, managelandmark: true, managecompany: true  },
        { id: 2, Rolename: "Chief Information Officer (CIO)", manageexecutive: false, managerole: false, managelandmark: false, managecompany: false  },
        { id: 3, Rolename: "Project Manager", manageexecutive: false, managerole: true, managelandmark: true, managecompany: false  },
        { id: 4, Rolename: "Product Manager", manageexecutive: true, managerole: false, managelandmark: false, managecompany: true  },
        { id: 5, Rolename: "Software Engineer", manageexecutive: false, managerole: false, managelandmark: true, managecompany: false  },
        { id: 6, Rolename: "Backend Developer", manageexecutive: true, managerole: true, managelandmark: false, managecompany: true  },
        { id: 11, Rolename: "QA Engineer / Test Engineer", manageexecutive: false, managerole: false, managelandmark: false, managecompany: true },
        { id: 21, Rolename: "Data Analyst", manageexecutive: false, managerole: false, managelandmark: false, managecompany: false  },
        { id: 31, Rolename: "Technical Support Engineer", manageexecutive: true, managerole: false, managelandmark: true, managecompany: false  },
        { id: 41, Rolename: "Mobile App Developer", manageexecutive: false, managerole: true, managelandmark: false, managecompany: false  },
        { id: 51, Rolename: "Engineering Manager", manageexecutive: false, managerole: true, managelandmark: true, managecompany: true },
    
    ];


    const [selectRole, setSelectedRole]= useState(null)
    const [openCreateModal, setOpenCreateModal] = useState(false);
      const handleRowClick = (role: any) =>{
        setSelectedRole(role)
     }
  
    const [search, setSearch] = useState({ id: "", Rolename: ""});
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, column: keyof typeof search) => {
    setSearch((prev) => ({ ...prev, [column]: (e.target as HTMLInputElement).value }));
  };

      const filteredData = data.filter((row) => {
        return (
          row.id.toString().toLowerCase().includes(search.id.toLowerCase()) &&
          row.Rolename.toLowerCase().includes(search.Rolename.toLowerCase()) 
        );
      });
      
    

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
            flex: selectRole ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
            maxWidth: selectRole ? { xs: "100%", md: "65%" } : "100%",
            transition: "all 0.3s ease",
            overflow: "hidden", // Disable scrolling when no account is selected
            overflowY: selectRole ? "auto" : "hidden", // Enable scrolling when details card is shown
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
                            <TableCell sx={{ width: "10%" }}>
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
            
                            <TableCell sx={{ width: "20%" }}>
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
            
                            <TableCell sx={{  whiteSpace: selectRole ? "wrap" : "nowrap" }}>
                              <b>Manage Executive</b>

                            </TableCell>
            
                            <TableCell sx={{ whiteSpace: selectRole ? "wrap" : "nowrap" }}>
                              <b>Manage Role</b>
                            </TableCell>
            
                            <TableCell sx={{  whiteSpace: selectRole ? "wrap" : "nowrap" }}>
                              <b>Manage Landmark</b>
                            </TableCell>
            
                            <TableCell sx={{  whiteSpace: selectRole ? "wrap" : "nowrap" }}>
                              <b>Manage Company</b>
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
                            <Chip label={row.manageexecutive=== true?"Yes":"No"} variant="filled" size='small' 
                            sx={{
                              backgroundColor: row.manageexecutive === true ? "rgba(92, 184, 92, 0.4)" : "rgba(239, 1, 7, 0.4)",
                              color: row.manageexecutive === true ? "rgb(6,64,43)" : "rgb(102,0,0)",
                            }}
                            />
                            </TableCell>
                            <TableCell sx={{  }}>
                            <Chip label={row.managerole=== true?"Yes":"No"} variant="filled" size='small'
                            sx={{
                              backgroundColor: row.managerole === true ? "rgba(92, 184, 92, 0.4)" : "rgba(239, 1, 7, 0.4)",
                              color: row.managerole === true ? "rgb(6,64,43)" : "rgb(102,0,0)",
                            }}
                            />
                            </TableCell>
                            <TableCell sx={{  }}>
                            <Chip label={row.managelandmark=== true?"Yes":"No"} variant="filled" size='small'
                             sx={{
                              backgroundColor: row.managelandmark === true ? "rgba(92, 184, 92, 0.4)" : "rgba(239, 1, 7, 0.4)",
                              color: row.managelandmark === true ? "rgb(6,64,43)" : "rgb(102,0,0)",
                            }}
                            />
                            </TableCell>
                            <TableCell sx={{  }}>
                            <Chip label={row.managecompany=== true?"Yes":"No"} variant="filled" size='small'
                             sx={{
                              backgroundColor: row.managecompany === true ? "rgba(92, 184, 92, 0.4)" : "rgba(239, 1, 7, 0.4)",
                              color: row.managecompany === true ? "rgb(6,64,43)" : "rgb(102,0,0)",
                            }}
                            />
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
              {selectRole && (
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
                <RoleDetailsCard role={selectRole} onUpdate={() => {}} onDelete={() => {}} onBack={() => setSelectedRole(null)} />
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