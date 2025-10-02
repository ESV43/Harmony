import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    // Add flexGrow: 1 to the Box to make it fill the space
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
      <TextField
        fullWidth
        label="Search for a song or artist..."
        variant="outlined"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button type="submit" variant="contained" sx={{ ml: 2, p: '15px' }} aria-label="search">
        <SearchIcon />
      </Button>
    </Box>
  );
};

export default SearchBar;
