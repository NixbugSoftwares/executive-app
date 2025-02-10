import React from 'react';
import Sidebar from '../../common/sidebar';
import { Box } from '@mui/material';
const HomePage: React.FC = () => {
  console.log("Token stored:", localStorage.getItem("@token"))
  console.log("Token expires at:", localStorage.getItem("@token_expires"))
  console.log("User stored:", localStorage.getItem("@user"))

  return(
    <Box>
      <Sidebar/>
      <h1>home Page</h1>
    </Box>

  )
  
};

export default HomePage;
