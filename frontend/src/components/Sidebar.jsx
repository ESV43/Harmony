import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AlbumIcon from '@mui/icons-material/Album';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Sidebar = () => {
  return (
    <Box
      sx={{
        width: 240,
        height: 'calc(100vh - 90px)', // Full height minus the player bar
        bgcolor: 'background.default',
        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <List>
        <ListItem>
          <Typography variant="h6">Harmonize</Typography>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected> {/* We'll make this dynamic later */}
            <ListItemIcon><SearchIcon /></ListItemIcon>
            <ListItemText primary="Search" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List>
            <ListItem>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>YOUR LIBRARY</Typography>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon><LibraryMusicIcon /></ListItemIcon>
                    <ListItemText primary="Playlists" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon><AlbumIcon /></ListItemIcon>
                    <ListItemText primary="Albums" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemIcon><FavoriteIcon /></ListItemIcon>
                    <ListItemText primary="Liked Songs" />
                </ListItemButton>
            </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;