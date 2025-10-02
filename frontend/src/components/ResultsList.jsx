import React from 'react';
import { Box, CircularProgress, Card, CardActionArea, CardContent, CardMedia, Typography, Grid } from '@mui/material';
import { usePlayerStore } from '../store.js';

const ResultsList = ({ results, loading }) => {
  const playSong = usePlayerStore((state) => state.playSong);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    // Use the container prop on the parent Grid
    <Grid container spacing={2}>
      {results.map((song) => (
        // Remove the `item` prop and use object syntax for breakpoints
        <Grid key={song.videoId} item xs={12} sm={6} md={4}>
          <Card 
            sx={{ display: 'flex', transition: '0.2s', '&:hover': { transform: 'scale(1.03)' } }}
            onClick={() => playSong(song)}
          >
            <CardActionArea sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <CardMedia
                component="img"
                sx={{ width: 100, height: 100 }}
                image={song.thumbnailUrl}
                alt={song.title}
              />
              <CardContent sx={{ flex: '1 0 auto', overflow: 'hidden' }}>
                <Typography component="div" variant="subtitle1" noWrap>
                  {song.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div" noWrap>
                  {song.artists.join(', ')}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ResultsList;
