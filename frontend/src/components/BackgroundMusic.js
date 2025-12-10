import React, { useState, useEffect, useRef } from 'react';
import './BackgroundMusic.css';

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(null);

  const tracks = [
    { name: 'Tema 1', src: '/music/track1.mp3' },
    { name: 'Tema 2', src: '/music/track2.mp3' }
  ];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    const savedPlaying = localStorage.getItem('musicPlaying') === 'true';
    const savedTrack = parseInt(localStorage.getItem('musicTrack') || '0');
    const savedVolume = parseFloat(localStorage.getItem('musicVolume') || '0.3');
    
    setCurrentTrack(savedTrack);
    setVolume(savedVolume);
    audioRef.current.volume = savedVolume;
    audioRef.current.src = tracks[savedTrack].src;
    
    if (savedPlaying) {
      audioRef.current.play().catch(err => {
        console.log('Auto-play prevented:', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }

    // Escuchar eventos personalizados
    const handleToggle = (e) => {
      const shouldPlay = e.detail.playing;
      if (shouldPlay) {
        audioRef.current.play().catch(err => {
          console.error('Error playing:', err);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    const handleTrackChange = (e) => {
      const newTrack = e.detail.track;
      const wasPlaying = !audioRef.current.paused;
      
      if (wasPlaying) {
        audioRef.current.pause();
      }
      
      audioRef.current.src = tracks[newTrack].src;
      setCurrentTrack(newTrack);
      
      if (wasPlaying) {
        audioRef.current.play().catch(err => console.error('Error playing:', err));
      }
    };

    const handleVolumeChange = (e) => {
      const newVolume = e.detail.volume;
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    };

    window.addEventListener('musicToggle', handleToggle);
    window.addEventListener('musicTrackChange', handleTrackChange);
    window.addEventListener('musicVolumeChange', handleVolumeChange);

    return () => {
      window.removeEventListener('musicToggle', handleToggle);
      window.removeEventListener('musicTrackChange', handleTrackChange);
      window.removeEventListener('musicVolumeChange', handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Este componente no renderiza nada, solo maneja el audio
  return null;
};

export default BackgroundMusic;
