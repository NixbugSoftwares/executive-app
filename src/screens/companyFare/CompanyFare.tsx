import React from "react";
import { Sidebar } from "../../common";
import { Box } from "@mui/material";
import CompanyFareListingPage from "./CompanyFareListingpage";
const CompanyFarePage: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        scrollBehavior: "auto",
      }}
    >
      <Sidebar />
      <Box sx={{ width: "100%", p: 3 }}>
        <CompanyFareListingPage />
      </Box>
    </Box>
  );
};

export default CompanyFarePage;
