import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

export const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  audioQuality: 'best', // Default to best quality
  lyrics: null,
  
  setAudioQuality: (quality) => set({ audioQuality: quality }),

  playSong: async (track) => {
    const quality = get().audioQuality;
    set({ currentTrack: { ...track, streamUrl: null, sourceInfo: null }, isPlaying: false, lyrics: null });

    try {
      // --- THIS IS THE CRITICAL FIX ---
      // We must send title and artist to the backend as it now requires them.
      const streamResponse = await axios.get('http://127.0.0.1:5000/api/stream', {
        params: { 
          videoId: track.videoId, 
          quality: quality,
          title: track.title,
          artist: track.artists.join(', ')
        }
      });
      
      set((state) => ({
          currentTrack: { 
              ...state.currentTrack, 
              streamUrl: streamResponse.data.streamUrl,
              sourceInfo: streamResponse.data.sourceInfo 
          },
          isPlaying: true
      }));

      // Lyrics request is unchanged and correct
      axios.get('http://127.0.0.1:5000/api/lyrics', {
          params: { title: track.title, artist: track.artists.join(', '), album: track.album, duration_seconds: track.duration_seconds }
      }).then(lyricsResponse => {
          if (lyricsResponse.data.lyrics) set({ lyrics: lyricsResponse.data.lyrics });
      }).catch(e => console.log("Lyrics not found."));

    } catch (error) {
      console.error("Error fetching stream URL:", error);
      toast.error('Could not find a playable stream for this song.'); 
      set({ isPlaying: false, currentTrack: null }); 
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
