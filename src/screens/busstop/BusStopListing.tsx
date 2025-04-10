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
  Tooltip
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import MediumPriorityIcon from "@mui/icons-material/Height";
import HighPriorityIcon from "@mui/icons-material/PriorityHigh";
import BusStopAddForm from "./creationForm";
import { useDispatch } from "react-redux";
import MapComponent from "./BusStopMap";
import {
  busStopListApi,
  landmarkListApi,
  busStopDeleteApi,
} from "../../slices/appSlice";
import { AppDispatch } from "../../store/Store";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import Polygon from "ol/geom/Polygon";
import * as ol from "ol";
import { showInfoToast } from "../../common/toastMessageHelper";
import BusStopUpdateForm from "./updationForm";
import localStorageHelper from "../../utils/localStorageHelper";

interface BusStop {
  id: number;
  name: string;
  landmark_id: number;
  location: string;
  status: string;
  parsedLocation?: [number, number] | null;
}

interface Landmark {
  id: number;
  landmarkName: string;
  boundary: string;
  importance: string;
  status: string;
}

const BusStopListing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [busStopList, setBusStopList] = useState<BusStop[]>([]);
  const [landmarkList, setLandmarkList] = useState<Landmark[]>([]);
  const [selectedBusStop, setSelectedBusStop] = useState<BusStop | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(
    null
  );
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [busStopSearch, setBusStopSearch] = useState({
    id: "",
    name: "",
    location: "",
    landmarkName: "",
  });
  const [landmarkSearch, setLandmarkSearch] = useState({ id: "", name: "" });
  const [page, setPage] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [busStopToDelete, setBusStopToDelete] = useState<BusStop | null>(null);
  const [showLandmarkTable, setShowLandmarkTable] = useState(false);
  const vectorSource = useRef(new VectorSource());
  const mapInstance = useRef<ol.Map | null>(null);
  const [busStopLocation, setBusStopLocation] = useState("");
  const rowsPerPage = 10;

   const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageLandmark = roleDetails?.manage_landmark || false;

  const parsePointString = (pointString: string): [number, number] | null => {
    if (!pointString) return null;
    const matches = pointString.match(/POINT\(([^)]+)\)/);
    if (!matches) return null;

    const coords = matches[1].split(" ");
    if (coords.length !== 2) return null;

    return [parseFloat(coords[0]), parseFloat(coords[1])];
  };

  const extractRawPoints = (polygonString: string): string => {
    if (!polygonString) return "";
    const matches = polygonString.match(/\(\((.*?)\)\)/);
    return matches ? matches[1] : "";
  };

  //*********************************** fetching Bus Stops and landmarks ***************************************
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
        console.error("Error fetching bus stops", err);
      });
  };

  const fetchLandmark = () => {
    dispatch(landmarkListApi())
      .unwrap()
      .then((res: any[]) => {
        const formattedLandmarks = res.map((landmark: any) => ({
          id: landmark.id,
          landmarkName: landmark.name,
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
        console.error("Error fetching landmarks", err);
      });
  };

  useEffect(() => {
    fetchBusStop();
    fetchLandmark();
  }, []);

  const getLandmarkNameById = (landmarkId: number): string => {
    const landmark = landmarkList.find(
      (landmark) => landmark.id === landmarkId
    );
    return landmark ? landmark.landmarkName : "Unknown Landmark";
  };

  //************************** Bus Stop Delete function ********************************************************
  const handleBusStopDelete = async () => {
    if (!busStopToDelete) return;

    try {
      const formData = new FormData();
      formData.append("id", String(busStopToDelete.id));
      await dispatch(busStopDeleteApi(formData)).unwrap();
      setDeleteConfirmOpen(false);
      fetchBusStop();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  //************************** Bus Stop functions ********************************************************
  const handleCreateBusStopClick = () => {
    if (!selectedLandmark) {
      // setBusStopLocation(location.toString());
      showInfoToast("You should select a landmark first.");
      return;
    }
  };

  const handleRowClick = (busStop: BusStop) => {
    const coordinates = parsePointString(busStop.location);
    if (coordinates) {
      setSelectedBusStop({
        ...busStop,
        parsedLocation: coordinates,
      });
    }
  };

  const handleLandmarkSelect = (landmark: Landmark) => {
    setSelectedLandmark(landmark);

    if (landmark.boundary) {
      const coordinates = landmark.boundary
        .split(",")
        .map((coord) => coord.trim().split(" ").map(Number))
        .map((coord) => fromLonLat(coord));

      const polygon = new Polygon([coordinates]);
      vectorSource.current.clear();
      vectorSource.current.addFeature(new ol.Feature(polygon));

      if (mapInstance.current) {
        const extent = polygon.getExtent();
        mapInstance.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
        });
      }
    }
  };

  const clearBoundaries = () => {
    vectorSource.current.clear();
  };

  const handleCloseRowClick = () => {
    setSelectedBusStop(null);
    clearBoundaries();
  };

  //************************** Common Pagination ********************************************************

  const CommonPagination = ({ count }: { count: number }) => (
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
        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
        disabled={page === 0}
        sx={{ padding: "5px 10px", minWidth: 40 }}
      >
        &lt;
      </Button>
      {Array.from(
        { length: Math.ceil(count / rowsPerPage) },
        (_, index) => index
      )
        .slice(
          Math.max(0, page - 1),
          Math.min(page + 2, Math.ceil(count / rowsPerPage))
        )
        .map((pageNumber) => (
          <Button
            key={pageNumber}
            onClick={() => setPage(pageNumber)}
            sx={{
              padding: "5px 10px",
              minWidth: 40,
              bgcolor:
                page === pageNumber ? "rgba(21, 101, 192, 0.2)" : "transparent",
              fontWeight: page === pageNumber ? "bold" : "normal",
              borderRadius: "5px",
              transition: "all 0.3s",
              "&:hover": { bgcolor: "rgba(21, 101, 192, 0.3)" },
            }}
          >
            {pageNumber + 1}
          </Button>
        ))}
      <Button
        onClick={() => setPage((prev) => prev + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        sx={{ padding: "5px 10px", minWidth: 40 }}
      >
        &gt;
      </Button>
    </Box>
  );

  //************************** common search function for both tables ********************************************************

  const filteredBusStops = busStopList.filter((row) => {
    const id = row.id.toString().toLowerCase();
    const name = row.name.toLowerCase();
    const landmarkName = getLandmarkNameById(row.landmark_id).toLowerCase();

    return (
      id.includes(busStopSearch.id.toLowerCase()) &&
      name.includes(busStopSearch.name.toLowerCase()) &&
      landmarkName.includes(busStopSearch.landmarkName.toLowerCase())
    );
  });

  const filteredLandmarks = landmarkList.filter((landmark) => {
    const id = landmark.id.toString().toLowerCase();
    const name = landmark.landmarkName.toLowerCase();

    return (
      id.includes(landmarkSearch.id.toLowerCase()) &&
      name.includes(landmarkSearch.name.toLowerCase())
    );
  });

  const currentTableData = showLandmarkTable
    ? filteredLandmarks.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      )
    : filteredBusStops.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      );

  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchBusStop(); // Always refresh bus stops
      if (showLandmarkTable) {
        fetchLandmark(); // Only refresh landmarks if we're showing that table
      }
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
      {/* Left Panel - Table Section */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "60%" },
          maxWidth: { xs: "100%", md: "60%" },
          transition: "all 0.3s ease",
          overflow: "hidden",
          overflowY: "auto",
          position: "relative",
          pt: 6,
        }}
      >
        {/* Add Bus Stop Button */}
        <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <Tooltip 
  title={!canManageLandmark ? "You don't have permission, contact admin" : "Click to switch tables"} 
  arrow
>
  <Button
    variant="contained"
    color={showLandmarkTable ? "secondary" : "primary"}
    onClick={() => {
      setShowLandmarkTable(!showLandmarkTable);
      setPage(0);
      if (!showLandmarkTable) {
        setSelectedBusStop(null);
        clearBoundaries();
        handleCreateBusStopClick();
      }
    }}
    sx={{
      ...(!canManageLandmark && {
        backgroundColor: "#6c87#6c87b7 !importantb7 ",
        color: "white",
                "&.Mui-disabled": {
                  backgroundColor: "#6c87b7 !important",
                  color: "#ffffff99",
                },
      }),
      ...(canManageLandmark && !showLandmarkTable && {
        backgroundColor: "#3f51b5", 
      }),
      ...(canManageLandmark && showLandmarkTable && {
        // Secondary button styling will be applied by the color="secondary" prop
      })
    }}
    disabled={!canManageLandmark}
  >
    {showLandmarkTable ? "Back to Bus Stops" : "Add Bus Stop"}
  </Button>
</Tooltip>
          
        </Box>

        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          {showLandmarkTable ? (
            <>
              <Table>
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
                          value={landmarkSearch.id}
                          onChange={(e) =>
                            setLandmarkSearch({
                              ...landmarkSearch,
                              id: e.target.value,
                            })
                          }
                          fullWidth
                          sx={{
                            "& .MuiInputBase-root": {
                              height: 30,
                              padding: "4px",
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: "35%" }}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <b>Land Mark Name</b>
                        <TextField
                          variant="outlined"
                          size="small"
                          placeholder="Search"
                          value={landmarkSearch.name}
                          onChange={(e) =>
                            setLandmarkSearch({
                              ...landmarkSearch,
                              name: e.target.value,
                            })
                          }
                          fullWidth
                          sx={{
                            "& .MuiInputBase-root": {
                              height: 30,
                              padding: "4px",
                            },
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
                  {(currentTableData as Landmark[]).map((landmark) => (
                    <TableRow
                      key={landmark.id}
                      hover
                      onClick={() => handleLandmarkSelect(landmark)}
                      sx={{
                        backgroundColor:
                        selectedLandmark?.id === landmark.id
                            ? "#E3F2FD"
                            : "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <TableCell>{landmark.id}</TableCell>
                      <TableCell>{landmark.landmarkName}</TableCell>
                      <TableCell>
                        {landmark.importance === "Low" && (
                          <Chip
                            icon={<LowPriorityIcon />}
                            label="Low"
                            color="info"
                            size="small"
                            sx={{
                              backgroundColor:  selectedLandmark?.id === landmark.id
                                ? "#90CAF9"
                                : "#E3F2FD",
                              color:  selectedLandmark?.id === landmark.id
                                ? "#1565C0"
                                : "#1565C0",
                            }}
                          />
                        )}
                        {landmark.importance === "Medium" && (
                          <Chip
                            icon={<MediumPriorityIcon />}
                            label="Medium"
                            color="warning"
                            size="small"
                            sx={{
                              backgroundColor:  selectedLandmark?.id === landmark.id
                                ? "#edd18f"
                                : "#FFE082",
                              color:  selectedLandmark?.id === landmark.id
                                ? "#9f3b03"
                                : "#9f3b03",
                            }}
                          />
                        )}
                        {landmark.importance === "High" && (
                          <Chip
                            icon={<HighPriorityIcon />}
                            label="High"
                            color="error"
                            size="small"
                            sx={{
                              backgroundColor: selectedLandmark?.id === landmark.id
                                ? "#EF9A9A"
                                : "#FFEBEE",
                                color: selectedLandmark?.id === landmark.id
                                ? "#D32F2F"
                                : "#D32F2F",
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {landmark.status === "Validating" && (
                          <Chip
                            icon={<WarningIcon />}
                            label="Validating"
                            color="warning"
                            size="small"
                            sx={{
                              backgroundColor:  selectedLandmark?.id === landmark.id
                                ? "#edd18f"
                                : "#FFE082",
                              color:  selectedLandmark?.id === landmark.id
                                ? "#9f3b03"
                                : "#9f3b03",
                            }}
                          />
                        )}
                        {landmark.status === "Verified" && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Verified"
                            color="success"
                            size="small"
                            sx={{
                              backgroundColor:  selectedLandmark?.id === landmark.id
                                ? "#A5D6A7"
                                : "#E8F5E9",
                              color:  selectedLandmark?.id === landmark.id
                                ? "#2E7D32"
                                : "#2E7D32",
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <>
              <Table>
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
                          value={busStopSearch.id}
                          onChange={(e) =>
                            setBusStopSearch({
                              ...busStopSearch,
                              id: e.target.value,
                            })
                          }
                          fullWidth
                          sx={{
                            "& .MuiInputBase-root": {
                              height: 30,
                              padding: "4px",
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: "35%" }}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <b> Bus Stop Name</b>
                        <TextField
                          variant="outlined"
                          size="small"
                          placeholder="Search"
                          value={busStopSearch.name}
                          onChange={(e) =>
                            setBusStopSearch({
                              ...busStopSearch,
                              name: e.target.value,
                            })
                          }
                          fullWidth
                          sx={{
                            "& .MuiInputBase-root": {
                              height: 30,
                              padding: "4px",
                            },
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: "35%" }}>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                      >
                        <b>Land Mark Name</b>
                        <TextField
                          variant="outlined"
                          size="small"
                          placeholder="Search"
                          value={busStopSearch.landmarkName}
                          onChange={(e) =>
                            setBusStopSearch({
                              ...busStopSearch,
                              landmarkName: e.target.value,
                            })
                          }
                          fullWidth
                          sx={{
                            "& .MuiInputBase-root": {
                              height: 30,
                              padding: "4px",
                            },
                          }}
                        />
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
                  {currentTableData.map((item) => {
                    if ("landmarkName" in item) {
                      // Handle Landmark rendering
                      return (
                        <TableRow
                          key={item.id}
                          hover
                          onClick={() => handleLandmarkSelect(item)}
                          sx={{
                            backgroundColor:
                              selectedLandmark?.id === item.id
                                ? "#E3F2FD"
                                : "inherit",
                            cursor: "pointer",
                          }}
                        >
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.landmarkName}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.importance}
                              color={
                                item.importance === "High"
                                  ? "error"
                                  : item.importance === "Medium"
                                  ? "warning"
                                  : "info"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              color={
                                item.status === "Verified"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    } else {
                      // Handle BusStop rendering
                      const isSelected = selectedBusStop?.id === item.id;
                      return (
                        <TableRow
                          key={item.id}
                          hover
                          onClick={() => handleRowClick(item)}
                          sx={{
                            cursor: "pointer",
                            backgroundColor: isSelected ? "#E3F2FD" : "inherit",
                            "&:hover": { backgroundColor: "#E3F2FD" },
                          }}
                        >
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            {getLandmarkNameById(item.landmark_id)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={
                                item.status === "Validating" ? (
                                  <WarningIcon />
                                ) : (
                                  <CheckCircleIcon />
                                )
                              }
                              label={item.status}
                              color={
                                item.status === "Verified"
                                  ? "success"
                                  : "warning"
                              }
                              size="small"
                              sx={{
                                backgroundColor: isSelected
                                  ? item.status === "Validating"
                                    ? "#edd18f"
                                    : "#A5D6A7"
                                  : item.status === "Validating"
                                  ? "#FFE082"
                                  : "#E8F5E9",
                                color: isSelected
                                  ? item.status === "Validating"
                                    ? "#9f3b03"
                                    : "#2E7D32"
                                  : item.status === "Validating"
                                  ? "#9f3b03"
                                  : "#2E7D32",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </TableContainer>

        <CommonPagination
          count={
            showLandmarkTable
              ? filteredLandmarks.length
              : filteredBusStops.length
          }
        />
      </Box>

      {/* Right Panel - Map Section */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "40%" },
          height: "100vh",
          maxWidth: { xs: "100%", md: "40%" },
          position: "relative",
        }}
      >
        <MapComponent
          selectedBuststop={selectedBusStop}
          selectedLandmark={selectedLandmark}
          vectorSource={vectorSource}
          handleCloseRowClick={handleCloseRowClick}
          busStops={busStopList}
          landmarkList={landmarkList}
          onLandmarkSelect={(landmark) => {
            setSelectedLandmark(landmark);
            setSelectedBusStop(null);
          }}
          onCreateBusStop={(location) => {
            setBusStopLocation(location);
            setOpenCreateModal(true);
          }}
          onDeleteClick={() => {
            setBusStopToDelete(selectedBusStop);
            setDeleteConfirmOpen(true);
          }}
          onUpdateClick={() => setOpenUpdateModal(true)}
          clearBoundaries={clearBoundaries}
          isOpen={true}
          selectedBoundary={selectedLandmark?.boundary}
        />
      </Box>

      {/* Create Bus Stop Dialog */}
      <Dialog
        // sx={{ zIndex: 1000 }}
        fullWidth
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="sm"
      >
        <DialogContent>
          {selectedLandmark && (
            <Typography variant="subtitle1" gutterBottom>
              Selected Landmark: {selectedLandmark.landmarkName}
            </Typography>
          )}
          <BusStopAddForm
            landmarkId={selectedLandmark?.id || null}
            location={busStopLocation}
            onClose={() => {
              setOpenCreateModal(false);
              setSelectedLandmark(null);
              setBusStopLocation("");
              setShowLandmarkTable(false);
            }}
            refreshList={(value: any) => refreshList(value)}
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
          {selectedBusStop && (
            <BusStopUpdateForm
              onClose={() => setOpenUpdateModal(false)}
              refreshList={(value: string) => refreshList(value)}
              busStopId={selectedBusStop.id}
              
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateModal(false)} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
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
          <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
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

export default BusStopListing;
