import React, { useEffect } from 'react';
import './AchievementNotification.css';

function AchievementNotification({ achievement, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#9e9e9e';
      case 'rare':
        return '#2196f3';
      case 'epic':
        return '#9c27b0';
      case 'legendary':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  return (
    <div 
      className="achievement-notification"
      style={{ borderColor: getRarityColor(achievement.rarity) }}
    >
      <div className="notification-header">
        <span className="notification-title">🎉 ¡Logro Desbloqueado!</span>
        <button className="notification-close" onClick={onClose}>×</button>
      </div>
      <div className="notification-content">
        <div className="notification-icon">{achievement.icon}</div>
        <div className="notification-info">
          <div 
            className="notification-name"
            style={{ color: getRarityColor(achievement.rarity) }}
          >
            {achievement.name}
          </div>
          <div className="notification-description">
            {achievement.description}
          </div>
          <div className="notification-meta">
            <span 
              className="notification-rarity"
              style={{ color: getRarityColor(achievement.rarity) }}
            >
              {achievement.rarity.toUpperCase()}
            </span>
            <span className="notification-points">
              +{achievement.points} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchievementNotification;
