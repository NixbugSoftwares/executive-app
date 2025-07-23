import React, { useCallback, useEffect, useRef, useState } from "react";
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
  DialogContent,
  FormControl,
  Select,
  MenuItem,
  Typography,
  DialogTitle,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { SelectChangeEvent } from "@mui/material";
import { useDispatch } from "react-redux";
import { operatorListApi, operatorRoleListApi } from "../../slices/appSlice";
import type { AppDispatch } from "../../store/Store";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import OperatorDetailsCard from "./OperatorDetails";
import OperatorCreationForm from "./OperatorCreationForm";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import PaginationControls from "../../common/paginationControl";
import { showErrorToast } from "../../common/toastMessageHelper";
import { Operator } from "../../types/type";

const getGenderBackendValue = (displayValue: string): string => {
  const genderMap: Record<string, string> = {
    Other: "1",
    Female: "2",
    Male: "3",
    Transgender: "4",
  };
  return genderMap[displayValue] || "";
};

const OperatorListingTable = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [operatorList, setOperatorList] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(
    companyId ? parseInt(companyId) : null
  );
  const [openNoRolesModal, setOpenNoRolesModal] = useState(false);
  const [_rolesExist, setRolesExist] = useState(true);
  const navigate = useNavigate();

  console.log("filterCompanyId", filterCompanyId);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlCompanyId = companyId || queryParams.get("companyId");

    if (urlCompanyId) {
      const id = parseInt(urlCompanyId);
      if (!isNaN(id)) {
        setFilterCompanyId(id);
      }
    }
  }, [companyId, location.search]);

  const [search, setSearch] = useState({
    id: "",
    full_name: "",
    gender: "",
    email_id: "",
    phone_number: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [hasNextPage, setHasNextPage] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const canCreateOperator = useSelector((state: RootState) =>
    state.app.permissions.includes("create_operator")
  );
  const fetchAccounts = useCallback((pageNumber: number, searchParams = {}) => {
    const offset = pageNumber * rowsPerPage;
    dispatch(
      operatorListApi({
        limit: rowsPerPage,
        offset,
        company_id: filterCompanyId !== null ? filterCompanyId : undefined,
        ...searchParams,
      })
    )
      .unwrap()
      .then((res) => {
        const items = res.data || [];
        const formattedAccounts = items.map((operator: any) => ({
          id: operator.id,
          company_id: operator.company_id,
          fullName: operator.full_name,
          username: operator.username,
          password: "",
          gender:
            operator.gender === 1
              ? "Other"
              : operator.gender === 2
              ? "Female"
              : operator.gender === 3
              ? "Male"
              : "Transgender",
          email_id: operator.email_id,
          phoneNumber: operator.phone_number || "",
          status: operator.status === 1 ? "Active" : "Suspended",
        }));
        setOperatorList(formattedAccounts);
        setHasNextPage(items.length === rowsPerPage);
      })
      .catch((error: any) => {
        console.error("Error fetching accounts", error);
        showErrorToast(error || "Failed to fetch accounts");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const checkRolesExist = () => {
    if (!filterCompanyId) return false;

    dispatch(operatorRoleListApi({ company_id: filterCompanyId }))
      .unwrap()
      .then((res) => {
        const items = res.data || [];
        setRolesExist(items.length > 0);
        if (items.length === 0) {
          setOpenNoRolesModal(true);
        } else {
          setOpenCreateModal(true);
        }
      })
      .catch(() => {
        setRolesExist(false);
        setOpenNoRolesModal(true);
      });
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
    setSearch((prev) => ({ ...prev, gender: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedSearch((prev) => ({ ...prev, gender: value }));
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
    const genderBackendValue = getGenderBackendValue(debouncedSearch.gender);
    const searchParams = {
      ...(debouncedSearch.id && { id: debouncedSearch.id }),
      ...(debouncedSearch.full_name && {
        full_name: debouncedSearch.full_name,
      }),
      ...(debouncedSearch.gender && { gender: genderBackendValue }),
      ...(debouncedSearch.email_id && { email_id: debouncedSearch.email_id }),
      ...(debouncedSearch.phone_number && {
        phone_number: debouncedSearch.phone_number,
      }),
    };

    fetchAccounts(page, searchParams);
  }, [page, debouncedSearch, fetchAccounts]);

  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchAccounts(page, debouncedSearch);
    }
  };

  const handleCloseDetailCard = () => {
    setSelectedOperator(null);
  };

  const handleRowClick = (account: Operator) => {
    setSelectedOperator(account);
  };
  const handleAddOperatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canCreateOperator) return;

    if (filterCompanyId) {
      checkRolesExist();
    } else {
      // If no company is selected, just open the create modal
      setOpenCreateModal(true);
    }
  };
  const NoRolesDialog = (
    <Dialog open={openNoRolesModal} onClose={() => setOpenNoRolesModal(false)}>
      <DialogTitle>No Roles Found</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          You need to create at least one role before adding operators.
        </Typography>
        <Typography variant="body2">
          Please create roles for this company first.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenNoRolesModal(false)} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            setOpenNoRolesModal(false);
            navigate(`/executive/company/role/${filterCompanyId}`);
          }}
          color="primary"
          variant="contained"
        >
          Go to Roles
        </Button>
      </DialogActions>
    </Dialog>
  );

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
      <Box
        sx={{
          flex: selectedOperator
            ? { xs: "0 0 100%", md: "0 0 65%" }
            : "0 0 100%",
          maxWidth: selectedOperator ? { xs: "100%", md: "65%" } : "100%",
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
            alignItems: "center",
            gap: 2,
            mb: 2,
            mt: 1,
            justifyContent: "right",
          }}
        >
          <Tooltip
            title={
              !canCreateOperator
                ? "You don't have permission, contact the admin"
                : "Click to open the operator creation form"
            }
            placement="top-end"
          >
            <span
              style={{ cursor: !canCreateOperator ? "not-allowed" : "default" }}
            >
              <Button
                sx={{
                  ml: "auto",
                  mr: 2,
                  mb: 2,
                  display: "block",
                  backgroundColor: !canCreateOperator
                    ? "#6c87b7 !important"
                    : "#00008B",
                  color: "white",
                  "&.Mui-disabled": {
                    backgroundColor: "#6c87b7 !important",
                    color: "#ffffff99",
                  },
                }}
                variant="contained"
                onClick={handleAddOperatorClick}
                disabled={!canCreateOperator}
              >
                Add Operator
              </Button>
            </span>
          </Tooltip>
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
                {["ID", "Full Name", "Phone", "Email", "Gender"].map(
                  (header) => (
                    <TableCell key={header}>
                      <b style={{ display: "block", textAlign: "center" }}>
                        {header}
                      </b>
                      {header === "Gender" ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={search.gender}
                            onChange={handleSelectChange}
                            displayEmpty
                            size="small"
                            sx={{
                              textAlign: "center",
                              "& .MuiInputBase-root": {
                                height: 30,
                                padding: "4px",
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
                      ) : (
                        <TextField
                          variant="outlined"
                          size="small"
                          placeholder="Search"
                          type={
                            header === "ID" || header === "Phone"
                              ? "number"
                              : "text"
                          }
                          value={
                            search[
                              header
                                .toLowerCase()
                                .replace(" ", "_") as keyof typeof search
                            ] || ""
                          }
                          onChange={(e) =>
                            handleSearchChange(
                              e,
                              header
                                .toLowerCase()
                                .replace(" ", "_") as keyof typeof search
                            )
                          }
                          sx={{
                            "& .MuiInputBase-root": {
                              height: 40,
                              padding: "4px",
                              textAlign: "center",
                              fontSize: selectedOperator ? "0.8rem" : "1rem",
                            },
                            "& .MuiInputBase-input": {
                              textAlign: "center",
                              fontSize: selectedOperator ? "0.8rem" : "1rem",
                            },
                          }}
                          fullWidth
                        />
                      )}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center"></TableCell>
                </TableRow>
              ) : operatorList.length > 0 ? (
                operatorList.map((row) => {
                  const isSelected = selectedOperator?.id === row.id;
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row);
                      }}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#E3F2FD" : "inherit",
                        "&:hover": { backgroundColor: "#E3F2FD" },
                      }}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>
                        {row.fullName ? (
                          <Tooltip title={row.fullName} placement="bottom">
                            <Typography noWrap>
                              {row.fullName.length > 15
                                ? `${row.fullName.substring(0, 15)}...`
                                : row.fullName}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title="Full Name not added yet"
                            placement="bottom"
                          >
                            <ErrorIcon sx={{ color: "#737d72" }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.phoneNumber ? (
                          <Typography noWrap>
                            {row.phoneNumber.replace(/\D/g, "").slice(-10)}
                          </Typography>
                        ) : (
                          <Tooltip
                            title="Phone Number not added yet"
                            placement="bottom"
                          >
                            <ErrorIcon sx={{ color: "#737d72" }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.email_id ? (
                          <Tooltip title={row.email_id} placement="bottom">
                            <Typography noWrap>
                              {row.email_id.length > 20
                                ? `${row.email_id.substring(0, 20)}...`
                                : row.email_id}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title="Email not added yet"
                            placement="bottom"
                          >
                            <ErrorIcon sx={{ color: "#737d72" }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>{row.gender}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No operators found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <PaginationControls
          page={page}
          onPageChange={(newPage) => handleChangePage(null, newPage)}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
        />
      </Box>

      {/* Operator Details Card */}
      {selectedOperator && (
        <Box
          sx={{
            flex: { xs: "0 0 100%", md: "0 0 35%" },
            maxWidth: { xs: "100%", md: "35%" },
            bgcolor: "grey.100",
            p: 2,
            overflowY: "auto",
          }}
        >
          <OperatorDetailsCard
            operator={selectedOperator}
            onUpdate={() => {}}
            onDelete={() => {}}
            onBack={() => setSelectedOperator(null)}
            refreshList={refreshList}
            onCloseDetailCard={handleCloseDetailCard}
          />
        </Box>
      )}

      {/* Create Operator Dialog */}
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <OperatorCreationForm
            refreshList={refreshList}
            onClose={() => setOpenCreateModal(false)}
            defaultCompanyId={filterCompanyId ?? undefined}
          />
        </DialogContent>
      </Dialog>
      {NoRolesDialog}
    </Box>
  );
};

export default OperatorListingTable;
