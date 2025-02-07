import React from 'react'
import Sidebar from '../../common/sidebar';
import { Box } from '@mui/material';
import LandmarkListing from './LandmarkListingPage';

const LandMarkPage: React.FC = () => {
  return (
    <Box
    sx={{
      display: "flex",
      height: "100%",
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