import React, { useState } from "react";
import './App.css'
import NavbarContainer from "./navigation/NavbarContainer.jsx";
import Auth from "./auth";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

function App() {
  const GOOGLE_LOGIN_URL = 'https://explorenyc-recommendation-service-production.up.railway.app/google-login';
  const authButtonWidth = 360;
  const googleButtonScale = 2;
  const [showNav, setShowNav] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (showNav) {
    return <NavbarContainer onLogout={() => setShowNav(false)} />;
  }

  return (
    <>
      <img src={"/logotemp.png"} width={"100%"}/>
      <h2>Your adventure in New York City starts here.</h2>

      <div className="auth-buttons-vertical">
        <div className="google-login-row">
          <GoogleLogin
            width={authButtonWidth / googleButtonScale}
            size="large"
            shape="pill"
            text="continue_with"
            logo_alignment="center"
            containerProps={{ className: 'google-login-frame' }}
            onSuccess={async (credentialResponse) => {
              setAuthError('');
              setIsSubmitting(true);
              try {
                const decoded = jwtDecode(credentialResponse.credential);
                const payload = {
                  id_token: credentialResponse.credential,
                  name: decoded.name,
                  email: decoded.email
                };

                const response = await fetch(GOOGLE_LOGIN_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(payload),
                });

                if (!response.ok) {
                  throw new Error('Google Login Failed');
                }

                const data = await response.json();
                const userId = data?.user_id;

                if (userId === undefined || userId === null) {
                  throw new Error('Missing user id');
                }

                Auth.setCurrentUserId(userId);
                setShowNav(true);
              } catch (err) {
                setAuthError(err instanceof Error && err.message ? err.message : 'Google login failed.');
              } finally {
                setIsSubmitting(false);
              }
            }}
            onError={() => {
              setAuthError('Google login failed.');
            }}
          />
        </div>
        {isSubmitting && <p className="auth-status">Signing in with Google...</p>}
        {authError && <p className="auth-error" role="alert">{authError}</p>}
        <button
          className="generateButton auth-test-button"
          onClick={() => { Auth.setCurrentUserId(1); setShowNav(true); }}
        >
          Login as test user
        </button>
      </div>
    </>
  )
}

export default App
