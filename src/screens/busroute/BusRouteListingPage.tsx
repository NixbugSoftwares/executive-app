import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { useParams } from "react-router-dom";
import MapComponent from "./BusRouteMap";
import { companyListApi } from "../../slices/appSlice";
import type { AppDispatch } from "../../store/Store";
import { useDispatch } from "react-redux";

interface Company {
  id: number;
  name: string;
}

interface Landmark {
  id: number;
  name: string;
  order: number;
  time: string;
}

const BusRouteListingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { companyId } = useParams();
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(
    companyId ? parseInt(companyId) : null
  );
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);

  // Dummy landmarks data
  useEffect(() => {
    const dummyLandmarks: Landmark[] = [
      { id: 1, name: "Central Station", order: 1, time: "08:00 AM" },
      { id: 2, name: "City Mall", order: 2, time: "08:15 AM" },
      { id: 3, name: "University Campus", order: 3, time: "08:30 AM" },
      { id: 4, name: "Sports Complex", order: 4, time: "08:45 AM" },
      { id: 5, name: "Lakeview Park", order: 5, time: "09:00 AM" },
    ];
    setLandmarks(dummyLandmarks);
  }, []);

  const fetchCompany = () => {
    dispatch(companyListApi())
      .unwrap()
      .then((res: any[]) => {
        setCompanyList(res);
      })
      .catch((err: any) => {
        console.error("Error fetching companies", err);
      });
  };

  useEffect(() => {
    fetchCompany();
  }, [filterCompanyId]);

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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        width: "100%",
        height: "100vh",
        gap: 2,
        p: 2,
        boxSizing: "border-box",
      }}
    >
      {/* Company Name Header */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
          backgroundColor: "background.paper",
          p: 1,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        {filterCompanyId && (
          <Typography variant="h6" color="textPrimary">
            {companyList.find((c) => c.id === filterCompanyId)?.name ||
              `Company ID: ${filterCompanyId}`}
          </Typography>
        )}
      </Box>

      {/* Timeline Section (Left) */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "40%" },
          maxWidth: { xs: "100%", md: "40%" },
          height: "100%",
          transition: "all 0.3s ease",
          overflow: "hidden",
          overflowY: "auto",
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Route Timeline
        </Typography>

        <List sx={{ width: "100%" }}>
          {landmarks.map((landmark, index) => (
            <Box key={landmark.id}>
              <ListItem
                sx={{
                  display: "flex",
                  alignItems: "center",
                  py: 2,
                  backgroundColor:
                    index % 2 === 0 ? "action.hover" : "background.paper",
                  borderRadius: 1,
                }}
              >
                <Chip
                  label={landmark.order}
                  color="primary"
                  sx={{ mr: 2, minWidth: 32 }}
                />
                <ListItemText
                  primary={landmark.name}
                  secondary={`Arrival: ${landmark.time}`}
                  sx={{ fontWeight: "medium" }}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    onClick={() => console.log("Edit", landmark.id)}
                    aria-label="edit"
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      setLandmarks((prev) =>
                        prev.filter((l) => l.id !== landmark.id)
                      )
                    }
                    aria-label="delete"
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              {index < landmarks.length - 1 && (
                <Divider
                  component="li"
                  sx={{
                    borderLeftWidth: 2,
                    borderLeftStyle: "dashed",
                    borderColor: "divider",
                    height: 20,
                    ml: 3.5,
                    listStyle: "none",
                  }}
                />
              )}
            </Box>
          ))}
        </List>
      </Box>

      {/* Map Section (Right) */}
      <Box
        sx={{
          flex: { xs: "0 0 100%", md: "60%" },
          height: "100%",
          maxWidth: { xs: "100%", md: "60%" },
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
          <MapComponent />
        </Box>
      </Box>
    </Box>
  );
};

export default BusRouteListingPage;
