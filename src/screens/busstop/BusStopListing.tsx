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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import BusStopAddForm from "./creationForm";
import { useDispatch } from "react-redux";
import MapComponent from "./BusStopMap";
import { busStopListApi, landmarkListApi,busStopDeleteApi } from "../../slices/appSlice";
import { AppDispatch } from "../../store/Store";
import VectorSource from "ol/source/Vector";

interface BusStop {
  id: number;
  name: string;
  landmark_id: number;
  location: string;
  status: string;
  parsedLocation?: [number, number];
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
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [search, setSearch] = useState({ id: "", name: "", location: "" });
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
//   const [loccation, setLoccation] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [busStopToDelete, setBusStopToDelete] = useState<BusStop | null>(null);
//   const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const vectorSource = useRef(new VectorSource());

  const parsePointString = (pointString: string): [number, number] | null => {
    if (!pointString) return null;
    const matches = pointString.match(/POINT\(([^)]+)\)/);
    if (!matches) return null;
    
    const coords = matches[1].split(' ');
    if (coords.length !== 2) return null;
    
    return [parseFloat(coords[0]), parseFloat(coords[1])];
  };

  const extractRawPoints = (polygonString: string): string => {
    if (!polygonString) return "";
    const matches = polygonString.match(/\(\((.*?)\)\)/);
    return matches ? matches[1] : "";
  };

  //****************************bus stop listing ********************************
  const fetchBusStop = () => {
    dispatch(busStopListApi())
      .unwrap()
      .then((res: any[]) => {
        const formattedBusStops = res.map((BusStop: any) => {
          const coords = parsePointString(BusStop.location);
          return {
            id: BusStop.id,
            name: BusStop.name,
            landmark_id: BusStop.landmark_id,
            location: BusStop.location,
            parsedLocation: coords, 
            status: BusStop.status === 1 ? "Validating" : "Verified",
          };
        });
        setBusStopList(formattedBusStops);
      })
      .catch((err: any) => {
        console.error("Error fetching accounts", err);
      });
  };

  //****************************landmark listing ********************************
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
          console.error("Error fetching accounts", err);
        });
    };

  useEffect(() => {
    fetchBusStop();
    fetchLandmark();
  }, []);
  const getLandmarkNameById = (landmarkId: number): string => {
    const landmark = landmarkList.find(landmark => landmark.id === landmarkId);
    return landmark ? landmark.landmarkName : "Unknown Landmark";
  };
//***********************************bus stop delete *****************************
  const handleBusStopDelete = async () => {
    if (!busStopToDelete) {
      console.error("Error: Landmark to delete is missing");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", String(busStopToDelete.id));
      const response = await dispatch(busStopDeleteApi(formData)).unwrap();
      console.log("Landmark deleted:", response);
      setDeleteConfirmOpen(false);
      refreshList("refresh");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };


const handleRowClick = (busStop: BusStop) => {
  const coordinates = parsePointString(busStop.location);
  if (coordinates) {
    setSelectedBusStop({
      ...busStop,
      parsedLocation: coordinates 
    });
  }
};

const clearBoundaries = () => {
  vectorSource.current.clear();
};


  const handleCloseRowClick = () => {
    setSelectedBusStop(null);
    clearBoundaries();
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

  const filteredData = busStopList.filter((row) => {
    const id = row.id ? row.id.toString().toLowerCase() : "";
    const name = row.name ? row.name.toLowerCase() : "";
    const location = row.location ? row.location.toLowerCase() : "--";

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

  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchBusStop();
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
                        "& .MuiInputBase-root": { height: 30, padding: "4px" },
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
                    <b>Name</b>
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Search"
                      value={search.name}
                      onChange={(e) => handleSearchChange(e, "name")}
                      fullWidth
                      sx={{
                        "& .MuiInputBase-root": { height: 30, padding: "4px" },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center">
                    <b>LandMark Name</b>
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
                    const isSelected = selectedBusStop?.id === row.id;
                    return (
                     
                        <TableRow
                          hover
                          onClick={() => handleRowClick(row)}
                          sx={{
                            cursor:  "pointer",
                            backgroundColor: isSelected ? "#E3F2FD" : "inherit",
                            opacity: 1,
                            "&:hover": {
                              backgroundColor:  "#E3F2FD",
                            },
                          }}
                        >
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.name}</TableCell>
                            <TableCell>{getLandmarkNameById(row.landmark_id)}</TableCell>
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
                     
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No Bus Stop found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
          selectedBuststop={selectedBusStop}
          vectorSource={vectorSource}
          handleCloseRowClick={handleCloseRowClick}
          busStops={busStopList}
          onDeleteClick={() => {
            setBusStopToDelete(selectedBusStop);
            setDeleteConfirmOpen(true);
          }}
          landmarkList={landmarkList}
          />
        </Box>
      </Box>

      {/* <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <BusStopAddForm
            busStop=""
            onClose={() => setOpenCreateModal(false)}
            refreshList={(value: any) => refreshList(value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>  */}

       {/* <Dialog
        open={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        maxWidth="sm"
      >
        <DialogContent>
          {selectedLandmark && (
            <LandmarkUpdateForm
              onClose={() => setOpenUpdateModal(false)}
              refreshList={(value: string) => refreshList(value)}
              landmarkId={selectedLandmark.id}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateModal(false)} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog> */}

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this Landmark?
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
