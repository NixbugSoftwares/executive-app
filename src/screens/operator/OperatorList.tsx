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
  DialogActions,
  DialogContent,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import { useDispatch } from "react-redux";
import { operatorListApi, companyListApi } from "../../slices/appSlice";
import type { AppDispatch } from "../../store/Store";
import localStorageHelper from "../../utils/localStorageHelper";
import OperatorDetailsCard from "./OperatorDetails";
import OperatorCreationForm from "./OperatorCreationForm";

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
  const dispatch = useDispatch<AppDispatch>();

  const [operatorList, setOperatorList] = useState<Operator[]>([]);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );

  const [search, setSearch] = useState({
    id: "",
    company_id: "",
    company_name: "",
    fullName: "",
    gender: "",
    email: "",
    phoneNumber: "",
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");

  const [page, setPage] = useState(0);
  const rowsPerPage = selectedOperator ? 8 : 8;

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const roleDetails = localStorageHelper.getItem("@roleDetails");
  console.log("rolesdetails>>>>>>>>>>>>>", roleDetails);

  const canManageCompany = roleDetails?.manage_company || false;

  // Function to fetch accounts
  const fetchAccounts = () => {
    dispatch(operatorListApi())
      .unwrap()
      .then((res: any[]) => {
        console.log("API Response:", res);

        // Transform API data to match expected structure
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

        console.log("Formatted Accounts:", formattedAccounts);
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
        console.log("Company API Response:", res);
        setCompanyList(res);
      })
      .catch((err: any) => {
        console.error("Error fetching companies", err);
      });
  };

  useEffect(() => {
    fetchAccounts();
    fetchCompany();
  }, []);
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
      (!selectedCompanyName ||
        getCompanyName(row.companyId) === selectedCompanyName) &&
      (!selectedCompanyId || row.companyId === selectedCompanyId)
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
      console.log("Account list refreshed...");
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
          overflowY: selectedOperator ? "auto" : "hidden",
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
                Add Operator
              </Button>
            </span>
          </Tooltip>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b
                    style={{
                      display: "block",
                      textAlign: "center", 
                      fontSize: selectedOperator ? "0.8rem" : "1rem"
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
                    sx={{
                      width: 80,
                      "& .MuiInputBase-root": {
                        height: 30,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: selectedOperator ? "0.8rem" : "1rem",
                    }}
                  >
                    Company Name
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.company_name}
                    onChange={(e) => handleSearchChange(e, "company_name")}
                    sx={{
                      width: 120,
                      "& .MuiInputBase-root": {
                        height: 30,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedOperator ? "0.8rem" : "1rem" }}>
                    Full Name
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.fullName}
                    onChange={(e) => handleSearchChange(e, "fullName")}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 30,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedOperator ? "0.8rem" : "1rem" }}>Phone</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.phoneNumber}
                    onChange={(e) => handleSearchChange(e, "phoneNumber")}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 30,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedOperator ? "0.8rem" : "1rem" }}>Email</b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.email}
                    onChange={(e) => handleSearchChange(e, "email")}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 30,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell size="small">
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedOperator ? "0.8rem" : "1rem" }}>
                    Gender
                  </b>
                  <FormControl fullWidth size="small">
                    <Select
                      value={search.gender}
                      onChange={handleSelectChange}
                      displayEmpty
                      size="small"
                      sx={{
                        textAlign: "center",
                        fontSize: selectedOperator ? "0.8rem" : "1rem",
                        "& .MuiInputBase-root": {
                          height: 30,
                          padding: "4px",
                          textAlign: "center",
                        },
                        "& .MuiSelect-icon": {
                          fontSize: selectedOperator ? "1rem" : "1.25rem",
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
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                fontSize: selectedOperator ? "0.8rem" : "1rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const isSelected = selectedOperator?.id === row.id;
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => handleRowClick(row)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor: isSelected
                            ? "#1565C0 !important"
                            : "inherit",
                          color: isSelected ? "white !important" : "inherit",
                          "&:hover": {
                            backgroundColor: isSelected
                              ? "#1565C0 !important"
                              : "#E3F2FD",
                          },
                          "& td": {
                            color: isSelected ? "white !important" : "inherit",
                          },
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
                    No accounts found.
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

      {/* Right Side - Account Details Card */}
      {selectedOperator && (
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
          <OperatorDetailsCard
            operator={selectedOperator}
            onUpdate={() => {}}
            onDelete={() => {}}
            onBack={() => setSelectedOperator(null)}
            refreshList={(value: any) => refreshList(value)}
            canManageCompany={canManageCompany}
          />
        </Box>
      )}

      <Dialog
        open={openCreateModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <OperatorCreationForm
            refreshList={(value: any) => refreshList(value)}
            onClose={handleCloseModal}
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

export default OperatorListingTable;
