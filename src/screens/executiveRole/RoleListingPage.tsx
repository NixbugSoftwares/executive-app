import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer,TableHead, TableRow,Paper, Button, Box, TextField, Dialog, DialogActions, DialogContent, Tooltip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RoleDetailsCard from "./RoleDetailCard";
import RoleCreatingForm from "./RoleCreatingForm";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/Store";
import { roleListApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";

interface Role {
  id: number;
  name: string;
  manageExecutive?: boolean;
  manageRole?: boolean;
  manageLandmark?: boolean;
  manageCompany?: boolean;
  manageVendor?: boolean;
  manageRoute?: boolean;
  manageSchedule?: boolean;
  manageService?: boolean;
  manageDuty?: boolean;
}

const RoleListingTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [selectRole, setSelectedRole] = useState<Role | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [search, setSearch] = useState({ id: "", Rolename: "" });

  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageRole = roleDetails?.manage_role || false;

  const fetchRoleList = () => {
    dispatch(roleListApi())
      .unwrap()
      .then((res: any[]) => {
        const formattedRoles = res.map((role: any) => ({
          id: role.id,
          name: role.name,
          manageExecutive: role.manage_executive,
          manageRole: role.manage_role,
          manageLandmark: role.manage_landmark,
          manageCompany: role.manage_company,
          manageVendor: role.manage_vendor,
          manageRoute: role.manage_route,
          manageSchedule: role.manage_schedule,
          manageService: role.manage_service,
          manageDuty: role.manage_duty,
        }));
        setRoleList(formattedRoles);
      })
      .catch((err: any) => console.error("Error fetching roles:", err));
  };

  useEffect(() => {
    fetchRoleList();
  }, []);

  const filteredData = roleList.filter(
    (row) =>
      row.id.toString().includes(search.id) &&
      row.name.toLowerCase().includes(search.Rolename.toLowerCase())
  );

  const [page, setPage] = useState(0);
  const rowsPerPage = selectRole?7: 6;

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    if (newPage >= 0 && newPage < Math.ceil(filteredData.length / rowsPerPage)) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    column: keyof typeof search
  ) => {
    setSearch((prev) => ({ ...prev, [column]: e.target.value }));
  };

  const handleRowClick = (role: Role) => {
    setSelectedRole(role);
  };

  const handleCloseModal = () => {
    setOpenCreateModal(false);
  };

  const refreshList = (value: string) => {
    if (value === "refresh") {
      console.log("Account list refreshed...");
      fetchRoleList();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: "100%",
        height: "100vh",
        gap: 2,
      }}
    >
      {/* Table Section */}
      <Box
        sx={{
          flex: selectRole ? { xs: "0 0 100%", md: "0 0 50%" } : "0 0 100%",
          maxWidth: selectRole ? { xs: "100%", md: "50%" } : "100%",
          transition: "all 0.3s ease",
          overflowX: "auto", 
          overflowY: "auto", 
        }}
      >
        {/* Create Role Button */}
        <Tooltip
          title={!canManageRole ? "You don't have permission, contact the admin" : ""}
          placement="top-end"
        >
          <span style={{ cursor: !canManageRole ? "not-allowed" : "default" }}>
            <Button
              sx={{
                ml: "auto",
                mr: 2,
                mb: 2,
                display: "block",
                backgroundColor: !canManageRole ? "#6c87b7 !important" : "#3f51b5",
                color: "white",
                "&.Mui-disabled": {
                  backgroundColor: "#6c87b7 !important",
                  color: "#ffffff99",
                },
              }}
              variant="contained"
              onClick={() => setOpenCreateModal(true)}
              disabled={!canManageRole}
            >
              Create Role
            </Button>
          </span>
        </Tooltip>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
           <TableHead>
            <TableRow>
              <TableCell>
                <b style={{ display: "block", textAlign: "center" }}>ID</b>
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
                      textAlign: "center",
                      fontSize: "1rem", 
                    },
                    "& .MuiInputBase-input": {
                      textAlign: "center",
                      fontSize: "1rem", 
                    },
                  }}
                />
              </TableCell>

              <TableCell>
                <b style={{ display: "block", textAlign: "center" }}>Role Name</b>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search"
                  value={search.Rolename}
                  onChange={(e) => handleSearchChange(e, "Rolename")}
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: 30,
                      padding: "4px",
                      textAlign: "center",
                      fontSize: "1rem", 
                    },
                    "& .MuiInputBase-input": {
                      textAlign: "center",
                      fontSize: "1rem",
                    },
                  }}
                />
              </TableCell>

              {[
                "Executive",
                "Role",
                "Landmark",
                "Company",
                "Vendor",
                "Route",
                "Schedule",
                "Service",
                "Duty",
              ].map((permission) => (
                <TableCell key={permission} align="center" sx={{ width: "8%"  }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>Manage</Typography>
                    <Typography variant="caption" sx={{ fontWeight: "bold" }}>{permission}</Typography>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
           </TableHead>

           <TableBody>
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const isSelected = selectRole?.id === row.id;

                    return (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => handleRowClick(row)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#E3F2FD !important" : "inherit", 
                          "&:hover": {
                            backgroundColor: isSelected ? "#E3F2FD !important" : "#F5F5F5", 
                          },
                        }}
                      >
                        <TableCell>{row.id}</TableCell>
                        <TableCell sx={{ cursor: "pointer"  }}>{row.name}</TableCell>

                        {[
                          "manageExecutive",
                          "manageRole",
                          "manageLandmark",
                          "manageCompany",
                          "manageVendor",
                          "manageRoute",
                          "manageSchedule",
                          "manageService",
                          "manageDuty",
                        ].map((key) => (
                          <TableCell key={key} align="center">
                            {row[key as keyof Role] ? (
                              <CheckCircleIcon sx={{ color: "#228B22" }} />
                            ) : (
                              <CancelIcon sx={{ color: "#DE3163" }} />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "right",
            alignItems: "right",
            gap: 1,
            mt: 1,
            mr: 20,
          }}
        >
          <Button
            onClick={() => handleChangePage(null, page - 1)}
            disabled={page === 0}
            sx={{ padding: "5px 10px", minWidth: 40 }}
          >
            &lt;
          </Button>
          {Array.from(
            { length: Math.ceil(filteredData.length / rowsPerPage) },
            (_, index) => index
          )
            .slice(
              Math.max(0, page - 1),
              Math.min(page + 2, Math.ceil(filteredData.length / rowsPerPage))
            )
            .map((pageNumber) => (
              <Button
                key={pageNumber}
                onClick={() => handleChangePage(null, pageNumber)}
                sx={{
                  padding: "5px 10px",
                  minWidth: 40,
                  bgcolor: page === pageNumber ? "rgba(97, 97, 97, 0.2)" : "transparent",
                  fontWeight: page === pageNumber ? "bold" : "normal",
                  borderRadius: "5px",
                  transition: "all 0.3s",
                  "&:hover": {
                    bgcolor: "rgba(97, 97, 97, 0.3)",
                  },
                }}
              >
                {pageNumber + 1}
              </Button>
            ))}
          <Button
            onClick={() => handleChangePage(null, page + 1)}
            disabled={page >= Math.ceil(filteredData.length / rowsPerPage) - 1}
            sx={{ padding: "5px 10px", minWidth: 40 }}
          >
            &gt;
          </Button>
        </Box>
      </Box>

      {/* Side Panel for Role Details */}
      {selectRole && (
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
          <RoleDetailsCard
            role={selectRole}
            onBack={() => setSelectedRole(null)}
            onUpdate={() => {}}
            onDelete={() => {}}
            refreshList={(value: any) => refreshList(value)}
            canManageRole={canManageRole}
          />
        </Box>
      )}

      {/* Create Role Modal */}
      <Dialog open={openCreateModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogContent>
          <RoleCreatingForm onClose={handleCloseModal} refreshList={(value: any) => refreshList(value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleListingTable;