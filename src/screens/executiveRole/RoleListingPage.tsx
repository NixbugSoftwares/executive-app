import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RoleDetailsCard from "./RoleDetailCard";
import RoleCreatingForm from "./RoleCreatingForm";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/Store";
import { roleListApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";
import { showErrorToast } from "../../common/toastMessageHelper";

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
  manageFare?: boolean;
}

const RoleListingTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
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
          manageFare: role.manage_fare,
        }));
        setRoleList(formattedRoles);
      })
      .catch((err: any) => showErrorToast(err));
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
  const rowsPerPage = selectedRole ? 7 : 6;

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    if (
      newPage >= 0 &&
      newPage < Math.ceil(filteredData.length / rowsPerPage)
    ) {
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

  const handleCloseDetailCard = () => {
    setSelectedRole(null);
  };

  const handleCloseModal = () => {
    setOpenCreateModal(false);
  };

  const refreshList = (value: string) => {
    if (value === "refresh") {
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
          flex: selectedRole ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
          maxWidth: selectedRole ? { xs: "100%", md: "65%" } : "100%",
          transition: "all 0.3s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Create Role Button */}
        <Tooltip
          title={
            !canManageRole
              ? "You don't have permission, contact the admin"
              : "click to open the role creation form"
          }
          placement="top-end"
        >
          <span style={{ cursor: !canManageRole ? "not-allowed" : "default" }}>
            <Button
              sx={{
                ml: "auto",
                mr: 2,
                mb: 2,
                display: "block",
                backgroundColor: !canManageRole
                  ? "#6c87b7 !important"
                  : "#3f51b5",
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
                  <b
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: selectedRole ? "0.8rem" : "1rem",
                    }}
                  >
                    ID
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.id}
                    onChange={(e) => handleSearchChange(e, "id")}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 40,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedRole ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedRole ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: selectedRole ? "0.8rem" : "1rem",
                      textWrap: "nowrap",
                    }}
                  >
                    Role Name
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.Rolename}
                    onChange={(e) => handleSearchChange(e, "Rolename")}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 40,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedRole ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedRole ? "0.8rem" : "1rem",
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
                  "Fare"
                ].map((permission) => (
                  <TableCell
                    key={permission}
                    align="center"
                    sx={{ width: "8%" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          fontSize: selectedRole ? "0.8rem" : "1rem",
                        }}
                      >
                        Manage {permission}
                      </Typography>
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
                    const isSelected = selectedRole?.id === row.id;

                    return (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => handleRowClick(row)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor: isSelected
                            ? "#E3F2FD !important"
                            : "inherit",
                          "&:hover": {
                            backgroundColor: isSelected
                              ? "#E3F2FD !important"
                              : "#F5F5F5",
                          },
                        }}
                      >
                        <TableCell>{row.id}</TableCell>
                        <TableCell sx={{ cursor: "pointer" }}>
                          {row.name}
                        </TableCell>

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
                          "manageFare",
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
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            mt: 2,
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
            zIndex: 1,
            p: 1,
            borderTop: "1px solid #e0e0e0",
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
                  bgcolor:
                    page === pageNumber
                      ? "rgba(21, 101, 192, 0.2)"
                      : "transparent",
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
            sx={{ padding: "5px 10px", minWidth: 40 }}
          >
            &gt;
          </Button>
        </Box>
      </Box>

      {/* Side Panel for Role Details */}
      {selectedRole && (
        <Box
          sx={{
            flex: { xs: "0 0 100%", md: "0 0 30%" },
            maxWidth: { xs: "100%", md: "30%" },
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
            role={selectedRole}
            onBack={() => setSelectedRole(null)}
            onUpdate={() => {}}
            onDelete={() => {}}
            refreshList={(value: any) => refreshList(value)}
            canManageRole={canManageRole}
            handleCloseDetailCard={handleCloseDetailCard}
          />
        </Box>
      )}

      {/* Create Role Modal */}
      <Dialog open={openCreateModal} onClose={handleCloseModal} maxWidth="sm">
        <DialogContent>
          <RoleCreatingForm
            onClose={handleCloseModal}
            refreshList={(value: any) => refreshList(value)}
          />
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
