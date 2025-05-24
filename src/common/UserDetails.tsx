import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/Store";
import { loggedinuserAPI } from "../slices/appSlice";
import localStorageHelper from "../utils/localStorageHelper";
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';

interface UserDetails {
  username: string;
  full_name: string;
  designation: string;
  executive_id: number;
}

const LoggedInUser: React.FC = () => {
  const userLoggedIn = localStorageHelper.getItem("@user")?.executive_id;
  console.log("executive_id from localStorage >>>>>>>>>>>>>", userLoggedIn, typeof userLoggedIn);

  const dispatch = useDispatch<AppDispatch>();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userLoggedIn) {
        setError("Executive ID not found.");
        setLoading(false);
        return;
      }
      try {
        const response = await dispatch(loggedinuserAPI(userLoggedIn)).unwrap();
        console.log("API Response >>>>>>>>>>>>>", response);

        if (response && Array.isArray(response)) {
          const user = response.find((user) => user.id === userLoggedIn);
          if (user) {
            setUserDetails({
              username: user.username,
              full_name: user.full_name,
              designation: user.designation,
              executive_id: user.id,
            });
          } else {
            setError("User details not found.");
          }
        } else {
          setError("Invalid API response.");
        }
      } catch (err) {
        setError("Failed to fetch user details.");
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userLoggedIn, dispatch]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "10vh", // Adjusted height for compactness
        }}
      >
        <CircularProgress size={20} /> {/* Smaller loading spinner */}
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "error.main",
        }}
      >
        <Typography variant="body2">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    gap: 1,
    p: 1,
    backgroundColor: "background.paper",
    borderRadius: 1,
    textAlign: 'left'
  }}
>
  {userDetails ? (
    <>
      <Typography variant="body2" noWrap sx={{ display: 'flex', alignItems: 'center' }}>
        <strong>@{userDetails.username}</strong>
      </Typography>
      <Typography variant="body2" noWrap sx={{ display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ marginRight: 1 }} /> {userDetails.full_name}
      </Typography>
      <Typography variant="body2" noWrap sx={{ display: 'flex', alignItems: 'center' }}>
        <WorkIcon sx={{ marginRight: 1 }} />{userDetails.designation}
      </Typography>
    </>
  ) : (
    <Typography variant="body2">No user details available.</Typography>
  )}
</Box>
  );
};

export default LoggedInUser;