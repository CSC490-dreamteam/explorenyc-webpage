import React, { useState } from "react";
import './App.css'
import NavbarContainer from "./navigation/NavbarContainer.jsx";
import Auth from "./auth";

function App() {
  const LOGIN_URL = 'https://explorenyc-recommendation-testing.up.railway.app/login';
  const [showNav, setShowNav] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (showNav) {
    return <NavbarContainer onLogout={() => setShowNav(false)} />;
  }

  function openAuthModal(mode) {
    setAuthMode(mode);
    setAuthError('');
    setIsSubmitting(false);
    setShowAuthModal(true);
  }

  async function submitAuth(e) {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      setIsSubmitting(true);

      try {
        const response = await fetch(LOGIN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        const data = await response.json();
        const userId = data?.user_id;

        if (userId === undefined || userId === null) {
          throw new Error('Missing user id');
        }

        Auth.setCurrentUserId(userId);
        setShowAuthModal(false);
        setShowNav(true);
      } catch {
        setAuthError('Incorrect email or password.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign up - nothing yet other than closing the modal
      setShowAuthModal(false);
    }
  }

  return (
    <>
      <h2>Welcome to ExploreNYC!</h2>
      <h3>Your adventure in New York City starts here.</h3>

      <div className="auth-buttons-vertical">
        <button className="generateButton" onClick={() => openAuthModal('login')}>
          Log in
        </button>
        <button className="generateButton" onClick={() => openAuthModal('signup')}>
          Sign up
        </button>
        <button className="generateButton" onClick={() => { Auth.setCurrentUserId(1); setShowNav(true); }}>
          Login as test user
        </button>
      </div>

      {showAuthModal && (
        <div className="auth-overlay">
          <div className="auth-modal" role="dialog" aria-modal="true">
            <h3>{authMode === 'login' ? 'Log in' : 'Sign up'}</h3>
            <form className="auth-form" onSubmit={submitAuth}>
              <div className="fieldGroup">
                <label htmlFor="auth-email">Email</label>
                <input id="auth-email" name="email" type="email" className="bigField" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="fieldGroup">
                <label htmlFor="auth-password">Password</label>
                <input id="auth-password" name="password" type="password" className="bigField" autoComplete={authMode === 'login' ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {authMode === 'signup' && (
                <div className="fieldGroup">
                  <label htmlFor="auth-confirm">Confirm Password</label>
                  <input id="auth-confirm" name="confirmPassword" type="password" className="bigField" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              )}

              {authError && <p role="alert">{authError}</p>}

              <div className="auth-action-row">
                <button type="button" onClick={() => { setShowAuthModal(false); setAuthError(''); }} disabled={isSubmitting}>Cancel</button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting && authMode === 'login' ? 'Logging in...' : authMode === 'login' ? 'Log in' : 'Sign up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default App
