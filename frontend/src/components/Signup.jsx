import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!email || !password || !confirmPassword) {
      setMsg('Merci de remplir tous les champs obligatoires');
      return;
    }
    if (password !== confirmPassword) {
      setMsg('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('full_name', fullName);
      formData.append('date_of_birth', dateOfBirth);
      formData.append('gender', gender);
      formData.append('country', country);
      formData.append('activity_level', activityLevel);
      formData.append('prefers_dark_mode', prefersDarkMode.toString());
      formData.append('newsletter_opt_in', newsletterOptIn.toString());

      const res = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (res.ok) {
        alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        navigate('/login');
      } else {
        const error = await res.json();
        setMsg(error.detail || 'Échec de l’inscription');
      }
    } catch (err) {
      setMsg('Impossible de joindre le serveur');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="dark-overlay"></div>
      <div className="auth-card">
        <h2>Créer un compte</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe *"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Nom complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="date"
            placeholder="Date de naissance"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Genre</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
            <option value="other">Autre</option>
          </select>
          <input
            type="text"
            placeholder="Pays"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
            <option value="">Niveau d'activité</option>
            <option value="low">Faible</option>
            <option value="medium">Moyen</option>
            <option value="high">Élevé</option>
          </select>
          <label style={{ marginTop: '0.5rem', display: 'block' }}>
            <input
              type="checkbox"
              checked={prefersDarkMode}
              onChange={(e) => setPrefersDarkMode(e.target.checked)}
            />{' '}
            Préfère le mode sombre
          </label>
          <label style={{ marginTop: '0.5rem', display: 'block' }}>
            <input
              type="checkbox"
              checked={newsletterOptIn}
              onChange={(e) => setNewsletterOptIn(e.target.checked)}
            />{' '}
            S’inscrire à la newsletter
          </label>
          <button className="auth-button" type="submit" style={{ marginTop: '1rem' }}>
            S’inscrire
          </button>
        </form>
        {msg && <p style={{ color: 'red', marginTop: '1rem' }}>{msg}</p>}
        <div className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
