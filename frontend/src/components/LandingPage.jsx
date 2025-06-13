import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './AppContext';
import './LandingPage.css';
import backgroundImage from '../assets/background.jpg';
import settingsIcon from '../assets/reglage.png';

const translations = {
  en: {
    title: "Diabetes Prediction System",
    tagline: "Empower your health with intelligent insights.",
    visualization: "📊 Visualization",
    prediction: "🧬 Prediction",
    settings: "Settings",
    logout: "Logout",
  },
  fr: {
    title: "Système de prédiction du diabète",
    tagline: "Donnez du pouvoir à votre santé avec des insights intelligents.",
    visualization: "📊 Visualisation",
    prediction: "🧬 Prédiction",
    settings: "Paramètres",
    logout: "Déconnexion",
  },
  ar: {
    title: "نظام التنبؤ بالسكري",
    tagline: "تمكين صحتك من خلال رؤى ذكية.",
    visualization: "📊 التصور",
    prediction: "🧬 التنبؤ",
    settings: "الإعدادات",
    logout: "تسجيل خروج",
  },
};

function LandingPage() {
  const navigate = useNavigate();
  const { theme, language, logout } = useContext(AppContext);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
  }, [theme]);

  const t = translations[language] || translations.en;

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="landing-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {theme === 'dark' && <div className="dark-overlay" />}

      {/* Settings icon redirects to the settings page */}
      <button
        className="settings-btn"
        onClick={() => navigate('/settings')}
        aria-label={t.settings}
      >
        <img src={settingsIcon} alt={t.settings} />
      </button>

      <div className="glass-card">
        <div className="header" style={{ marginBottom: '1rem' }}>
          <h1>{t.title}</h1>
        </div>

        <p className="tagline">{t.tagline}</p>

        <div className="button-container">
          <button onClick={() => handleNavigate('/visualization')}>
            {t.visualization}
          </button>
          <button onClick={() => handleNavigate('/prediction')}>
            {t.prediction}
          </button>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          {t.logout}
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
