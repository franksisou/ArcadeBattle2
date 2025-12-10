import React, { useState, useEffect } from 'react';
import './BackgroundMusic.css';

const MusicControls = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const tracks = [
    { name: 'Tema 1', src: '/music/track1.mp3' },
    { name: 'Tema 2', src: '/music/track2.mp3' }
  ];

  useEffect(() => {
    // Escuchar cambios en localStorage
    const updateFromStorage = () => {
      const playing = localStorage.getItem('musicPlaying') === 'true';
      const track = parseInt(localStorage.getItem('musicTrack') || '0');
      const vol = parseFloat(localStorage.getItem('musicVolume') || '0.3');
      
      setIsPlaying(playing);
      setCurrentTrack(track);
      setVolume(vol);
    };

    updateFromStorage();
    
    // Actualizar cada segundo
    const interval = setInterval(updateFromStorage, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleMusic = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem('musicPlaying', newState.toString());
    
    // Disparar evento personalizado para que BackgroundMusic lo escuche
    window.dispatchEvent(new CustomEvent('musicToggle', { detail: { playing: newState } }));
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const nextTrack = () => {
    const newTrack = (currentTrack + 1) % tracks.length;
    setCurrentTrack(newTrack);
    localStorage.setItem('musicTrack', newTrack.toString());
    window.dispatchEvent(new CustomEvent('musicTrackChange', { detail: { track: newTrack } }));
  };

  const prevTrack = () => {
    const newTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    setCurrentTrack(newTrack);
    localStorage.setItem('musicTrack', newTrack.toString());
    window.dispatchEvent(new CustomEvent('musicTrackChange', { detail: { track: newTrack } }));
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    localStorage.setItem('musicVolume', newVolume.toString());
    window.dispatchEvent(new CustomEvent('musicVolumeChange', { detail: { volume: newVolume } }));
  };

  return (
    <div className="music-inline">
      <button 
        className="inline-btn music-btn" 
        onClick={toggleMusic}
        title={isPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>
      {isPlaying && (
        <button 
          className="inline-btn controls-btn" 
          onClick={toggleControls}
          title="Controles"
        >
          🎵
        </button>
      )}
      {showControls && isPlaying && (
        <div className="inline-music-controls">
          <button className="track-btn-inline" onClick={prevTrack}>⏮️</button>
          <span className="track-name-inline">{tracks[currentTrack].name}</span>
          <button className="track-btn-inline" onClick={nextTrack}>⏭️</button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider-inline"
            style={{ '--volume-percent': `${volume * 100}%` }}
            title={`Volumen: ${Math.round(volume * 100)}%`}
          />
        </div>
      )}
    </div>
  );
};

export default MusicControls;
