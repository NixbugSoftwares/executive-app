import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  Tooltip,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import { useDispatch } from "react-redux";
import { operatorListApi, companyListApi } from "../../slices/appSlice";
import type { AppDispatch } from "../../store/Store";
import localStorageHelper from "../../utils/localStorageHelper";
import OperatorDetailsCard from "./OperatorDetails";
import OperatorCreationForm from "./OperatorCreationForm";
import { useLocation, useParams } from "react-router-dom";

interface Operator {
  id: number;
  companyId: number;
  companyName: string;
  username: string;
  fullName: string;
  password: string;
  gender: string;
  email: string;
  phoneNumber: string;
  status: string;
}

interface Company {
  id: number;
  name: string;
}

const OperatorListingTable = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [operatorList, setOperatorList] = useState<Operator[]>([]);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(() => {
    const urlCompanyId = companyId ? parseInt(companyId) : null;
    const storedCompanyId = localStorageHelper.getItem(
      "operatorFilterCompanyId"
    );
    return urlCompanyId || storedCompanyId || null;
  });

  useEffect(() => {
    if (filterCompanyId) {
      localStorageHelper.storeItem("operatorFilterCompanyId", filterCompanyId);
    }
  }, [filterCompanyId]);

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
    company_name: "",
    fullName: "",
    gender: "",
    email: "",
    phoneNumber: "",
  });

  const [page, setPage] = useState(0);
  const rowsPerPage = 8;
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageCompany = roleDetails?.manage_company || false;

  const fetchAccounts = () => {
    dispatch(operatorListApi(filterCompanyId))
      .unwrap()
      .then((res: any[]) => {
        const formattedAccounts = res.map((operator: any) => ({
          id: operator.id,
          companyId: operator.company_id,
          companyName: operator.company_name,
          fullName: operator.full_name ?? "-",
          username: operator.username,
          password: "",
          gender:
            operator.gender === 1
              ? "Female"
              : operator.gender === 2
              ? "Male"
              : operator.gender === 3
              ? "Transgender"
              : "Other",
          email: operator.email_id ?? "-",
          phoneNumber: operator.phone_number ?? "-",
          status: operator.status === 1 ? "Active" : "Suspended",
        }));
        setOperatorList(formattedAccounts);
      })
      .catch((err: any) => {
        console.error("Error fetching accounts", err);
      });
  };

  const fetchCompany = () => {
    dispatch(companyListApi())
      .unwrap()
      .then((res: any[]) => {
        setCompanyList(res);
        if (location.state?.companyId) {
          const company = res.find((c) => c.id === location.state.companyId);
          if (company) {
            setSearch((prev) => ({ ...prev, company_name: company.name }));
          }
        }
      })
      .catch((err: any) => {
        console.error("Error fetching companies", err);
      });
  };

  useEffect(() => {
    fetchAccounts();
    fetchCompany();
  }, [filterCompanyId]);

  const getCompanyName = (companyId: number) => {
    const company = companyList.find((company) => company.id === companyId);
    return company ? company.name : "Unknown Company";
  };

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    column: keyof typeof search
  ) => {
    setSearch((prev) => ({ ...prev, [column]: e.target.value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setSearch({ ...search, gender: e.target.value });
  };

  const filteredData = operatorList.filter(
    (row: Operator) =>
      (row.id?.toString()?.toLowerCase() || "").includes(
        search.id.toLowerCase()
      ) &&
      (getCompanyName(row.companyId)?.toLowerCase() || "").includes(
        search.company_name.toLowerCase()
      ) &&
      (row.fullName?.toLowerCase() || "").includes(
        search.fullName.toLowerCase()
      ) &&
      (!search.gender ||
        (row.gender?.toLowerCase() || "") === search.gender.toLowerCase()) &&
      (row.email?.toLowerCase() || "").includes(search.email.toLowerCase()) &&
      (row.phoneNumber?.toLowerCase() || "").includes(
        search.phoneNumber.toLowerCase()
      ) &&
      (!filterCompanyId || row.companyId === filterCompanyId)
  );

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleCloseModal = () => {
    setOpenCreateModal(false);
  };

  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchAccounts();
    }
  };

  const handleRowClick = (account: Operator) => {
    const companyName = getCompanyName(account.companyId);
    setSelectedOperator({ ...account, companyName: companyName });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: "100%",
        height: "100vh",
        gap: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: selectedOperator
            ? { xs: "0 0 100%", md: "0 0 65%" }
            : "0 0 100%",
          maxWidth: selectedOperator ? { xs: "100%", md: "65%" } : "100%",
          transition: "all 0.3s ease",
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
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {filterCompanyId && (
              <Typography variant="body2" color="textSecondary">
                Showing operators for company:{" "}
                {companyList.find((c) => c.id === filterCompanyId)?.name ||
                  filterCompanyId}
              </Typography>
            )}
          </Box>

          <Tooltip
            title={
              !canManageCompany
                ? "You don't have permission, contact the admin"
                : "Click to open the operator creation form"
            }
            placement="top-end"
          >
            <span
              style={{ cursor: !canManageCompany ? "not-allowed" : "default" }}
            >
              <Button
                sx={{
                  backgroundColor: !canManageCompany ? "#6c87b7" : "#187b48",
                  color: "white",
                  "&.Mui-disabled": {
                    backgroundColor: "#6c87b7",
                    color: "#ffffff99",
                  },
                }}
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenCreateModal(true);
                }}
                disabled={!canManageCompany}
              >
                Add Operator
              </Button>
            </span>
          </Tooltip>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                {["ID", "Company", "Full Name", "Phone", "Email", "Gender"].map(
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
                              height: 30,
                              padding: "4px",
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
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
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
                        <TableCell>{getCompanyName(row.companyId)}</TableCell>
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell>
                          {row.phoneNumber.replace("tel:", "")}
                        </TableCell>
                        <TableCell>{row.email}</TableCell>
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
            onClick={(e) => {
              e.stopPropagation();
              handleChangePage(null, page - 1);
            }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangePage(null, pageNumber);
                }}
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
            onClick={(e) => {
              e.stopPropagation();
              handleChangePage(null, page + 1);
            }}
            disabled={page >= Math.ceil(filteredData.length / rowsPerPage) - 1}
            sx={{ padding: "5px 10px", minWidth: 40 }}
          >
            &gt;
          </Button>
        </Box>
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
            canManageCompany={canManageCompany}
          />
        </Box>
      )}

      {/* Create Operator Dialog */}
      <Dialog
        open={openCreateModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <OperatorCreationForm
            refreshList={refreshList}
            onClose={handleCloseModal}
            // defaultCompanyId={filterCompanyId}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OperatorListingTable;
