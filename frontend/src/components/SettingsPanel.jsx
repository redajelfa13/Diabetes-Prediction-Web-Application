import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './AppContext';
import './SettingsPanel.css';
import backgroundImage from '../assets/background.jpg';
import userIcon from '../assets/person.png';
import exitIcon from '../assets/exit.png';

export default function SettingsPanel() {
  const { user, theme, language, setLanguage, setTheme } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const goBack = () => {
    navigate('/landing');
  };

  return (
    <div
      className={`settings-page ${theme}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="settings-card">
        {/* Back button top-left */}
        <button className="back-button" onClick={goBack} aria-label="Go back to landing page">
          <img src={exitIcon} alt="Back" />
        </button>

        <div className="user-info-block">
          <img src={userIcon} alt="User Icon" className="user-icon" />
          <h1 className="user-name">{user?.full_name || 'User'}</h1>
          <p className="user-email"><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p className="user-id"><strong>ID:</strong> {user?.id || 'N/A'}</p>
        </div>

        <div className="settings-controls">
          <div className="setting-group">
            <label>Theme</label>
            <button onClick={toggleTheme} className="theme-toggle-btn">
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>

          <div className="setting-group">
            <label>Language</label>
            <select value={language} onChange={handleLanguageChange} className="language-select">
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
