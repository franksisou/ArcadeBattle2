import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import BackgroundSelector from './BackgroundSelector';
import MusicControls from './MusicControls';
import './RightActionBar.css';

const RightActionBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`right-action-bar ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="rab-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '✕' : '⚙️'}
      </button>
      
      {isExpanded && (
        <div className="rab-actions">
          <ThemeToggle inline={true} />
          <BackgroundSelector inline={true} />
          <MusicControls />
        </div>
      )}
    </div>
  );
};

export default RightActionBar;
