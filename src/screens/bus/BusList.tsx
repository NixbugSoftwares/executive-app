import React, { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { busListApi, companyListApi } from "../../slices/appSlice";
import type { AppDispatch } from "../../store/Store";
import localStorageHelper from "../../utils/localStorageHelper";
import BusDetailsCard from "./BusDetail";
import BusCreationForm from "./BusCreationForm";
import { useParams, useLocation } from "react-router-dom";

interface Bus {
  id: number;
  companyId: number;
  companyName: string;
  registrationNumber: string;
  name: string;
  capacity: number;
  model: string;
  manufactured_on: string;
  insurance_upto: string;
  pollution_upto: string;
  fitness_upto: string;
}

interface Company {
  id: number;
  name: string;
}

const BusListingTable = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(
    companyId ? parseInt(companyId) : null
  );
  const [busList, setBusList] = useState<Bus[]>([]);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  const [search, setSearch] = useState({
    id: "",
    company_id: "",
    company_name: "",
    registrationNumber: "",
    name: "",
    capacity: "",
    model: "",
  });

  const [page, setPage] = useState(0);
  const rowsPerPage = selectedBus ? 8 : 8;

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const roleDetails = localStorageHelper.getItem("@roleDetails");
  console.log("rolesdetails>>>>>>>>>>>>>", roleDetails);

  const canManageCompany = roleDetails?.manage_company || false;
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

  // Function to fetch accounts
  const fetchBus = () => {
    dispatch(busListApi(filterCompanyId))
      .unwrap()
      .then((res: any[]) => {
        console.log("API Response:", res);

        // Transform API data to match expected structure
        const formattedAccounts = res.map((bus: any) => ({
          id: bus.id,
          companyId: bus.company_id,
          companyName: bus.company_name,
          registrationNumber: bus.registration_number ?? "-",
          name: bus.name ?? "-",
          capacity: bus.capacity ?? "-",
          model: bus.model ?? "-",
          manufactured_on: bus.manufactured_on ?? "-",
          insurance_upto: bus.insurance_upto ?? "-",
          pollution_upto: bus.pollution_upto ?? "-",
          fitness_upto: bus.fitness_upto ?? "-",
        }));

        console.log("Formatted Accounts:", formattedAccounts);
        setBusList(formattedAccounts);
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
    fetchBus();
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

  const filteredData = busList.filter(
    (row: Bus) =>
      (row.id?.toString()?.toLowerCase() || "").includes(
        search.id.toLowerCase()
      ) &&
      (getCompanyName(row.companyId)?.toLowerCase() || "").includes(
        search.company_name.toLowerCase()
      ) &&
      (row.registrationNumber?.toLowerCase() || "").includes(
        search.registrationNumber.toLowerCase()
      ) &&
      (row.name?.toLowerCase() || "").includes(search.name.toLowerCase()) &&
      (row.capacity?.toString().toLowerCase() || "").includes(
        search.capacity.toLowerCase()
      ) &&
      (row.model?.toLowerCase() || "").includes(search.model.toLowerCase())
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
  const handleCloseDetailCard = () => {
    setSelectedBus(null);
  };

  const refreshList = (value: string) => {
    if (value === "refresh") {
      console.log("Account list refreshed...");
      fetchBus();
    }
  };

  const handleRowClick = (bus: Bus) => {
    const companyName = getCompanyName(bus.companyId);
    setSelectedBus({ ...bus, companyName: companyName });
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
          flex: selectedBus ? { xs: "0 0 100%", md: "0 0 65%" } : "0 0 100%",
          maxWidth: selectedBus ? { xs: "100%", md: "65%" } : "100%",
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
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {filterCompanyId && (
              <Typography variant="body2" color="textSecondary">
                Company Name:{" "}
                {companyList.find((c) => c.id === filterCompanyId)?.name ||
                  filterCompanyId}
              </Typography>
            )}
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
                  ml: "auto",
                  mr: 2,
                  mb: 2,
                  display: "block",
                  backgroundColor: !canManageCompany
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
                disabled={!canManageCompany}
              >
                Add New Bus
              </Button>
            </span>
          </Tooltip>
        </Box>

        <TableContainer sx={{
            flex: 1,
            maxHeight: "calc(100vh - 100px)",
            overflowY: "hidden",
          }}>
          <Table >
            <TableHead>
              <TableRow>
                <TableCell>
                  <b
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: selectedBus ? "0.8rem" : "1rem",
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
                      "& .MuiInputBase-root": {
                        height: 40,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedBus ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedBus ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>
                

                <TableCell>
                  <b
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: selectedBus ? "0.8rem" : "1rem",
                    }}
                  >
                    Name
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
                        fontSize: selectedBus ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedBus ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: selectedBus ? "0.8rem" : "1rem",
                      whiteSpace: selectedBus ? "nowrap" : "normal",
                    }}
                  >
                    Registration Number
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.registrationNumber}
                    onChange={(e) =>
                      handleSearchChange(e, "registrationNumber")
                    }
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 40,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedBus ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedBus ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <b
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: selectedBus ? "0.8rem" : "1rem",
                    }}
                  >
                    Capacity
                  </b>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search"
                    value={search.capacity}
                    onChange={(e) => handleSearchChange(e, "capacity")}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: 40,
                        padding: "4px",
                        textAlign: "center",
                        fontSize: selectedBus ? "0.8rem" : "1rem",
                      },
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                        fontSize: selectedBus ? "0.8rem" : "1rem",
                      },
                    }}
                  />
                </TableCell>

                
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                fontSize: selectedBus ? "0.8rem" : "1rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const isSelected = selectedBus?.id === row.id;
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
                        color: isSelected ? "black" : "black",
                        "&:hover": {
                          backgroundColor: isSelected
                            ? "#E3F2FD !important"
                            : "#E3F2FD",
                        },
                        "& td": {
                          color: isSelected ? "black !important" : "black",
                        },
                      }}
                      >
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.registrationNumber}</TableCell>
                        <TableCell>{row.capacity}</TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No Bus found.
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
      {selectedBus && (
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
          <BusDetailsCard
            bus={selectedBus}
            onUpdate={() => {}}
            onDelete={() => {}}
            onBack={() => setSelectedBus(null)}
            refreshList={(value: any) => refreshList(value)}
            canManageCompany={canManageCompany}
            onCloseDetailCard={handleCloseDetailCard}
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
          <BusCreationForm
            refreshList={(value: any) => refreshList(value)}
            onClose={handleCloseModal}
            defaultCompanyId={filterCompanyId ?? undefined}
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

export default BusListingTable;
