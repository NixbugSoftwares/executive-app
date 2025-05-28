import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Chip,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { companyListApi } from "../../slices/appSlice";
import type { AppDispatch } from "../../store/Store";
import localStorageHelper from "../../utils/localStorageHelper";
import CompanyDetailsCard from "./CompanyDetailsCard";
import CompanyCreationForm from "./CompanyCreationForm";
import { showWarningToast } from "../../common/toastMessageHelper";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import BlockIcon from "@mui/icons-material/Block";
import ErrorIcon from "@mui/icons-material/Error";

interface Company {
  id: number;
  name: string;
  ownerName: string;
  location: string;
  phoneNumber: string;
  address: string;
  email: string;
  status: string;
  companyType: string;
}

const CompanyListingTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState({
    id: "",
    name: "",
    ownerName: "",
    location: "",
    address: "",
    email: "",
    phoneNumber: "",
  });

  const [page, setPage] = useState(0);
  const rowsPerPage = selectedCompany ? 8 : 8;
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageCompany = roleDetails?.manage_company || false;
  const navigate = useNavigate();
  // Function to fetch accounts
  const fetchCompany = () => {
    dispatch(companyListApi())
      .unwrap()
      .then((res: any[]) => {
        // Transform API data to match expected structure
        const formattedAccounts = res.map((company: any) => ({
          id: company.id,
          name: company.name ?? "-",
          address: company.address ?? "-",
          location: company.location ?? "-",
          ownerName: company.contact_person,
          phoneNumber: company.phone_number ?? "-",
          email: company.email_id ?? "-",
          companyType: company.type === 1 ? "private" : "government",
          status:
            company.status === 1
              ? "Validating"
              : company.status === 2
              ? "Verified"
              : "Suspended",
        }));
        setCompanyList(formattedAccounts);
      })
      .catch((err: any) => {
        showWarningToast("Error fetching companies:" + err);
      });
  };

  useEffect(() => {
    fetchCompany();
    refreshList;
  }, []);

  const handleRowClick = (company: Company) => {
    setSelectedCompany(company);
    navigate(`/executive/company/${company.id}`);
  };
  const handleCloseDetailCard = () => {
    setSelectedCompany(null);
    navigate("/executive/company");
  };

  const handleCloseModal = () => {
    setOpenCreateModal(false);
  };

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    column: keyof typeof search
  ) => {
    setSearch((prev) => ({ ...prev, [column]: e.target.value }));
  };

  const filteredData = companyList.filter(
    (row: Company) =>
      (row.id?.toString()?.toLowerCase() || "").includes(
        search.id.toLowerCase()
      ) &&
      (row.name?.toLowerCase() || "").includes(search.name.toLowerCase()) &&
      (row.ownerName?.toLowerCase() || "").includes(
        search.ownerName.toLowerCase()
      ) &&
      (row.location?.toLowerCase() || "").includes(
        search.location.toLowerCase()
      ) &&
      (row.address?.toLowerCase() || "").includes(
        search.address.toLowerCase()
      ) &&
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

  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchCompany();
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
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
                      textWrap: "nowrap",
                    }}
                  >
                    Owner Name
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.ownerName}
                    onChange={(e) => handleSearchChange(e, "ownerName")}
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
                    Phone Number
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.phoneNumber}
                    onChange={(e) => handleSearchChange(e, "phoneNumber")}
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
                    value={search.email}
                    onChange={(e) => handleSearchChange(e, "email")}
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
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((company) => {
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
                        <TableCell>{company.ownerName}</TableCell>
                        <TableCell>
                          {company.phoneNumber.replace("tel:", "")}
                        </TableCell>
                        <TableCell>
                          {company.email ? (
                            company.email
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
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <CompanyCreationForm
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

export default CompanyListingTable;
