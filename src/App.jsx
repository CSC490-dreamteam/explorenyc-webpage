import React, { useState } from "react";
import './App.css'
import NavbarContainer from "./navigation/NavbarContainer.jsx";
import Auth from "./auth";

function App() {
  const [showNav, setShowNav] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (showNav) {
    return <NavbarContainer onLogout={() => setShowNav(false)} />;
  }

  function submitAuth(e) {
    e.preventDefault();

    if (authMode === 'login') {
      // set global current user id to 1 for testing
      Auth.setCurrentUserId(1);
      setShowAuthModal(false);
      setShowNav(true);
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
        <button className="generateButton" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
          Log in
        </button>
        <button className="generateButton" onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}>
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

              <div className="auth-action-row">
                <button type="button" onClick={() => setShowAuthModal(false)}>Cancel</button>
                <button type="submit">{authMode === 'login' ? 'Log in' : 'Sign up'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default App
