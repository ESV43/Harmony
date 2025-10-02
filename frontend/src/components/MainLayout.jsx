import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar.jsx';
import Player from './Player.jsx';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Sidebar />
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}
        >
          {children}
        </Box>
      </Box>
      <Player />
    </Box>
  );
};

export default MainLayout;