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
  });

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [hasNextPage, setHasNextPage] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const canManageCompany = useSelector((state: RootState) =>
    state.app.permissions.includes("manage_company")
  );
  const navigate = useNavigate();
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
          companyType: company.type === 1 ? "private" : "government",
          status:
            company.status === 1
              ? "Validating"
              : company.status === 2
              ? "Verified"
              : "Suspended",
        }));
        setCompanyList(formattedAccounts);
        setHasNextPage(items.length === rowsPerPage);
      })
      .catch((err: any) => {
        showErrorToast(
          err || "Failed to fetch company list. Please try again."
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

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

  const handleChangePage = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    []
  );
  useEffect(() => {
    const searchParams = {
      ...(debouncedSearch.id && { id: debouncedSearch.id }),
      ...(debouncedSearch.name && { name: debouncedSearch.name }),
      ...(debouncedSearch.contact_person && {
        contact_person: debouncedSearch.contact_person,
      }),
      ...(debouncedSearch.email_id && { email_id: debouncedSearch.email_id }),
      ...(debouncedSearch.phone_number && {
        phone_number: debouncedSearch.phone_number,
      }),
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
          flex: selectedCompany ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
          maxWidth: selectedCompany ? { xs: "100%", md: "65%" } : "100%",
          transition: "all 0.3s ease",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Tooltip
          title={
            !canManageCompany
              ? "You don't have permission, contact the admin"
              : "click to open the company creation form"
          }
          placement="top-end"
        >
          <span
            style={{ cursor: !canManageCompany ? "not-allowed" : "default" }}
          >
            <Button
              sx={{
                ml: "auto",
                mr: 2,
                mb: 2,
                display: "block",
                backgroundColor: !canManageCompany
                  ? "#6c87b7 !important"
                  : "#00008B",
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
              Create Company
            </Button>
          </span>
        </Tooltip>

        <TableContainer sx={{
            flex: 1,
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}>
          <Table stickyHeader >
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>
                  <b
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: selectedCompany ? "0.8rem" : "1rem",
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
                        fontSize: selectedCompany ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedCompany ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

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
                  <TextField
                    variant="outlined"
                    size="small"
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
                <TableCell>
                  <Box display="flex" justifyContent="center">
                    <b>Status</b>
                  </Box>
                </TableCell>
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
              {companyList.length > 0 ? (
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
                      <TableCell>{company.id}</TableCell>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.address}</TableCell>
                      <TableCell>
                        {company.phone_number
                          ? company.phone_number
                              .replace(/\D/g, "")
                              .slice(-10) || "-"
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {company.email_id ? (
                          company.email_id
                        ) : (
                          <Tooltip
                            title=" Email not added yet"
                            placement="bottom"
                          >
                            <ErrorIcon sx={{ color: "#737d72 " }} />
                          </Tooltip>
                        )}
                      </TableCell>
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
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No accounts found.
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
            canManageCompany={canManageCompany}
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
