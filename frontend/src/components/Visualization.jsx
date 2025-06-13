import React, { useContext, useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './AppContext';
import './Visualization.css';
import backgroundImage from '../assets/background.jpg';
import sunIcon from '../assets/sun.png';
import moonIcon from '../assets/moon.png';

const translations = {
  en: {
    title: 'Data Visualization',
    tagline: 'Explore your data interactively.',
    home: '🏠 Home',
    prediction: '🧬 Prediction',
    selectX: 'X-Axis:',
    selectY: 'Y-Axis:',
    selectChartType: 'Chart Type:',
    scatterChart: 'Scatter Chart',
    lineChart: 'Line Chart',
    barChart: 'Bar Chart',
    histogram: 'Histogram',
    loading: 'Loading chart data...',
    noData: 'Select columns to generate chart',
    loadingColumns: 'Loading columns...',
    toggleTheme: 'Toggle theme',
  },
  fr: {
    title: 'Visualisation des données',
    tagline: 'Explorez vos données de manière interactive.',
    home: '🏠 Accueil',
    prediction: '🧬 Prédiction',
    selectX: 'Axe X :',
    selectY: 'Axe Y :',
    selectChartType: 'Type de graphique :',
    scatterChart: 'Nuage de points',
    lineChart: 'Graphique en ligne',
    barChart: 'Graphique à barres',
    histogram: 'Histogramme',
    loading: 'Chargement des données du graphique...',
    noData: 'Sélectionnez des colonnes pour générer le graphique',
    loadingColumns: 'Chargement des colonnes...',
    toggleTheme: 'Changer le thème',
  },
  ar: {
    title: 'تصور البيانات',
    tagline: 'استكشف بياناتك بشكل تفاعلي.',
    home: '🏠 الصفحة الرئيسية',
    prediction: '🧬 التنبؤ',
    selectX: 'المحور السيني:',
    selectY: 'المحور الصادي:',
    selectChartType: 'نوع الرسم البياني:',
    scatterChart: 'مخطط الانتثار',
    lineChart: 'مخطط خطي',
    barChart: 'مخطط شريطي',
    histogram: 'هيستوجرام',
    loading: 'جار تحميل بيانات الرسم البياني...',
    noData: 'اختر أعمدة لإنشاء الرسم البياني',
    loadingColumns: 'جار تحميل الأعمدة...',
    toggleTheme: 'تبديل الوضع',
  },
};

function Visualization() {
  const navigate = useNavigate();
  const { theme, language } = useContext(AppContext);

  const t = translations[language] || translations.en;

  const [columns, setColumns] = useState([]);
  const [selectedX, setSelectedX] = useState('');
  const [selectedY, setSelectedY] = useState('');
  const [chartType, setChartType] = useState('ScatterChart');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
  }, [theme]);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await axios.get('http://localhost:8000/data/columns');
        if (response.data.columns && response.data.columns.length >= 2) {
          setColumns(response.data.columns);
          setSelectedX(response.data.columns[0]);
          setSelectedY(response.data.columns[1]);
          setError('');
        } else {
          setError(t.noData);
        }
      } catch (err) {
        setError(t.loadingColumns);
        console.error(err);
      }
    };
    fetchColumns();
  }, [t.noData, t.loadingColumns]);

  const generateChart = async () => {
    if (!selectedX || !selectedY) {
      setError(t.noData);
      setData([]);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/data/sample', {
        params: { x: selectedX, y: selectedY, limit: 100 },
      });
      if (!response.data || response.data.length === 0) {
        setError(t.noData);
        setData([]);
        setIsLoading(false);
        return;
      }
      const chartData = [
        [selectedX, selectedY],
        ...response.data.map(item => [item[selectedX], item[selectedY]]),
      ];
      setData(chartData);
      setError('');
    } catch (err) {
      setError(t.noData);
      setData([]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedX && selectedY) {
      generateChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedX, selectedY]);

  return (
    <div
      className="landing-wrapper"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {theme === 'dark' && <div className="dark-overlay" />}
      <div className="glass-card">
        <div className="header">
          <h1>{t.title}</h1>
          {/* You can optionally keep or remove theme toggle here */}
          {/* If you want toggle inside Settings, can remove this */}
        </div>
        <p className="tagline">{t.tagline}</p>

        <div
          className="button-container"
          style={{ justifyContent: 'center', marginBottom: '1rem' }}
        >
          <button onClick={() => navigate('/landing')}>{t.home}</button>
          <button onClick={() => navigate('/prediction')}>{t.prediction}</button>
        </div>

        <div
          className="controls"
          style={{
            marginBottom: '1rem',
            color: theme === 'dark' ? '#f0f0f0' : '#1a1a1a',
          }}
        >
          <label htmlFor="xAxisSelect">{t.selectX}</label>
          <select
            id="xAxisSelect"
            value={selectedX}
            onChange={e => setSelectedX(e.target.value)}
            disabled={isLoading}
            style={{
              marginLeft: 8,
              padding: '0.4rem',
              borderRadius: 8,
              border: 'none',
            }}
          >
            <option value="">{t.selectX}</option>
            {columns.map(col => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <label htmlFor="yAxisSelect" style={{ marginLeft: 16 }}>
            {t.selectY}
          </label>
          <select
            id="yAxisSelect"
            value={selectedY}
            onChange={e => setSelectedY(e.target.value)}
            disabled={isLoading}
            style={{
              marginLeft: 8,
              padding: '0.4rem',
              borderRadius: 8,
              border: 'none',
            }}
          >
            <option value="">{t.selectY}</option>
            {columns.map(col => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <label htmlFor="chartTypeSelect" style={{ marginLeft: 16 }}>
            {t.selectChartType}
          </label>
          <select
            id="chartTypeSelect"
            value={chartType}
            onChange={e => setChartType(e.target.value)}
            disabled={isLoading}
            style={{
              marginLeft: 8,
              padding: '0.4rem',
              borderRadius: 8,
              border: 'none',
            }}
          >
            <option value="ScatterChart">{t.scatterChart}</option>
            <option value="LineChart">{t.lineChart}</option>
            <option value="BarChart">{t.barChart}</option>
            <option value="Histogram">{t.histogram}</option>
          </select>
        </div>

        {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}

        <div
          className="chart-container"
          style={{ color: theme === 'dark' ? '#f0f0f0' : '#1a1a1a' }}
        >
          {isLoading ? (
            <div className="loading">{t.loading}</div>
          ) : data && Array.isArray(data) && data.length > 1 ? (
            <Chart
              chartType={chartType}
              width="100%"
              height="400px"
              data={data}
              options={{
                title: `${selectedY} vs ${selectedX}`,
                hAxis: {
                  title: selectedX,
                  textStyle: { color: theme === 'dark' ? '#f0f0f0' : '#1a1a1a' },
                },
                vAxis: {
                  title: selectedY,
                  textStyle: { color: theme === 'dark' ? '#f0f0f0' : '#1a1a1a' },
                },
                legend: { position: 'none' },
                chartArea: { width: '80%', height: '70%' },
                backgroundColor: 'transparent',
                titleTextStyle: { color: theme === 'dark' ? '#f0f0f0' : '#1a1a1a' },
                tooltip: { textStyle: { color: theme === 'dark' ? '#f0f0f0' : '#1a1a1a' } },
              }}
            />
          ) : (
            <div className="no-data">
              {columns.length > 0 ? t.noData : t.loadingColumns}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Visualization;
