import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  Tooltip,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Chip,
  Typography,
  CircularProgress,
  SelectChangeEvent,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { companyListApi } from "../../slices/appSlice";
import type { AppDispatch } from "../../store/Store";
import CompanyDetailsCard from "./CompanyDetailsCard";
import CompanyCreationForm from "./CompanyCreationForm";
import { showErrorToast } from "../../common/toastMessageHelper";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import BlockIcon from "@mui/icons-material/Block";
import ErrorIcon from "@mui/icons-material/Error";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import PaginationControls from "../../common/paginationControl";
import { Company } from "../../types/type";

interface ColumnConfig {
  id: string;
  label: string;
  width: string;
  minWidth: string;
  fixed?: boolean;
}
const getStatusBackendValue = (displayValue: string): string => {
  const statusMap: Record<string, string> = {
    Validating: "1",
    Verified: "2",
    Suspended: "3",
  };
  return statusMap[displayValue] || "";
};
const CompanyListingTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState({
    id: "",
    name: "",
    contact_person: "",
    location: "",
    address: "",
    email_id: "",
    phone_number: "",
    status: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [hasNextPage, setHasNextPage] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const canCreateCompany = useSelector((state: RootState) =>
    state.app.permissions.includes("create_company")
  );
  const navigate = useNavigate();

  const columnConfig: ColumnConfig[] = [
    { id: "id", label: "ID", width: "80px", minWidth: "80px", fixed: true },
    {
      id: "name",
      label: "Company Name",
      width: "200px",
      minWidth: "200px",
      fixed: true,
    },
    {
      id: "phone_number",
      label: "Phone Number",
      width: "160px",
      minWidth: "160px",
      fixed: true,
    },

    {
      id: "email",
      label: "Email",
      width: "220px",
      minWidth: "220px",
      fixed: true,
    },
    {
      id: "status",
      label: "Status",
      width: "120px",
      minWidth: "120px",
      fixed: true,
    },
    {
      id: "address",
      label: "Address",
      width: "120px",
      minWidth: "120px",
    },
    {
      id: "owner",
      label: "Owner",
      width: "120px",
      minWidth: "120px",
    },
  ];
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columnConfig.reduce((com, column) => {
      com[column.id] = column.fixed ? true : false;
      return com;
    }, {} as Record<string, boolean>)
  );

  // Function to fetch accounts
  const fetchCompany = useCallback((pageNumber: number, searchParams = {}) => {
    const offset = pageNumber * rowsPerPage;
    dispatch(companyListApi({ limit: rowsPerPage, offset, ...searchParams }))
      .unwrap()
      .then((res) => {
        const items = res.data || [];
        const formattedAccounts = items.map((company: any) => ({
          id: company.id,
          name: company.name ?? "-",
          address: company.address ?? "-",
          location: company.location ?? "-",
          contact_person: company.contact_person ?? "-",
          phone_number: company.phone_number ?? "-",
          email_id: company.email_id ?? "-",
          companyType:
            company.type === 1
              ? "Other"
              : company.type === 2
              ? "private"
              : company.type === 3
              ? "government"
              : "",
          status:
            company.status === 1
              ? "Validating"
              : company.status === 2
              ? "Verified"
              : company.status === 3
              ? "Suspended"
              : "",
          created_on: company.created_on,
          updated_on: company.updated_on,
        }));
        setCompanyList(formattedAccounts);
        setHasNextPage(items.length === rowsPerPage);
      })
      .catch((error: any) => {
        showErrorToast(
          error.message || "Failed to fetch company list. Please try again."
        );
      })
      .finally(() => setIsLoading(false));
  }, []);
  const handleColumnChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    // Convert array of selected values to new visibility state
    const newVisibleColumns = Object.keys(visibleColumns).reduce((acc, key) => {
      acc[key] = value.includes(key);
      return acc;
    }, {} as Record<string, boolean>);
    setVisibleColumns(newVisibleColumns);
  };
  const handleRowClick = (company: Company) => {
    setSelectedCompany(company);
    navigate(`/executive/company/${company.id}`);
  };
  const handleCloseDetailCard = () => {
    setSelectedCompany(null);
    navigate("/executive/company");
  };

  const handleSearchChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      column: keyof typeof search
    ) => {
      const value = e.target.value;
      setSearch((prev) => ({ ...prev, [column]: value }));

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        setDebouncedSearch((prev) => ({ ...prev, [column]: value }));
        setPage(0);
      }, 700);
    },
    []
  );
  const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setSearch((prev) => ({ ...prev, status: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedSearch((prev) => ({ ...prev, status: value }));
      setPage(0);
    }, 700);
  }, []);

  const handleChangePage = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    []
  );
  useEffect(() => {
    const statusBackendValue = getStatusBackendValue(debouncedSearch.status);
    const searchParams = {
      ...(debouncedSearch.id && { id: debouncedSearch.id }),
      ...(debouncedSearch.name && { name: debouncedSearch.name }),
      ...(debouncedSearch.address && { address: debouncedSearch.address }),
      ...(debouncedSearch.email_id && { email_id: debouncedSearch.email_id }),
      ...(debouncedSearch.phone_number && {
        phone_number: debouncedSearch.phone_number,
      }),
      ...(debouncedSearch.contact_person && {
        contact_person: debouncedSearch.contact_person,
      }),
      ...(statusBackendValue && { status: statusBackendValue }),
    };

    fetchCompany(page, searchParams);
  }, [page, debouncedSearch, fetchCompany]);
  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchCompany(page, debouncedSearch);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: "100%",
        height: "100%",
        gap: 2,
      }}
    >
      <Box
        sx={{
          flex: selectedCompany
            ? { xs: "0 0 100%", md: "0 0 65%" }
            : "0 0 100%",
          maxWidth: selectedCompany ? { xs: "100%", md: "65%" } : "100%",
          transition: "all 0.3s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            mb: 2,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <Select
              multiple
              value={Object.keys(visibleColumns).filter(
                (key) => visibleColumns[key]
              )}
              onChange={handleColumnChange}
              renderValue={(selected) =>
                `Selected Columns (${selected.length})`
              }
              sx={{ minWidth: 200, height: 40 }}
            >
              {columnConfig.map((column) => (
                <MenuItem
                  key={column.id}
                  value={column.id}
                  disabled={column.fixed}
                >
                  <Checkbox
                    checked={visibleColumns[column.id]}
                    disabled={column.fixed}
                  />
                  <ListItemText
                    primary={column.label}
                  />
                </MenuItem>
              ))}
            </Select>
          </Box>

          {canCreateCompany && (
            <Button
              sx={{
                backgroundColor: "#00008B",
                color: "white !important",
                "&.Mui-disabled": {
                  color: "#fff !important",
                },
              }}
              variant="contained"
              onClick={() => setOpenCreateModal(true)}
            >
              Add New Company
            </Button>
          )}
        </Box>

        <TableContainer
          sx={{
            flex: 1,
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            position: "relative",
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                {visibleColumns.id && (
                  <TableCell width="140px">
                    <b
                      style={{
                        display: "block",
                        textAlign: "center",
                        fontSize: selectedCompany ? "0.8rem" : "1rem",
                      }}
                    >
                      ID
                    </b>
                  </TableCell>
                )}
                {visibleColumns.name && (
                  <TableCell>
                    <b
                      style={{
                        display: "block",
                        textAlign: "center",
                        fontSize: selectedCompany ? "0.8rem" : "1rem",
                        textWrap: "nowrap",
                      }}
                    >
                      Company Name
                    </b>
                  </TableCell>
                )}

                {visibleColumns.address && (
                  <TableCell>
                    <b
                      style={{
                        display: "block",
                        textAlign: "center",
                        fontSize: selectedCompany ? "0.8rem" : "1rem",
                      }}
                    >
                      Address
                    </b>
                  </TableCell>
                )}

                {visibleColumns.phone_number && (
                  <TableCell>
                    <b
                      style={{
                        display: "block",
                        textAlign: "center",
                        fontSize: selectedCompany ? "0.8rem" : "1rem",
                      }}
                    >
                      Phone
                    </b>
                  </TableCell>
                )}

                {visibleColumns.email && (
                  <TableCell>
                    <b
                      style={{
                        display: "block",
                        textAlign: "center",
                        fontSize: selectedCompany ? "0.8rem" : "1rem",
                      }}
                    >
                      Email
                    </b>
                  </TableCell>
                )}
                {visibleColumns.owner && (
                  <TableCell>
                    <Box display="flex" justifyContent="center">
                      <b>Company Owner</b>
                    </Box>
                  </TableCell>
                )}

                {visibleColumns.status && (
                  <TableCell>
                    <Box display="flex" justifyContent="center">
                      <b>Status</b>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
              <TableRow>
                {visibleColumns.id && (
                  <TableCell>
                    <TextField
                      type="number"
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
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                      }}
                    />
                  </TableCell>
                )}
                {visibleColumns.name && (
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Search"
                      value={search.name}
                      onChange={(e) => handleSearchChange(e, "name")}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 40,
                          padding: "4px",
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                      }}
                    />
                  </TableCell>
                )}
                {visibleColumns.address && (
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Search"
                      value={search.address}
                      onChange={(e) => handleSearchChange(e, "address")}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 40,
                          padding: "4px",
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                      }}
                    />
                  </TableCell>
                )}
                {visibleColumns.phone_number && (
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      type="number"
                      placeholder="Search"
                      value={search.phone_number}
                      onChange={(e) => handleSearchChange(e, "phone_number")}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 40,
                          padding: "4px",
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                      }}
                    />
                  </TableCell>
                )}
                {visibleColumns.email && (
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Search"
                      value={search.email_id}
                      onChange={(e) => handleSearchChange(e, "email_id")}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 40,
                          padding: "4px",
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                      }}
                    />
                  </TableCell>
                )}
                {visibleColumns.owner && (
                  <TableCell>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Search"
                      value={search.contact_person}
                      onChange={(e) => handleSearchChange(e, "contact_person")}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 40,
                          padding: "4px",
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                          fontSize: selectedCompany ? "0.8rem" : "1rem",
                        },
                      }}
                    />
                  </TableCell>
                )}
                {visibleColumns.status && (
                  <TableCell width="10%">
                    <Select
                      value={search.status}
                      onChange={handleSelectChange}
                      displayEmpty
                      size="small"
                      fullWidth
                      sx={{ height: 40 }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Validating">Validating</MenuItem>
                      <MenuItem value="Verified">Verified</MenuItem>
                      <MenuItem value="Suspended">Suspended</MenuItem>
                    </Select>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                fontSize: selectedCompany ? "0.8rem" : "1rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center"></TableCell>
                </TableRow>
              ) : companyList.length > 0 ? (
                companyList.map((company) => {
                  const isSelected = selectedCompany?.id === company.id;
                  return (
                    <TableRow
                      key={company.id}
                      hover
                      onClick={() => handleRowClick(company)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: isSelected
                          ? "#E3F2FD !important"
                          : "inherit",
                        color: isSelected ? "black !important" : "inherit",
                        "&:hover": {
                          backgroundColor: isSelected
                            ? "#E3F2FD !important"
                            : "#E3F2FD",
                        },
                        "& td": {
                          color: isSelected ? "black !important" : "inherit",
                        },
                      }}
                    >
                      {visibleColumns.id && (
                        <TableCell align="center">{company.id}</TableCell>
                      )}
                      {visibleColumns.name && (
                        <TableCell>
                          {" "}
                          <Tooltip title={company.name} placement="bottom">
                            <Typography noWrap>
                              {company.name.length > 15
                                ? `${company.name.substring(0, 15)}...`
                                : company.name}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      )}
                      {visibleColumns.address && (
                        <TableCell>
                          <Tooltip title={company.address} placement="bottom">
                            <Typography noWrap>
                              {company.address.length > 15
                                ? `${company.address.substring(0, 15)}...`
                                : company.address}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      )}
                      {visibleColumns.phone_number && (
                        <TableCell>
                          {company.phone_number
                            ? company.phone_number
                                .replace(/\D/g, "")
                                .slice(-10) || "-"
                            : "-"}
                        </TableCell>
                      )}
                      {visibleColumns.email && (
                        <TableCell>
                          {company.email_id ? (
                            <Tooltip
                              title={company.email_id}
                              placement="bottom"
                            >
                              <Typography noWrap>
                                {company.email_id.length > 15
                                  ? `${company.email_id.substring(0, 15)}...`
                                  : company.email_id}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Tooltip
                              title=" Email not added yet"
                              placement="bottom"
                            >
                              <ErrorIcon sx={{ color: "#737d72 " }} />
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.owner && (
                        <TableCell>
                          {company.contact_person ? (
                            <Tooltip
                              title={company.contact_person}
                              placement="bottom"
                            >
                              <Typography noWrap>
                                {company.contact_person.length > 15
                                  ? `${company.contact_person.substring(
                                      0,
                                      15
                                    )}...`
                                  : company.contact_person}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Tooltip
                              title=" Owner not added yet"
                              placement="bottom"
                            >
                              <ErrorIcon sx={{ color: "#737d72 " }} />
                            </Tooltip>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.status && (
                        <TableCell>
                          {company.status === "Validating" && (
                            <Chip
                              icon={<WarningIcon />}
                              label="Validating"
                              color="warning"
                              size="small"
                              sx={{
                                backgroundColor:
                                  selectedCompany?.id === company.id
                                    ? "#edd18f"
                                    : "#FFE082",
                                color:
                                  selectedCompany?.id === company.id
                                    ? "#9f3b03"
                                    : "#9f3b03",
                                fontWeight: "bold",
                              }}
                            />
                          )}
                          {company.status === "Suspended" && (
                            <Chip
                              icon={<BlockIcon />}
                              label="Suspended"
                              color="error"
                              size="small"
                              sx={{
                                backgroundColor:
                                  selectedCompany?.id === company.id
                                    ? "#FFCDD2"
                                    : "#FFEBEE",
                                color: "#D32F2F",
                                fontWeight: "bold",
                              }}
                            />
                          )}

                          {company.status === "Verified" && (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Verified"
                              color="success"
                              size="small"
                              sx={{
                                backgroundColor:
                                  selectedCompany?.id === company.id
                                    ? "#A5D6A7"
                                    : "#E8F5E9",
                                color:
                                  selectedCompany?.id === company.id
                                    ? "#2E7D32"
                                    : "#2E7D32",
                                fontWeight: "bold",
                              }}
                            />
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No company found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <PaginationControls
          page={page}
          onPageChange={(newPage) => handleChangePage(null, newPage)}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
        />
      </Box>

      {/* Right Side - Account Details Card */}
      {selectedCompany && (
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
          <CompanyDetailsCard
            company={selectedCompany}
            onUpdate={() => {}}
            onDelete={() => {}}
            onBack={() => setSelectedCompany(null)}
            refreshList={(value: any) => refreshList(value)}
            handleCloseDetailCard={handleCloseDetailCard}
          />
        </Box>
      )}

      {/* Create Account Modal */}
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <CompanyCreationForm
            refreshList={(value: any) => refreshList(value)}
            onClose={() => setOpenCreateModal(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyListingTable;
