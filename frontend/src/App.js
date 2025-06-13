import React, { useContext } from 'react';
import PropTypes from 'prop-types'; // <-- Added
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Visualization from './components/Visualization';
import Prediction from './components/Prediction';
import Login from './components/Login';
import Signup from './components/Signup';
import SettingsPanel from './components/SettingsPanel';
import { AppProvider, AppContext } from './components/AppContext';
import './App.css';

function AppRoutes() {
  const { token, login, logout, user } = useContext(AppContext);

  const PrivateRoute = ({ children }) => (token ? children : <Navigate to="/login" />);
  PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

  const PublicRoute = ({ children }) => (!token ? children : <Navigate to="/landing" />);
  PublicRoute.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/landing" /> : <Navigate to="/login" />} />

      {/* Public pages */}
      <Route path="/login" element={<PublicRoute><Login onLogin={login} /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Private pages */}
      <Route path="/landing" element={<PrivateRoute><LandingPage onLogout={logout} /></PrivateRoute>} />
      <Route path="/visualization" element={<PrivateRoute><Visualization /></PrivateRoute>} />
      <Route path="/prediction" element={<PrivateRoute><Prediction token={token} user={user} /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPanel /></PrivateRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <AppRoutes />
        </div>
      </Router>
    </AppProvider>
  );
}
