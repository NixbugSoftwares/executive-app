import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  Typography,
  TextField,
  Tooltip,
} from "@mui/material";
import { useDispatch } from "react-redux";
import ErrorIcon from "@mui/icons-material/Error";
import { fareListApi } from "../../slices/appSlice";
import type { AppDispatch } from "../../store/Store";
import { showInfoToast } from "../../common/toastMessageHelper";
import FareSkeletonPage from "./fareSkeletonPage";
import { Fare } from "../../types/type";
import localStorageHelper from "../../utils/localStorageHelper";

const FareListingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [fareList, setFareList] = useState<Fare[]>([]);
  const [selectedFare, setSelectedFare] = useState<Fare | null>(null);
  const [search, setSearch] = useState({
    id: "",
    name: "",
  });
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [viewMode, setViewMode] = useState<"list" | "create" | "view">("list");
  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageFare = roleDetails?.manage_fare || false;

  const fetchGlobalFares = () => {
    dispatch(fareListApi({ scope: 1 }))
      .unwrap()
      .then((res: any) => {
        const formattedFares = res.data.map((fare: any) => ({
          id: fare.id,
          name: fare.name,
          company_id: fare.company_id,
          version: fare.version,
          attributes: {
            df_version: fare.attributes?.df_version || 1,
            ticket_types: fare.attributes?.ticket_types || [],
            currency_type: fare.attributes?.currency_type || "INR",
            distance_unit: fare.attributes?.distance_unit || "m",
            extra: fare.attributes?.extra || {},
          },
          function: fare.function,
          scope: fare.scope,
          created_on: fare.created_on,
        }));
        setFareList(formattedFares);
      })
      .catch((error) => {
        console.error("Error fetching fares:", error);
        showInfoToast(
          error.message || "Failed to fetch fare list. Please try again."
        );
      });
  };

  useEffect(() => {
    fetchGlobalFares();
  }, []);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof search
  ) => {
    setSearch((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const filteredData = fareList.filter(
    (row) =>
      row.id.toString().toLowerCase().includes(search.id.toLowerCase()) &&
      row.name.toLowerCase().includes(search.name.toLowerCase())
  );

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchGlobalFares();
    }
  };

  if (viewMode === "create" || viewMode === "view") {
    return (
      <FareSkeletonPage
        onCancel={() => {
          setViewMode("list");
          setSelectedFare(null);
        }}
        refreshList={refreshList}
        fareToEdit={viewMode === "view" ? selectedFare : null}
        mode={viewMode}
        canManageFare={canManageFare}
      />
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            flex: "0 0 100%",
            maxWidth: "1000%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRight: "1px solid #e0e0e0",
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Global Fares</Typography>
            <Tooltip
              title={
                !canManageFare
                  ? "You don't have permission, contact the admin"
                  : "click to open the create fare page"
              }
            >
              <span
                style={{ cursor: !canManageFare ? "not-allowed" : "default" }}
              >
                <Button
                  sx={{
                    ml: "auto",
                    mr: 2,
                    mb: 2,
                    display: "block",
                    backgroundColor: !canManageFare
                      ? "#6c87b7 !important"
                      : "#3f51b5",
                    color: "white",
                    "&.Mui-disabled": {
                      backgroundColor: "#6c87b7 !important",
                      color: "#ffffff99",
                    },
                  }}
                  variant="contained"
                  onClick={() => setViewMode("create")}
                  disabled={!canManageFare}
                >
                  Create New Fare
                </Button>
              </span>
            </Tooltip>
          </Box>

          <TableContainer
            sx={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: "25%",
                      maxWidth: "25%",
                      textAlign: "center",
                    }}
                  >
                    <b style={{ display: "block", textAlign: "center" }}>ID</b>
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
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "35",
                      textAlign: "center",
                    }}
                  >
                    <b style={{ display: "block", textAlign: "center" }}>
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
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "75",
                      textAlign: "center",
                    }}
                  >
                    <b style={{ display: "block", textAlign: "center" }}>
                      Ticket Types
                    </b>
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "75",
                      textAlign: "center",
                    }}
                  >
                    <b style={{ display: "block", textAlign: "center" }}>
                      Version
                    </b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((fare) => {
                      const isSelected = selectedFare?.id === fare.id;
                      return (
                        <TableRow
                          key={fare.id}
                          hover
                          selected={isSelected}
                          onClick={() => {
                            setSelectedFare(fare);
                            setViewMode("view");
                          }}
                          sx={{
                            cursor: "pointer",
                            backgroundColor: isSelected
                              ? "#E3F2FD !important"
                              : "inherit",
                            "&:hover": {
                              backgroundColor: isSelected
                                ? "#E3F2FD !important"
                                : "#E3F2FD",
                            },
                          }}
                        >
                          <TableCell>{fare.id}</TableCell>
                          <TableCell
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFare(fare);
                              setViewMode("view");
                            }}
                            sx={{
                              cursor: "pointer",
                              "&:hover": {
                                textDecoration: "underline",
                              },
                            }}
                          >
                            {fare.name ? (
                              fare.name
                            ) : (
                              <Tooltip
                                title="Name not available"
                                placement="bottom"
                              >
                                <ErrorIcon sx={{ color: "#737d72 " }} />
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell>
                            {fare.attributes.ticket_types &&
                            fare.attributes.ticket_types.length > 0 ? (
                              <ul
                                style={{
                                  margin: 0,
                                  paddingLeft: 20,
                                  listStyleType: "disc",
                                  textAlign: "left",
                                }}
                              >
                                {fare.attributes.ticket_types.map(
                                  (type: any, index: number) => (
                                    <li key={index}>
                                      {type.name || `Ticket Type ${index + 1}`}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <Tooltip
                                title="No ticket types available"
                                placement="bottom"
                              >
                                <ErrorIcon sx={{ color: "#737d72" }} />
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell>
                            {fare.version ? (
                              fare.version
                            ) : (
                              <Tooltip
                                title="Version not available"
                                placement="bottom"
                              >
                                <ErrorIcon sx={{ color: "#737d72 " }} />
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No fares found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              p: 1,
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "white",
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
              disabled={
                page >= Math.ceil(filteredData.length / rowsPerPage) - 1
              }
              sx={{ padding: "5px 10px", minWidth: 40 }}
            >
              &gt;
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default FareListingPage;
