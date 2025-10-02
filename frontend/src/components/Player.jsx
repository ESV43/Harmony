import React, { useRef, useEffect, useState } from 'react';
import { usePlayerStore } from '../store.js';
import { Box, Typography, Slider, IconButton, Dialog, Avatar } from '@mui/material';
import { PlayArrow, Pause, SkipNext, SkipPrevious, Mic, InfoOutlined } from '@mui/icons-material';
import Lyrics from './Lyrics.jsx';
import toast from 'react-hot-toast';

const Player = () => {
  const { currentTrack, isPlaying, togglePlay, setIsPlaying } = usePlayerStore();
  const audioRef = useRef(null);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyricsOpen, setLyricsOpen] = useState(false);

  // This effect ONLY handles loading a new song URL.
  useEffect(() => {
    if (currentTrack?.streamUrl && audioRef.current) {
      console.log("Loading new stream URL into audio element:", currentTrack.streamUrl);
      audioRef.current.src = currentTrack.streamUrl;
      audioRef.current.load(); // Explicitly tell the audio element to load the new source
    }
  }, [currentTrack?.streamUrl]);

  // This effect handles the user's play/pause intent.
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      // We attempt to play, and if it fails, we log it.
      // This helps catch autoplay policy errors.
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio Playback Error:", error);
          // You could potentially show a "Click to Play" overlay here if needed
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // --- THIS IS THE DEFINITIVE FIX & AUTOPLAY HANDLER ---
  const handleCanPlay = () => {
    console.log("Audio element is ready to play. `isPlaying` is:", isPlaying);
    // When the audio is ready, if the user's intent is to play, then play.
    if (isPlaying) {
      // Ensure volume is set correctly before playing
      audioRef.current.volume = 1.0;
      audioRef.current.muted = false;
      audioRef.current.play().catch(e => console.error("Autoplay after load failed:", e));
    }
  };

  const handleShowSource = () => {
    if (currentTrack && currentTrack.sourceInfo) {
      toast.success(`Source: ${currentTrack.sourceInfo}`, { duration: 4000, icon: 'ℹ️' });
    } else {
      toast.error("Source information is not available yet.");
    }
  };

  const handleTimeUpdate = () => { if (audioRef.current) setProgress(audioRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const handleSeek = (event, newValue) => { if (audioRef.current) audioRef.current.currentTime = newValue; };
  const formatTime = (time) => !isFinite(time) ? '00:00' : new Date(time * 1000).toISOString().substr(14, 5);
  
  if (!currentTrack) return null;

  return (
    <>
      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: '#181818',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)', p: 2, zIndex: 1300,
        display: 'flex', alignItems: 'center', gap: 2, height: '90px'
      }}>
        {/* The audio element now has explicit volume/muted properties */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          // --- PROACTIVE FIXES ---
          volume={1.0}
          muted={false}
        />
        
        <Avatar variant="square" src={currentTrack.thumbnailUrl} sx={{ width: 56, height: 56 }} />
        <Box sx={{ width: '200px' }}>
          <Typography noWrap>{currentTrack.title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{currentTrack.artists.join(', ')}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <IconButton><SkipPrevious /></IconButton>
          <IconButton onClick={togglePlay} sx={{ mx: 1 }}>
            {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
          </IconButton>
          <IconButton><SkipNext /></IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 3, gap: 2 }}>
          <Typography variant="caption">{formatTime(progress)}</Typography>
          <Slider value={progress} max={duration || 0} onChange={handleSeek} size="small" />
          <Typography variant="caption">{formatTime(duration)}</Typography>
        </Box>

        <IconButton onClick={handleShowSource} title="Show Stream Source">
          <InfoOutlined />
        </IconButton>
        <IconButton onClick={() => setLyricsOpen(true)}>
          <Mic />
        </IconButton>
      </Box>

      <Dialog open={lyricsOpen} onClose={() => setLyricsOpen(false)} fullWidth maxWidth="sm">
        <Lyrics trackProgress={progress} />
      </Dialog>
    </>
  );
};

export default Player;
