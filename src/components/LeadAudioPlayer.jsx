import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, IconButton, LinearProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export default function LeadAudioPlayer({ audioSrc }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const formatSeconds = (sec) => {
    if (isNaN(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Box sx={{ bgcolor: '#1E293B', p: 1.2, borderRadius: '6px', border: '1px solid #334155' }}>
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={togglePlay}
          size="small"
          sx={{
            bgcolor: '#0284C7',
            color: '#FFFFFF',
            width: 32,
            height: 32,
            '&:hover': { bgcolor: '#0369A1' }
          }}
        >
          {isPlaying ? <PauseIcon sx={{ fontSize: 18 }} /> : <PlayArrowIcon sx={{ fontSize: 18 }} />}
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
            <Typography variant="caption" sx={{ color: '#38BDF8', fontWeight: 700, fontSize: '11px' }}>
              {isPlaying ? 'Playing Audio...' : 'Audio Ready'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '10.5px' }}>
              {formatSeconds(currentTime)} / {formatSeconds(duration || 15)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={duration > 0 ? (currentTime / duration) * 100 : (isPlaying ? 50 : 0)}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: '#334155',
              '& .MuiLinearProgress-bar': { bgcolor: '#38BDF8' }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
