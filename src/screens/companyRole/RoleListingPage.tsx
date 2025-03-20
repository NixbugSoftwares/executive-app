import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, TextField, Dialog, DialogActions, DialogContent, Tooltip, Typography, Autocomplete } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RoleDetailsCard from "./RoleDetailCard";
import RoleCreatingForm from "./RoleCreatingForm";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/Store";
import { operatorRoleListApi, companyListApi } from "../../slices/appSlice";
import localStorageHelper from "../../utils/localStorageHelper";

interface Role {
  id: number;
  name: string;
  companyId: number;
  companyName: string;
  manage_bus?: boolean;
  manage_route?: boolean;
  manage_schedule?: boolean;
  manage_role?: boolean;
  manage_operator?: boolean;
  manage_company?: boolean;
}

interface Company {
  id: number;
  name: string;
}

const RoleListingTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [selectRole, setSelectedRole] = useState<Role | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [search, setSearch] = useState({ id: "", Rolename: "", companyName: "" });
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");

  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageCompany = roleDetails?.manage_company || false;

  const fetchRoleList = () => {
    dispatch(operatorRoleListApi())
      .unwrap()
      .then((res: any[]) => {
        const formattedRoles = res.map((role: any) => ({
          id: role.id,
          name: role.name,
          companyId: role.company_id,
          companyName: role.company_name,
          manage_bus: role.manage_bus,
          manage_route: role.manage_route,
          manage_schedule: role.manage_schedule,
          manage_role: role.manage_role,
          manage_operator: role.manage_operator,
          manage_company: role.manage_company,
        }));
        setRoleList(formattedRoles);
      })
      .catch((err: any) => console.error("Error fetching roles:", err));
  };

  useEffect(() => {
    fetchRoleList();
  }, []);

  const fetchCompany = () => {
    dispatch(companyListApi())
      .unwrap()
      .then((res: any[]) => {
        console.log("Company API Response:", res);
        setCompanyList(res);
      })
      .catch((err: any) => {
        console.error("Error fetching companies", err);
      });
  };

  useEffect(() => {
    fetchCompany();
    fetchRoleList();
  }, []);

  const getCompanyName = (companyId: number) => {
    const company = companyList.find((company) => company.id === companyId);
    return company ? company.name : "Unknown Company";
  };

  const filteredData = roleList.filter(
    (row) =>
      row.id.toString().includes(search.id) &&
      row.name.toLowerCase().includes(search.Rolename.toLowerCase()) &&
      (getCompanyName(row.companyId)?.toLowerCase() || "").includes(
        search.companyName.toLowerCase()
      )
  );

  const [page, setPage] = useState(0);
  const rowsPerPage = selectRole ? 7 : 6;

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
          flex: selectRole ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
          maxWidth: selectRole ? { xs: "100%", md: "65%" } : "100%",
          transition: "all 0.3s ease",
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
       
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
            mt: 1,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Autocomplete
              sx={{ width: 200 }}
              options={companyList}
              getOptionLabel={(option) => option.name}
              value={
                companyList.find((c) => c.name === selectedCompanyName) || null
              }
              onChange={(_, newValue) => {
                setSelectedCompanyName(newValue ? newValue.name : "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Company"
                  variant="outlined"
                  size="small"
                />
              )}
            />

            {/* Company ID Input */}
            <TextField
              label="Company ID"
              variant="outlined"
              size="small"
              value={selectedCompanyId || ""}
              onChange={(e) =>
                setSelectedCompanyId(
                  e.target.value ? parseInt(e.target.value, 10) : null
                )
              }
              placeholder="Enter Company ID"
              sx={{ width: 120 }}
            />

            <Button
              variant="outlined"
              onClick={() => {
                setSelectedCompanyId(null);
                setSelectedCompanyName("");
              }}
            >
              Clear Filters
            </Button>
          </Box>

          <Tooltip
            title={
              !canManageCompany
                ? "You don't have permission, contact the admin"
                : "click to open the operator creation form"
            }
            placement="top-end"
          >
            <span
              style={{ cursor: !canManageCompany ? "not-allowed" : "default" }}
            >
              <Button
              
                sx={{
                  backgroundColor: !canManageCompany
                    ? "#6c87b7 !important"
                    : "#187b48",
                  color: "white",
                  "&.Mui-disabled": {
                    backgroundColor: "#6c87b7 !important",
                    color: "#ffffff99",
                  },
                }}
                variant="contained"
                onClick={() => setOpenCreateModal(true)}
                disabled={!canManageCompany}
              >
                Add Role
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectRole ? "0.8rem" : "1rem" }}>ID</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.id}
                    onChange={(e) => handleSearchChange(e, "id")}
                    fullWidth
                    sx={{
                      width: 80,
                      "& .MuiInputBase-root": {
                        height: 30,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectRole ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: "1rem",
                        ontSize: selectRole ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: selectRole ? "0.8rem" : "1rem",
                      textWrap: "nowrap",
                    }}
                  >
                    Company Name
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.companyName}
                    onChange={(e) => handleSearchChange(e, "companyName")}
                    sx={{
                      width: 120,
                      "& .MuiInputBase-root": {
                        height: 30,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectRole ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectRole ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectRole ? "0.8rem" : "1rem", textWrap: "nowrap" }}>Role Name</b>
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
                  "Bus",
                  "Route",
                  "Schedule",
                  "Role",
                  "Operator",
                  "Company",
                ].map((permission) => (
                  <TableCell key={permission} align="center" sx={{ width: "8%" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Typography variant="caption" sx={{ fontWeight: "bold", fontSize: selectRole ? "0.8rem" : "1rem" }}>Manage {permission}</Typography>
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
                        <TableCell>{getCompanyName(row.companyId)}</TableCell>
                        <TableCell sx={{ cursor: "pointer" }}>{row.name}</TableCell>

                        {[
                          "manage_bus",
                          "manage_route",
                          "manage_schedule",
                          "manage_role",
                          "manage_operator",
                          "manage_company",
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
            role={selectRole}
            onBack={() => setSelectedRole(null)}
            onUpdate={() => {}}
            onDelete={() => {}}
            refreshList={(value: any) => refreshList(value)}
            canManageCompany={canManageCompany}
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