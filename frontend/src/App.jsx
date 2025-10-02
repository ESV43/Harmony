import React, { useState } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast'; 
import { createTheme, ThemeProvider, CssBaseline, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SearchBar from './components/SearchBar.jsx';
import ResultsList from './components/ResultsList.jsx';
import MainLayout from './components/MainLayout.jsx';
import { usePlayerStore } from './store.js';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    primary: {
      main: '#1DB954',
    },
  },
});

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const audioQuality = usePlayerStore((state) => state.audioQuality);
  const setAudioQuality = usePlayerStore((state) => state.setAudioQuality);

  const handleSearch = async (query) => {
    setLoading(true);
    setSearchResults([]);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/search`, {
        params: { q: query },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

      <MainLayout>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
          <SearchBar onSearch={handleSearch} />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="quality-select-label">Streaming Quality</InputLabel>
            <Select
              labelId="quality-select-label"
              id="quality-select"
              value={audioQuality}
              label="Streaming Quality"
              onChange={(e) => setAudioQuality(e.target.value)}
            >
              {/* --- FINAL, CORRECT 3-TIER OPTIONS --- */}
              <MenuItem value="best">Best Available (YT)</MenuItem>
              <MenuItem value="high">High (320k via Saavn)</MenuItem>
              <MenuItem value="datasaver">Data Saver (YT)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <ResultsList results={searchResults} loading={loading} />
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
