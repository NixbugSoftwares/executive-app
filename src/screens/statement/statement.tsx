import React from "react";
import { Sidebar } from "../../common";
import { Box } from "@mui/material";
import StatementListing from "./listingPage";

const StatmentPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        scrollBehavior: "auto",
      }}
    >
      <Sidebar />
      <Box sx={{ width: "100%", p: 3 }}>
        <StatementListing />
      </Box>


    </Box>
  );
};

export default StatmentPage;
