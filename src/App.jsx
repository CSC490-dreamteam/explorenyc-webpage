import { useState } from "react";
import './App.css'
import NavbarContainer from "./navigation/NavbarContainer.jsx";

//This can be the login screen later. -ak

function App() {
  const [showNav, setShowNav] = useState(false);

  if (showNav) {
    return <NavbarContainer onLogout={() => setShowNav(false)} />;
  }

  return (
    <>
      <h2>Welcome to ExploreNYC!</h2>
        <h3>Your adventure in New York City starts here.</h3>
        <button className="generateButton" onClick={() => setShowNav(true)}>
          Login as test user
        </button>
    </>
  )
}


export default App
