import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePlayerStore } from '../store.js';
import { Box, Typography, DialogContent } from '@mui/material';

// A simple utility to parse LRC format
const parseLrc = (lrcText) => {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach(line => {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time, text });
      }
    }
  });
  return result;
};

const Lyrics = ({ trackProgress }) => {
  const { lyrics, currentTrack } = usePlayerStore();
  const [activeIndex, setActiveIndex] = useState(-1);
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);

  const lyricLines = useMemo(() => parseLrc(lyrics), [lyrics]);

  useEffect(() => {
    // Find the current active lyric line based on the song's progress
    let newIndex = lyricLines.findIndex((line, index) => {
      const nextLine = lyricLines[index + 1];
      return trackProgress >= line.time && (nextLine ? trackProgress < nextLine.time : true);
    });
    setActiveIndex(newIndex);
  }, [trackProgress, lyricLines]);

  useEffect(() => {
    // This effect scrolls the active line into the center of the view
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeLine = activeLineRef.current;
      const containerHeight = container.clientHeight;
      const activeLineTop = activeLine.offsetTop;
      const activeLineHeight = activeLine.clientHeight;

      container.scrollTo({
        top: activeLineTop - containerHeight / 2 + activeLineHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  if (!lyrics) {
    return (
      <DialogContent>
        <Typography align="center" sx={{p: 4}}>
            {currentTrack ? "No synced lyrics found for this song." : "Loading..."}
        </Typography>
      </DialogContent>
    );
  }

  return (
    <DialogContent ref={containerRef} sx={{ height: '60vh', overflowY: 'auto', textAlign: 'center' }}>
      {lyricLines.map((line, index) => (
        <Typography
          key={index}
          ref={index === activeIndex ? activeLineRef : null}
          sx={{
            p: 2,
            opacity: index === activeIndex ? 1 : 0.5,
            transform: index === activeIndex ? 'scale(1.05)' : 'scale(1)',
            transition: 'opacity 0.5s, transform 0.5s',
            fontWeight: index === activeIndex ? 'bold' : 'normal',
            color: index === activeIndex ? 'text.primary' : 'text.secondary'
          }}
        >
          {line.text}
        </Typography>
      ))}
    </DialogContent>
  );
};

export default Lyrics;