import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (res.ok) {
        const data = await res.json();
        // Expecting backend response: { token: "...", user: {...} }
        if (data.token && data.user) {
          onLogin(data.token, data.user);
          navigate('/landing');
        } else {
          setMsg('Invalid server response: missing token or user data.');
        }
      } else {
        const error = await res.json();
        setMsg(error.detail || 'Login failed');
      }
    } catch (err) {
      setMsg('Unable to reach server');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="dark-overlay"></div>
      <div className="auth-card">
        <h2>Se connecter</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="auth-button" type="submit">Connexion</button>
        </form>
        {msg && (
          <div style={{ color: 'red', marginTop: '1rem' }}>
            {Array.isArray(msg)
              ? msg.map((m, i) => <p key={i}>{m.msg || JSON.stringify(m)}</p>)
              : <p>{msg}</p>}
          </div>
        )}
        <div className="auth-footer">
          Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
        </div>
      </div>
    </div>
  );
}
