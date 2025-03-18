import { useEffect, useState } from "react";
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
} from "@mui/material";
import LandmarkAddForm from "./LandmarkAddForm";
import MapComponent from "./MapComponent";
import { useDispatch } from "react-redux";
import { landmarkListApi, landmarkDeleteApi } from "../../slices/appSlice";
import { AppDispatch } from "../../store/Store";
import localStorageHelper from "../../utils/localStorageHelper";
import LandmarkUpdateForm from "./LandmarkUpdateForm";

interface Landmark {
  id: number;
  name: string;
  boundary: string;
  status: string;
  importance: string;
}

const LandmarkListing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [landmarkList, setLandmarkList] = useState<Landmark[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [search, setSearch] = useState({ id: "", name: "", location: "" });
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [boundary, setBoundary] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [landmarkToDelete, setLandmarkToDelete] = useState<Landmark | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [landmarkToUpdate, setLandmarkToUpdate] = useState<Landmark | null>(null);
  const roleDetails = localStorageHelper.getItem("@roleDetails");
  const canManageLandmark = roleDetails?.manage_landmark || false;

  const extractRawPoints = (polygonString: string): string => {
    if (!polygonString) return "";
    const matches = polygonString.match(/\(\((.*?)\)\)/);
    return matches ? matches[1] : "";
  };

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
        console.error("Error fetching accounts", err);
      });
  };

  useEffect(() => {
    fetchLandmark();
  }, []);

  const handleLandmarkDelete = async () => {
    if (!landmarkToDelete) {
      console.error("Error: Landmark to delete is missing");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", String(landmarkToDelete.id)); // Append the landmark ID

      // Dispatch the delete API
      const response = await dispatch(landmarkDeleteApi(formData)).unwrap();
      console.log("Landmark deleted:", response);

      // Close the confirmation dialog
      setDeleteConfirmOpen(false);

      // Refresh the landmark list
      refreshList("refresh");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleRowClick = (landmark: Landmark) => {
    setSelectedLandmark(landmark);
  };

  const handlePolygonSelect = (coordinates: string) => {
    setBoundary(coordinates);
    setTimeout(() => setOpenCreateModal(true), 0);
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

  const refreshList = (value: string) => {
    if (value === "refresh") {
      fetchLandmark();
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
      {/* Left Side: Table */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "50%" },
          maxWidth: { xs: "100%", md: "50%" },
          transition: "all 0.3s ease",
          overflow: "hidden",
          overflowY: selectedLandmark ? "auto" : "hidden",
        }}
      >
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "15%" }}>
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
                <TableCell sx={{ width: "15%" }}>
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
                    <b>Status</b>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: "200px" }}>
                  <Box display="flex" justifyContent="center">
                    <b>Importance</b>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: "200px" }}>
                  <Box display="flex" justifyContent="center">
                    <b>Actions</b>
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
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.importance}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip
                              title={
                                !canManageLandmark
                                  ? "You don't have permission, contact the admin"
                                  : "click to Update the landmark."
                              }
                              placement="top-end"
                            >
                              <span
                                style={{
                                  cursor: !canManageLandmark
                                    ? "not-allowed"
                                    : "default",
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click
                                    setLandmarkToUpdate(row); // Set the landmark to update
                                    setOpenUpdateModal(true); // Open the update modal
                                  }}
                                  disabled={!canManageLandmark} // Disable if no permission
                                >
                                  Update
                                </Button>
                              </span>
                            </Tooltip>
                            <Tooltip
                              title={
                                !canManageLandmark
                                  ? "You don't have permission, contact the admin"
                                  : "click to Delete  the landmark."
                              }
                              placement="top-end"
                            >
                              <span
                                style={{
                                  cursor: !canManageLandmark
                                    ? "not-allowed"
                                    : "default",
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLandmarkToDelete(row);
                                    setDeleteConfirmOpen(true);
                                  }}
                                >
                                  Delete
                                </Button>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
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

      {/* Right Side: Map */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "30%" },
          height: "1000px",
          maxWidth: { xs: "100%", md: "50%" },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box
          sx={{
            height: "100%",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 2,
          }}
        >
          <MapComponent
            onDrawEnd={handlePolygonSelect}
            isOpen={true}
            selectedBoundary={selectedLandmark?.boundary}
          />
        </Box>
      </Box>

      {/* Dialog for Adding a Landmark */}
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
            refreshList={(value: any) => refreshList(value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)} color="error">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Updating a Landmark */}
      <Dialog
        open={openUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          position: "absolute",
          top: "10%", // Adjust the position as needed
          left: "50%", // Center horizontally
          transform: "translateX(-50%)", // Center horizontally
        }}
      >
        <DialogContent>
          {landmarkToUpdate && (
            <LandmarkUpdateForm
              onClose={() => setOpenUpdateModal(false)}
              refreshList={(value: string) => refreshList(value)}
              landmarkId={landmarkToUpdate.id}
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
    </Box>
  );
};

export default LandmarkListing;