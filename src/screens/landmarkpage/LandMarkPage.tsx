import React from 'react'
import Sidebar from '../../common/sidebar';
import { Box } from '@mui/material';
import LandmarkListing from './LandmarkListingPage';

function LandMarkPage() {
  return (
    <Box>
      <Sidebar/>
      <LandmarkListing />

    </Box>
  )
}

export default LandMarkPage