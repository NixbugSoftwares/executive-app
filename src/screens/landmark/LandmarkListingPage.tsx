import React from "react";
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
  Chip,
  Tooltip,
  Collapse,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import MediumPriorityIcon from "@mui/icons-material/Height";
import HighPriorityIcon from "@mui/icons-material/PriorityHigh";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LandmarkAddForm from "./LandmarkAddForm";
import MapComponent from "./LandmarkMap";
import { useDispatch } from "react-redux";
import {
  landmarkListApi,
  landmarkDeleteApi,
  busStopListApi,
  busStopDeleteApi,
} from "../../slices/appSlice";
import { AppDispatch } from "../../store/Store";
import LandmarkUpdateForm from "./LandmarkUpdateForm";
import VectorSource from "ol/source/Vector";
import BusStopAddForm from "./busStopCreationForm";
import BusStopUpdateForm from "./BusStopUpdationForm";
import { showErrorToast } from "../../common/toastMessageHelper";
import { Landmark, BusStop } from "../../types/type";

const LandmarkListing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [landmarkList, setLandmarkList] = useState<Landmark[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    null
  );
  const [busStopList, setBusStopList] = useState<BusStop[]>([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openBusStopModal, setOpenBusStopModal] = useState(false);
  const [busStopToUpdate, setBusStopToUpdate] = useState<BusStop | null>(null);
  const [busStopUpdateModalOpen, setBusStopUpdateModalOpen] = useState(false);
  const [search, setSearch] = useState({ id: "", name: "", location: "" });
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
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

  //****************exctracting points of landmark and busstop**********************
  const extractRawPoints = (polygonString: string): string => {
    if (!polygonString) return "";
    const matches = polygonString.match(/\(\((.*?)\)\)/);
    return matches ? matches[1] : "";
  };

  const parsePointString = (pointString: string): [number, number] | null => {
    if (!pointString) return null;
    const matches = pointString.match(/POINT\(([^)]+)\)/);
    if (!matches) return null;

    const coords = matches[1].split(" ");
    if (coords.length !== 2) return null;

    return [parseFloat(coords[0]), parseFloat(coords[1])];
  };

  //********************fetching landmarks and busstops*****************************
  const fetchLandmark = () => {
    dispatch(landmarkListApi())
      .unwrap()
      .then((res: any[]) => {
        const formattedLandmarks = res.map((landmark: any) => ({
          id: landmark.id,
          name: landmark.name,
          boundary: extractRawPoints(landmark.boundary),
          importance:
            landmark.importance === 1
              ? "Low"
              : landmark.importance === 2
              ? "Medium"
              : "High",
          status: landmark.status === 1 ? "Validating" : "Verified",
        }));
        setLandmarkList(formattedLandmarks);
      })
      .catch((err: any) => {
        showErrorToast(err);
      });
  };

  const fetchBusStop = () => {
    dispatch(busStopListApi())
      .unwrap()
      .then((res: any[]) => {
        const formattedBusStops = res.map((busStop: any) => {
          const coords = parsePointString(busStop.location);
          return {
            id: busStop.id,
            name: busStop.name,
            landmark_id: busStop.landmark_id,
            location: busStop.location,
            parsedLocation: coords,
            status: busStop.status === 1 ? "Validating" : "Verified",
          };
        });
        setBusStopList(formattedBusStops);
      })
      .catch((err: any) => {
        showErrorToast(err);
      });
  };

  useEffect(() => {
    fetchLandmark();
    fetchBusStop();
  }, []);

  const getBusStopsForLandmark = (landmarkId: number): BusStop[] => {
    return busStopList.filter((stop) => stop.landmark_id === landmarkId);
  };

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
      fetchLandmark();
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
      fetchBusStop();
    } catch (error: any) {
      showErrorToast(error);
    }
  };

  const handleRowClick = (landmark: Landmark) => {
    if (isDrawing) {
      return;
    }
    setSelectedLandmark(landmark);
    setExpandedRow(expandedRow === landmark.id ? null : landmark.id);
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

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    column: keyof typeof search
  ) => {
    setSearch((prev) => ({
      ...prev,
      [column]: (e.target as HTMLInputElement).value,
    }));
  };

  const filteredData = landmarkList.filter((row) => {
    const id = row.id ? row.id.toString().toLowerCase() : "";
    const name = row.name ? row.name.toLowerCase() : "";
    const location = row.boundary ? row.boundary.toLowerCase() : "";
    const searchId = search.id ? search.id.toLowerCase() : "";
    const searchName = search.name ? search.name.toLowerCase() : "";
    const searchLocation = search.location ? search.location.toLowerCase() : "";

    return (
      id.includes(searchId) &&
      name.includes(searchName) &&
      location.includes(searchLocation)
    );
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
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
                <TableCell colSpan={2} sx={{ width: "20%" }}>
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
                        "& .MuiInputBase-root": { height: 40, padding: "4px" },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ width: "30%" }}>
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
                        "& .MuiInputBase-root": { height: 40, padding: "4px" },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center">
                    <b>Importance</b>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center">
                    <b>Status</b>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
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
                              backgroundColor: isSelected
                                ? "#E3F2FD"
                                : "inherit",
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
                            <TableCell>
                              {row.importance === "Low" && (
                                <Chip
                                  icon={<LowPriorityIcon />}
                                  label="Low"
                                  color="info"
                                  size="small"
                                  sx={{
                                    backgroundColor: isSelected
                                      ? "#90CAF9"
                                      : "#E3F2FD",
                                    color: isSelected ? "#1565C0" : "#1565C0",
                                  }}
                                />
                              )}
                              {row.importance === "Medium" && (
                                <Chip
                                  icon={<MediumPriorityIcon />}
                                  label="Medium"
                                  color="warning"
                                  size="small"
                                  sx={{
                                    backgroundColor: isSelected
                                      ? "#edd18f"
                                      : "#FFE082",
                                    color: isSelected ? "#9f3b03" : "#9f3b03",
                                  }}
                                />
                              )}
                              {row.importance === "High" && (
                                <Chip
                                  icon={<HighPriorityIcon />}
                                  label="High"
                                  color="error"
                                  size="small"
                                  sx={{
                                    backgroundColor: isSelected
                                      ? "#EF9A9A"
                                      : "#FFEBEE",
                                    color: isSelected ? "#D32F2F" : "#D32F2F",
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {row.status === "Validating" && (
                                <Chip
                                  icon={<WarningIcon />}
                                  label="Validating"
                                  color="warning"
                                  size="small"
                                  sx={{
                                    backgroundColor: isSelected
                                      ? "#edd18f"
                                      : "#FFE082",
                                    color: isSelected ? "#9f3b03" : "#9f3b03",
                                  }}
                                />
                              )}
                              {row.status === "Verified" && (
                                <Chip
                                  icon={<CheckCircleIcon />}
                                  label="Verified"
                                  color="success"
                                  size="small"
                                  sx={{
                                    backgroundColor: isSelected
                                      ? "#A5D6A7"
                                      : "#E8F5E9",
                                    color: isSelected ? "#2E7D32" : "#2E7D32",
                                  }}
                                />
                              )}
                            </TableCell>
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
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ mt: 2 }}
                                  >
                                    <strong>Bus Stops:</strong>
                                  </Typography>

                                  {getBusStopsForLandmark(row.id).length > 0 ? (
                                    <TableContainer
                                      component={Paper}
                                      sx={{ maxHeight: 300, overflow: "auto" }}
                                    >
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>
                                              <strong>Name</strong>
                                            </TableCell>
                                            <TableCell>
                                              <strong>Status</strong>
                                            </TableCell>
                                            <TableCell align="center">
                                              <strong>Actions</strong>
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {getBusStopsForLandmark(row.id).map(
                                            (stop) => (
                                              <TableRow key={stop.id}>
                                                <TableCell>
                                                  {stop.name}
                                                </TableCell>
                                                <TableCell>
                                                  <Chip
                                                    icon={
                                                      stop.status ===
                                                      "Validating" ? (
                                                        <WarningIcon />
                                                      ) : (
                                                        <CheckCircleIcon />
                                                      )
                                                    }
                                                    label={stop.status}
                                                    color={
                                                      stop.status === "Verified"
                                                        ? "success"
                                                        : "warning"
                                                    }
                                                    size="small"
                                                    sx={{
                                                      backgroundColor:
                                                        isSelected
                                                          ? stop.status ===
                                                            "Validating"
                                                            ? "#edd18f"
                                                            : "#A5D6A7"
                                                          : stop.status ===
                                                            "Validating"
                                                          ? "#FFE082"
                                                          : "#E8F5E9",
                                                      color: isSelected
                                                        ? stop.status ===
                                                          "Validating"
                                                          ? "#9f3b03"
                                                          : "#2E7D32"
                                                        : stop.status ===
                                                          "Validating"
                                                        ? "#9f3b03"
                                                        : "#2E7D32",
                                                    }}
                                                  />
                                                </TableCell>

                                                <TableCell align="right">
                                                  <Button
                                                    size="small"
                                                    color="primary"
                                                    sx={{ mr: 1 }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setBusStopToUpdate(stop);
                                                      setBusStopUpdateModalOpen(
                                                        true
                                                      );
                                                    }}
                                                  >
                                                    Update
                                                  </Button>
                                                  <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleBusStopDeleteClick(
                                                        stop
                                                      );
                                                    }}
                                                  >
                                                    Delete
                                                  </Button>
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
            landmarks={landmarkList}
            isDrawing={isDrawing}
            onDrawingChange={handleDrawingChange}
            busStops={busStopList}
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
            refreshList={fetchLandmark}
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
              refreshList={fetchLandmark}
              landmarkId={selectedLandmark.id}
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
            refreshList={fetchBusStop}
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
          {busStopToUpdate && (
            <BusStopUpdateForm
              onClose={() => setBusStopUpdateModalOpen(false)}
              refreshList={fetchBusStop}
              busStopId={busStopToUpdate.id}
              location={busStopToUpdate.location}
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
