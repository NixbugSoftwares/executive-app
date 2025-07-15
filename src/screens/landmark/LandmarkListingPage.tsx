import React, { useCallback } from "react";
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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Tooltip,
  Collapse,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LandmarkAddForm from "./LandmarkAddForm";
import MapComponent from "./LandmarkMap";
import { useDispatch, useSelector } from "react-redux";
import {
  landmarkListApi,
  landmarkDeleteApi,
  busStopListApi,
  busStopDeleteApi,
} from "../../slices/appSlice";
import { AppDispatch, RootState } from "../../store/Store";
import LandmarkUpdateForm from "./LandmarkUpdateForm";
import VectorSource from "ol/source/Vector";
import BusStopAddForm from "./busStopCreationForm";
import BusStopUpdateForm from "./BusStopUpdationForm";
import { showErrorToast } from "../../common/toastMessageHelper";
import { Landmark, BusStop } from "../../types/type";
import PaginationControls from "../../common/paginationControl";
import { SelectChangeEvent } from "@mui/material";

const getTypeBackendValue = (displayValue: string): string => {
  const typeMap: Record<string, string> = {
    Local: "1",
    Village: "2",
    District: "3",
    State: "4",
    National: "5",
  };
  return typeMap[displayValue] || "";
};

const LandmarkListing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [landmarkList, setLandmarkList] = useState<Landmark[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    null
  );
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openBusStopModal, setOpenBusStopModal] = useState(false);
  const [busStopToUpdate, setBusStopToUpdate] = useState<BusStop | null>(null);
  const [busStopUpdateModalOpen, setBusStopUpdateModalOpen] = useState(false);
  const [search, setSearch] = useState({ id: "", name: "", type: "" });
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [hasNextPage, setHasNextPage] = useState(false);
  const [boundary, setBoundary] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [busStopToDelete, setBusStopToDelete] = useState<BusStop | null>(null);
  const [busStopDeleteConfirmOpen, setBusStopDeleteConfirmOpen] =
    useState(false);
  const [landmarkToDelete, setLandmarkToDelete] = useState<Landmark | null>(
    null
  );
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const vectorSource = useRef(new VectorSource());
  const [isDrawing, setIsDrawing] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [busStopsByLandmark, setBusStopsByLandmark] = useState<{
    [key: number]: BusStop[];
  }>({});
  const canCreateLandmark = useSelector((state: RootState) =>
    state.app.permissions.includes("create_landmark")
  );
  const canUpdateLandmark = useSelector((state: RootState) =>
    state.app.permissions.includes("update_landmark")
  );

  //****************exctracting points of landmark and busstop**********************
  const extractRawPoints = (polygonString: string): string => {
    if (!polygonString) return "";
    const matches = polygonString.match(/\(\((.*?)\)\)/);
    return matches ? matches[1] : "";
  };
  //********************fetching landmarks and busstops*****************************
  const fetchLandmark = useCallback((pageNumber: number, searchParams = {}) => {
    const offset = pageNumber * rowsPerPage;
    dispatch(landmarkListApi({ limit: rowsPerPage, offset, ...searchParams }))
      .unwrap()
      .then((res) => {
        console.log("Fetch Response||||||:", res);

        const items = res.data || [];
        const formattedLandmarks = items.map((landmark: any) => ({
          id: landmark.id,
          name: landmark.name,
          boundary: extractRawPoints(landmark.boundary),
          type:
            landmark.type === 1
              ? "Local"
              : landmark.type == 2
              ? "Village"
              : landmark.type == 3
              ? "District"
              : landmark.type == 4
              ? "State"
              : landmark.type == 5
              ? "National"
              : "not found",
        }));
        setLandmarkList(formattedLandmarks);
        setHasNextPage(items.length === rowsPerPage);
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        showErrorToast(
          error.detail ||
            error.message ||
            error ||
            "Failed to fetch account list"
        );
      })
      .finally(() => setIsLoading(false));
  }, []);
  const fetchBusStopsForLandmark = (landmarkId: number) => {
    dispatch(busStopListApi({ landmark_id: landmarkId }))
      .unwrap()
      .then((res: any[]) => {
        const formattedBusStops = res.map((busStop: any) => ({
          id: busStop.id,
          name: busStop.name,
          landmark_id: busStop.landmark_id,
          location: busStop.location,
          status: busStop.status === 1 ? "Validating" : "Verified",
        }));
        setBusStopsByLandmark((prev) => ({
          ...prev,
          [landmarkId]: formattedBusStops,
        }));
      })
      .catch((error) => {
        showErrorToast(
          error.detail || error.message || error || "Failed to fetch bus stops"
        );
      });
  };
  const handleRowClick = (landmark: Landmark) => {
    if (isDrawing) return;
    setSelectedLandmark(landmark);
    setExpandedRow(expandedRow === landmark.id ? null : landmark.id);
    if (!busStopsByLandmark[landmark.id]) {
      fetchBusStopsForLandmark(landmark.id);
    }
  };

  useEffect(() => {
    const typeBackendValue = getTypeBackendValue(debouncedSearch.type);
    const searchParams = {
      ...(debouncedSearch.id && { id: debouncedSearch.id }),
      ...(debouncedSearch.name && { name: debouncedSearch.name }),
      ...(debouncedSearch.type && { type: typeBackendValue }),
    };

    fetchLandmark(page, searchParams);
  }, [page, debouncedSearch, fetchLandmark]);

  //*************************DELETE landmark and busstop*****************************
  const handleLandmarkDelete = async () => {
    if (!landmarkToDelete) {
      showErrorToast("Error: Landmark to delete is missing");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", String(landmarkToDelete.id));
      await dispatch(landmarkDeleteApi(formData)).unwrap();
      setDeleteConfirmOpen(false);
      refreshList("refresh");
      setExpandedRow(null);
      setSelectedLandmark(null);
    } catch (error: any) {
      showErrorToast(error);
    }
  };

  const handleBusStopDeleteClick = (busStop: BusStop) => {
    setBusStopToDelete(busStop);
    setBusStopDeleteConfirmOpen(true);
  };

  const handleBusStopDelete = async () => {
    if (!busStopToDelete) {
      showErrorToast("Error: Bus stop to delete is missing");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("id", String(busStopToDelete.id));
      await dispatch(busStopDeleteApi(formData)).unwrap();
      setBusStopDeleteConfirmOpen(false);
      fetchBusStopsForLandmark(busStopToDelete.landmark_id!);
    } catch (error: any) {
      showErrorToast(error);
    }
  };

  const clearBoundaries = () => {
    vectorSource.current.clear();
  };

  const handleCloseRowClick = () => {
    setSelectedLandmark(null);
    setExpandedRow(null);
    // clearBoundaries();
  };

  const handlePolygonSelect = (coordinates: string) => {
    setBoundary(coordinates);
    setTimeout(() => setOpenCreateModal(true), 0);
  };

  const handlePointSelect = (coordinates: string) => {
    setLocation(coordinates);
    setTimeout(() => setOpenBusStopModal(true), 0);
  };

  const handleDrawingChange = (drawingState: boolean) => {
    setIsDrawing(drawingState);
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
    setSearch((prev) => ({ ...prev, type: value }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedSearch((prev) => ({ ...prev, type: value }));
      setPage(0);
    }, 700);
  }, []);
  const handleChangePage = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    []
  );
  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchLandmark(page, debouncedSearch);
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
          flex: { xs: "0 0 100%", md: "50%" },
          maxWidth: { xs: "100%", md: "50%" },
          transition: "all 0.3s ease",
          overflow: "hidden",
          overflowY: "auto",
        }}
      >
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2} sx={{ width: "25%" }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <b>ID</b>
                    <TextField
                      type="number"
                      variant="outlined"
                      size="small"
                      placeholder="Search"
                      value={search.id}
                      onChange={(e) => handleSearchChange(e, "id")}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": { height: 40, padding: "4px" },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ width: "50%" }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <b>Landmark Name</b>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Search"
                      value={search.name}
                      onChange={(e) => handleSearchChange(e, "name")}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": { height: 40, padding: "4px" },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <b>Type</b>
                    <Select
                      value={search.type}
                      onChange={handleSelectChange}
                      displayEmpty
                      size="small"
                      fullWidth
                      sx={{ height: 40 }}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Local">Local</MenuItem>
                      <MenuItem value="Village">Village</MenuItem>
                      <MenuItem value="District">District</MenuItem>
                      <MenuItem value="State">State</MenuItem>
                      <MenuItem value="National">National</MenuItem>
                    </Select>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {landmarkList.length > 0 ? (
                landmarkList.map((row) => {
                  const isSelected = selectedLandmark?.id === row.id;

                  return (
                    <React.Fragment key={row.id}>
                      <Tooltip
                        title={
                          isDrawing
                            ? "Finish drawing on the map first"
                            : "Click to view details"
                        }
                      >
                        <TableRow
                          hover
                          onClick={() => handleRowClick(row)}
                          sx={{
                            cursor: isDrawing ? "not-allowed" : "pointer",
                            backgroundColor: isSelected ? "#E3F2FD" : "inherit",
                            opacity: isDrawing ? 0.7 : 1,
                            "&:hover": {
                              backgroundColor: isDrawing
                                ? "inherit"
                                : isSelected
                                ? "#E3F2FD !important"
                                : "#E3F2FD",
                            },
                          }}
                        >
                          <TableCell>
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedRow(
                                  expandedRow === row.id ? null : row.id
                                );
                              }}
                            >
                              {expandedRow === row.id ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.type}</TableCell>
                        </TableRow>
                      </Tooltip>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={6}
                        >
                          <Collapse
                            in={expandedRow === row.id}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{
                                margin: 1,
                                p: 2,
                                backgroundColor: "#f5f5f5",
                                borderRadius: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                  <strong>Bus Stops:</strong>
                                </Typography>

                                {(busStopsByLandmark[row.id] || []).length >
                                0 ? (
                                  <TableContainer
                                    component={Paper}
                                    sx={{ maxHeight: 300, overflow: "auto" }}
                                  >
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>ID</TableCell>
                                          <TableCell>
                                            <strong>Name</strong>
                                          </TableCell>

                                          <TableCell align="center">
                                            <strong>Actions</strong>
                                          </TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {(busStopsByLandmark[row.id] || []).map(
                                          (stop) => (
                                            <TableRow key={stop.id}>
                                              <TableCell>{stop.id}</TableCell>
                                              <TableCell>
                                                <Tooltip
                                                  title={stop.name}
                                                  placement="bottom"
                                                >
                                                  <Typography noWrap>
                                                    {stop.name.length > 15
                                                      ? `${stop.name.substring(
                                                          0,
                                                          15
                                                        )}...`
                                                      : stop.name}
                                                  </Typography>
                                                </Tooltip>
                                              </TableCell>

                                              <TableCell align="center">
                                                <Tooltip
                                                  title={
                                                    !canUpdateLandmark ||
                                                    !canCreateLandmark
                                                      ? "You don't have permission, contact the admin"
                                                      : "Click to update the Bus stop"
                                                  }
                                                  placement="top-end"
                                                >
                                                  <span
                                                    style={{
                                                      cursor:
                                                        !canUpdateLandmark ||
                                                        !canCreateLandmark
                                                          ? "not-allowed"
                                                          : "default",
                                                    }}
                                                  >
                                                    <Button
                                                      size="small"
                                                      color="primary"
                                                      sx={{ mr: 1,  }}
                                                      disabled={
                                                        !canUpdateLandmark ||
                                                        !canCreateLandmark
                                                      }
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setBusStopToUpdate(
                                                          stop
                                                        );
                                                        setBusStopUpdateModalOpen(
                                                          true
                                                        );
                                                      }}
                                                    >
                                                      Update
                                                    </Button>
                                                  </span>
                                                </Tooltip>

                                                <Tooltip
                                                  title={
                                                    !canUpdateLandmark ||
                                                    !canCreateLandmark
                                                      ? "You don't have permission, contact the admin"
                                                      : "Click to delete the Bus stop"
                                                  }
                                                  placement="top-end"
                                                >
                                                  <span
                                                    style={{
                                                      cursor:
                                                        !canUpdateLandmark ||
                                                        !canCreateLandmark
                                                          ? "not-allowed"
                                                          : "default",
                                                    }}
                                                  >
                                                    <Button
                                                      size="small"
                                                      color="error"
                                                      disabled={
                                                        !canUpdateLandmark ||
                                                        !canCreateLandmark
                                                      }
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBusStopDeleteClick(
                                                          stop
                                                        );
                                                      }}
                                                    >
                                                      Delete
                                                    </Button>
                                                  </span>
                                                </Tooltip>
                                              </TableCell>
                                            </TableRow>
                                          )
                                        )}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontStyle: "italic",
                                      color: "text.secondary",
                                    }}
                                  >
                                    No bus stops added yet
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No landmarks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/*************************************** Pagination    ****************************************/}
        <PaginationControls
          page={page}
          onPageChange={(newPage) => handleChangePage(null, newPage)}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
        />
      </Box>

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
        <Box
          sx={{
            height: "calc(100vh - 20px)",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 2,
          }}
        >
          <MapComponent
            onDrawEnd={handlePolygonSelect}
            isOpen={true}
            selectedBoundary={selectedLandmark?.boundary}
            selectedLandmark={selectedLandmark}
            onUpdateClick={() => setOpenUpdateModal(true)}
            onDeleteClick={() => {
              setLandmarkToDelete(selectedLandmark);
              setDeleteConfirmOpen(true);
            }}
            handleCloseRowClick={handleCloseRowClick}
            clearBoundaries={clearBoundaries}
            vectorSource={vectorSource}
            isDrawing={isDrawing}
            onDrawingChange={handleDrawingChange}
            busStops={
              selectedLandmark ? busStopsByLandmark[selectedLandmark.id] : []
            }
            onBusStopPointSelect={handlePointSelect}
          />
        </Box>
      </Box>

      {/******************  landmark Create ,Update, Delete Modals ***************************/}

      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <LandmarkAddForm
            boundary={boundary}
            onClose={() => setOpenCreateModal(false)}
            refreshList={refreshList}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        maxWidth="sm"
      >
        <DialogContent>
          {selectedLandmark && (
            <LandmarkUpdateForm
              onClose={() => setOpenUpdateModal(false)}
              refreshList={refreshList}
              landmarkId={selectedLandmark.id}
              landmarkData={{
                name: selectedLandmark.name,
                boundary: selectedLandmark.boundary,
                type: selectedLandmark.type,
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateModal(false)} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this Landmark?
          </Typography>
          {landmarkToDelete && (
            <Typography>
              <b>ID:</b> {landmarkToDelete.id}, <b>Name:</b>{" "}
              {landmarkToDelete.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLandmarkDelete} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/******************  Bus Stop Create ,Update, Delete Modals ***************************/}

      <Dialog
        open={openBusStopModal}
        onClose={() => setOpenBusStopModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <BusStopAddForm
            location={location}
            onClose={() => setOpenBusStopModal(false)}
            refreshBusStops={() =>
              selectedLandmark && fetchBusStopsForLandmark(selectedLandmark.id)
            }
            landmarkId={selectedLandmark?.id || null}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBusStopModal(false)} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={busStopUpdateModalOpen}
        onClose={() => setBusStopUpdateModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {busStopToUpdate && selectedLandmark && (
            <BusStopUpdateForm
              busStop={busStopToUpdate}
              landmark={selectedLandmark}
              onClose={() => setBusStopUpdateModalOpen(false)}
              refreshBusStops={() =>
                fetchBusStopsForLandmark(selectedLandmark.id)
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBusStopUpdateModalOpen(false)}
            color="error"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={busStopDeleteConfirmOpen}
        onClose={() => setBusStopDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this Bus Stop?
          </Typography>
          {busStopToDelete && (
            <Typography>
              <b>ID:</b> {busStopToDelete.id}, <b>Name:</b>{" "}
              {busStopToDelete.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBusStopDeleteConfirmOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleBusStopDelete} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandmarkListing;
