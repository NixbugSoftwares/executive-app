import React from 'react'
import Sidebar from '../../common/sidebar';
import { Box } from '@mui/material';
import LandmarkListing from './LandmarkListingPage';

function LandMarkPage() {
  return (
    <Box
    sx={{
      display: "flex",
      height: "100vh",
      width: "100%",
      scrollBehavior: "auto",
    }}>
      <Sidebar/>
      <Box
      sx={{ width: "100%", p: 3 }}
      >
      <LandmarkListing />
      </Box>
      

    </Box>
  )
}

export default LandMarkPage