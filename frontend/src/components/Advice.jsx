import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Advice.css'; // We'll create this next
import backgroundImage from '../assets/background.jpg';
import sunIcon from '../assets/sun.png';
import moonIcon from '../assets/moon.png';

const adviceData = [
  {
    category: 'Diet',
    tips: [
      'Choose whole grains over refined carbohydrates',
      'Eat plenty of non-starchy vegetables',
      'Limit sugary drinks and fruit juices',
      'Include healthy fats like nuts and avocados',
      'Control portion sizes to manage blood sugar'
    ]
  },
  {
    category: 'Exercise',
    tips: [
      'Aim for at least 150 minutes of moderate exercise per week',
      'Include both aerobic and resistance training',
      'Take short walks after meals to lower blood sugar',
      'Stay active throughout the day, not just during workouts',
      'Monitor blood sugar before and after exercise'
    ]
  },
  {
    category: 'Monitoring',
    tips: [
      'Check blood sugar levels as recommended by your doctor',
      'Keep a log of your readings to identify patterns',
      'Know your target blood sugar ranges',
      'Watch for symptoms of high or low blood sugar',
      'Get regular A1C tests (at least twice a year)'
    ]
  },
  {
    category: 'Medication',
    tips: [
      'Take medications as prescribed by your doctor',
      'Never skip doses without consulting your doctor',
      'Learn how your medications work and their side effects',
      'Keep medications organized with a pill box if needed',
      'Inform all healthcare providers about all medications you take'
    ]
  }
];

function Advice() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Diet');

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const selectedCategory = adviceData.find(item => item.category === activeCategory);

  return (
    <div
      className="landing-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {darkMode && <div className="dark-overlay" />}
      <div className="glass-card">
        <div className="header">
          <h1>Diabetes Management Advice</h1>
          <button
            className="toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            <img
              src={darkMode ? sunIcon : moonIcon}
              alt="Toggle theme"
              className="theme-icon"
            />
          </button>
        </div>
        <p className="tagline">Practical tips for managing your diabetes</p>

        <div className="button-container">
          <button onClick={() => navigate('/')}>🏠 Home</button>
          <button onClick={() => navigate('/prediction')}>🧬 Prediction</button>
          <button onClick={() => navigate('/visualization')}>📊 Visualization</button>
        </div>

        <div className="advice-categories">
          {adviceData.map((category) => (
            <button
              key={category.category}
              className={`category-btn ${activeCategory === category.category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.category)}
            >
              {category.category}
            </button>
          ))}
        </div>

        <div className="advice-content">
          <h3>{selectedCategory.category} Tips</h3>
          <ul>
            {selectedCategory.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Advice;