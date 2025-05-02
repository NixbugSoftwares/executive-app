import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { busRouteLandmarkListApi, busRouteListApi, routeDeleteApi } from "../../slices/appSlice";
import { AppDispatch } from "../../store/Store";
import { useParams, useLocation } from "react-router-dom";
import MapComponent from "./BusRouteMap";
import BusRouteCreation from "./BusRouteCreationPage";
import {
  showErrorToast,
  showSuccessToast,
} from "../../common/toastMessageHelper";
import localStorageHelper from "../../utils/localStorageHelper";
import BusRouteDetailsPage from "./BusRouteDetails";
import { SelectedLandmark, RouteLandmark } from '../../types/type';
interface Route {
  id: number;
  companyId: number;
  name: string;
}


const BusRouteListing = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(
    companyId ? parseInt(companyId) : null
  );
  const [showCreationForm, setShowCreationForm] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [routeList, setRouteList] = useState<Route[]>([]);
  const [search, setSearch] = useState({ id: "", name: "", location: "" });
  const [landmarks, setLandmarks] = useState<SelectedLandmark[]>([]);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{id: number, name: string} | null>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageRoutes = roleDetails?.manage_route || false;
  const mapRef = useRef<{clearRoutePath: () => void}>(null);
  const [_selectedRouteLandmarks, setSelectedRouteLandmarks] = useState<RouteLandmark[]>([]);
  const [mapLandmarks, setMapLandmarks] = useState<SelectedLandmark[]>([]);

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

  const fetchRoute = () => {
    dispatch(busRouteListApi(filterCompanyId))
      .unwrap()
      .then((res: any[]) => {
        const formattedRoutes = res.map((routes: any) => ({
          id: routes.id,
          companyId: routes.company_id,
          name: routes.name,
        }));
        setRouteList(formattedRoutes);
      })
      .catch((err: any) => {
        console.error("Error fetching routes", err);
      });
  };

  useEffect(() => {
    fetchRoute();
  }, []);

  useEffect(() => {
    const fetchRouteLandmarks = async () => {
      if (selectedRoute) {
        try {
          const response = await dispatch(
            busRouteLandmarkListApi(selectedRoute.id)
          ).unwrap();
          
          const processed = response.map((lm: any) => ({
            id: lm.landmark_id,
            name: lm.name,
            sequenceId: lm.sequence_id,
            arrivalTime: lm.arrival_time,
            departureTime: lm.departure_time,
            distance_from_start: lm.distance_from_start ?? 0 
          }));
          
          setSelectedRouteLandmarks(processed);
          setMapLandmarks(processed);
        } catch (error) {
          showErrorToast("Failed to load route landmarks");
        }
      }
    };
  
    fetchRouteLandmarks();
  }, [selectedRoute]);

  useEffect(() => {
    return () => {
      setMapLandmarks([]);
      if (mapRef.current) {
        mapRef.current.clearRoutePath();
      }
    };
  }, []);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    column: keyof typeof search
  ) => {
    setSearch((prev) => ({
      ...prev,
      [column]: (e.target as HTMLInputElement).value,
    }));
  };

  const filteredData = routeList.filter((row) => {
    const id = row.id ? row.id.toString().toLowerCase() : "";
    const name = row.name ? row.name.toLowerCase() : "";

    const searchId = search.id ? search.id.toLowerCase() : "";
    const searchName = search.name ? search.name.toLowerCase() : "";

    return id.includes(searchId) && name.includes(searchName);
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const toggleCreationForm = () => {
    setShowCreationForm(!showCreationForm);
    if (showCreationForm) {
      setLandmarks([]);
    }
  };

  const handleRouteCreated = () => {
    setShowCreationForm(true);
    setLandmarks([]);
    fetchRoute();
  };

  const handleAddLandmark = (newLandmark: SelectedLandmark) => {
    const updatedLandmark = {
      ...newLandmark,
      sequenceId: landmarks.length + 1,
    };
    setLandmarks([...landmarks, updatedLandmark]);
  };

  const handleRemoveLandmark = (id: number) => {
    const updatedLandmarks = landmarks
      .filter((landmark) => landmark.id !== id)
      .map((landmark, index) => ({
        ...landmark,
        sequenceId: index + 1,
      }));
    setLandmarks(updatedLandmarks);
  };

  const handleDeleteClick = (route: Route) => {
    setRouteToDelete(route);
    setDeleteConfirmOpen(true);
  };

  const handleRouteDelete = async () => {
    if (!routeToDelete) return;

    try {
      const formData = new FormData();
      formData.append("id", routeToDelete.id.toString());
      await dispatch(routeDeleteApi(formData)).unwrap();
      showSuccessToast("Route deleted successfully");
      fetchRoute();
    } catch (error) {
      showErrorToast("Failed to delete route");
    } finally {
      setDeleteConfirmOpen(false);
      setRouteToDelete(null);
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
      {/* Left Side: Table or Creation Form or Details */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "50%" },
          maxWidth: { xs: "100%", md: "50%" },
          transition: "all 0.3s ease",
          overflow: "hidden",
          overflowY: "auto",
        }}
      >
        {selectedRoute ? (
          // In BusRouteListing component
<BusRouteDetailsPage 
  routeId={selectedRoute.id} 
  routeName={selectedRoute.name}
  onBack={() => {
    setSelectedRoute(null);
    setMapLandmarks([]); 
    if (mapRef.current) {
      mapRef.current.clearRoutePath(); // Clear the map when going back
    }
  }}
  onLandmarksUpdate={setMapLandmarks}
/>
        ) : showCreationForm ? (
          <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                onClick={toggleCreationForm}
                variant="outlined"
                sx={{ ml: "auto" }}
              >
                Back to Routes
              </Button>
            </Box>
            <BusRouteCreation
              companyId={filterCompanyId}
              landmarks={landmarks}
              onLandmarkRemove={handleRemoveLandmark}
              onSuccess={handleRouteCreated}
              onCancel={toggleCreationForm}
              onClearRoute={() => mapRef.current?.clearRoutePath()}
            />
          </>
        ) : (
          <>
            <Stack
              direction="row"
              justifyContent="right"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Tooltip
                title={
                  !canManageRoutes
                    ? "You don't have permission, contact the admin"
                    : "click to open the route creation form"
                }
                placement="top-end"
              >
                <span
                  style={{
                    cursor: !canManageRoutes ? "not-allowed" : "default",
                  }}
                >
                  <Button
                    sx={{
                      ml: "auto",
                      mr: 2,
                      mb: 2,
                      display: "block",
                      backgroundColor: !canManageRoutes
                        ? "#6c87b7 !important"
                        : "#3f51b5",
                      color: "white",
                      "&.Mui-disabled": {
                        backgroundColor: "#6c87b7 !important",
                        color: "#ffffff99",
                      },
                    }}
                    variant="contained"
                    onClick={toggleCreationForm}
                    disabled={!canManageRoutes}
                  >
                    Create Routes
                  </Button>
                </span>
              </Tooltip>
            </Stack>

            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
              <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "20%" }}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <b>ID</b>
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
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: "60%" }}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <b>Name</b>
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
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: "20%", textAlign: "center" }}>
                      <b>Actions</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row) => (
                        <TableRow key={row.id}
                        hover
                        >
                          <TableCell>{row.id}</TableCell>
                          <TableCell 
                            sx={{ 
                              cursor: "pointer",
                              
                            }}
                            onClick={() => setSelectedRoute({ id: row.id, name: row.name })}
                          >
                            {row.name}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClick(row)}
                            >
                              <Delete sx={{ fontSize: 20 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No Routes found.
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
                  Math.min(
                    page + 2,
                    Math.ceil(filteredData.length / rowsPerPage)
                  )
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
          </>
        )}
      </Box>

      {/* Right Side: Map */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "50%" },
          height: "100vh",
          maxWidth: { xs: "100%", md: "50%" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <MapComponent
          onAddLandmark={handleAddLandmark}
          isSelecting={showCreationForm}
          ref={mapRef}
          landmarks={mapLandmarks}
          mode={selectedRoute ? 'view' : 'create'}
        />
      </Box>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Route Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the route "{routeToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleRouteDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusRouteListing;