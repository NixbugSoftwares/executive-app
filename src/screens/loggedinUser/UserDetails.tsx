import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import localStorageHelper from "../../utils/localStorageHelper";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/Store";
import { accountListApi } from "../../slices/appSlice";

interface UserDetails {
  username: string;
  fullname: string;
  designation: string;
}

const LoggedInUser: React.FC = () => {
  const executive_id = localStorageHelper.getItem("@user")?.executive_id;
  const dispatch = useDispatch<AppDispatch>();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!executive_id) {
        setError("Executive ID not found.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user details using the executive_id
        const response = await dispatch(accountListApi()).unwrap();
        if (response && response.data) {
          setUserDetails({
            username: response.data.username,
            fullname: response.data.fullname,
            designation: response.data.designation,
          });
        } else {
          setError("User details not found.");
        }
      } catch (err) {
        setError("Failed to fetch user details.");
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [executive_id, dispatch]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
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
          height: "100vh",
          color: "error.main",
        }}
      >
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: 2,
      }}
    >
      <Typography variant="h4">User Details</Typography>
      {userDetails ? (
        <>
          <Typography variant="body1">
            <strong>Username:</strong> {userDetails.username}
          </Typography>
          <Typography variant="body1">
            <strong>Full Name:</strong> {userDetails.fullname}
          </Typography>
          <Typography variant="body1">
            <strong>Designation:</strong> {userDetails.designation}
          </Typography>
        </>
      ) : (
        <Typography variant="body1">No user details available.</Typography>
      )}
    </Box>
  );
};

export default LoggedInUser;