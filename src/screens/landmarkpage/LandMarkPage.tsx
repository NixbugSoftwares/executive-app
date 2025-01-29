import React from 'react'
import Sidebar from '../../common/sidebar';
import { Box } from '@mui/material';

function LandMarkPage() {
  return (
    <Box>
      <Sidebar/>
      <h1>Land mark</h1>
      <a href="/landmark/create">addform</a>
    </Box>
  )
}

export default LandMarkPage