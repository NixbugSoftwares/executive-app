import React from 'react';
import Sidebar from '../../common/sidebar';
import { Box } from '@mui/material';
import AccountCreationForm from './AccountForm';
const AccountPage: React.FC = () => {
  return(
    <Box>
      <Sidebar/>
    <h1>AccountPage</h1>  
      <AccountCreationForm/>
    </Box>

  )
  
};

export default AccountPage;

