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
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import { useDispatch } from "react-redux";
import { accountListApi } from "../../slices/appSlice";
import AccountDetailsCard from "./AccountDetailsCard";
import AccountCreationForm from "./AccountForm";
import type { AppDispatch } from "../../store/Store";
import localStorageHelper from "../../utils/localStorageHelper";

interface Account {
  id: number;
  fullName: string;
  username: string;
  password: string;
  gender: string;
  designation: string;
  email: string;
  phoneNumber: string;
  status: string;
}

const AccountListingTable = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [accountList, setAccountList] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [search, setSearch] = useState({
    id: "",
    fullName: "",
    designation: "",
    gender: "",
    email: "",
    phoneNumber: "",
  });

  const [page, setPage] = useState(0);
  const rowsPerPage = selectedAccount ? 8 : 8;

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageExecutive = roleDetails?.manage_executive || false;

  // Function to fetch accounts
  const fetchAccounts = () => {
    dispatch(accountListApi())
      .unwrap()
      .then((res: any[]) => {
        console.log("API Response:", res);

        // Transform API data to match expected structure
        const formattedAccounts = res.map((account: any) => ({
          id: account.id,
          fullName: account.full_name ?? "-",
          username: account.username,
          password: "",
          gender:
            account.gender === 1
              ? "Female"
              : account.gender === 2
              ? "Male"
              : account.gender === 3
              ? "Transgender"
              : "Other",
          designation: account.designation ?? "-",
          email: account.email_id ?? "-",
          phoneNumber: account.phone_number ?? "-",
          status: account.status === 1 ? "Active" : "Suspended",
        }));

        console.log(
          "Formatted Accounts>>>>>>>>>>>>>>>>>>>>:",
          formattedAccounts
        );
        setAccountList(formattedAccounts);
      })
      .catch((err: any) => {
        console.error("Error fetching accounts", err);
      });
  };

  useEffect(() => {
    fetchAccounts();
    refreshList;
  }, []);

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account);
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

  const filteredData = accountList.filter(
    (row: Account) =>
      (row.id?.toString()?.toLowerCase() || "").includes(
        search.id.toLowerCase()
      ) &&
      (row.fullName?.toLowerCase() || "").includes(
        search.fullName.toLowerCase()
      ) &&
      (row.designation?.toLowerCase() || "").includes(
        search.designation.toLowerCase()
      ) &&
      (!search.gender ||
        (row.gender?.toLowerCase() || "") === search.gender.toLowerCase()) &&
      (row.email?.toLowerCase() || "").includes(search.email.toLowerCase()) &&
      (row.phoneNumber?.toLowerCase() || "").includes(
        search.phoneNumber.toLowerCase()
      )
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
          flex: selectedAccount
            ? { xs: "0 0 100%", md: "0 0 65%" }
            : "0 0 100%",
          maxWidth: selectedAccount ? { xs: "100%", md: "65%" } : "100%",
          transition: "all 0.3s ease",
          overflowY: selectedAccount ? "auto" : "hidden",
        }}
      >
        <Tooltip
          title={
            !canManageExecutive
              ? "You don't have permission, contact the admin"
              : "click to open the account creation form"
          }
          placement="top-end"
        >
          <span
            style={{ cursor: !canManageExecutive ? "not-allowed" : "default" }}
          >
            <Button
              sx={{
                ml: "auto",
                mr: 2,
                mb: 2,
                display: "block",
                backgroundColor: !canManageExecutive
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
              disabled={!canManageExecutive}
            >
              Create Account
            </Button>
          </span>
        </Tooltip>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedAccount ? "0.8rem" : "1rem" }}>ID</b>
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
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedAccount ? "0.8rem" : "1rem" }}>
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
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedAccount ? "0.8rem" : "1rem" }}>
                    Designation
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.designation}
                    onChange={(e) => handleSearchChange(e, "designation")}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 30,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedAccount ? "0.8rem" : "1rem" }}>Phone</b>
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
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedAccount ? "0.8rem" : "1rem" }}>Email</b>
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
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell size="small">
                  <b style={{ display: "block", textAlign: "center", fontSize: selectedAccount ? "0.8rem" : "1rem" }}>
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
                        fontSize: selectedAccount ? "0.8rem" : "1rem",
                        "& .MuiInputBase-root": {
                          height: 30,
                          padding: "4px",
                          textAlign: "center",
                        },
                        "& .MuiSelect-icon": {
                          fontSize: selectedAccount ? "1rem" : "1.25rem",
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
                fontSize: selectedAccount ? "0.8rem" : "1rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const isSelected = selectedAccount?.id === row.id;
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
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell>{row.designation}</TableCell>
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
      {selectedAccount && (
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
          <AccountDetailsCard
            account={selectedAccount}
            onUpdate={() => {}}
            onDelete={() => {}}
            onBack={() => setSelectedAccount(null)}
            refreshList={(value: any) => refreshList(value)}
            canManageExecutive={canManageExecutive}
          />
        </Box>
      )}

      {/* Create Account Modal */}
      <Dialog
        open={openCreateModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <AccountCreationForm
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

export default AccountListingTable;
