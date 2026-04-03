import { useState } from "react";
import './App.css'
// import NavbarContainer from "./navigation/NavbarContainer.jsx";
import AIScreen from './components/AIScreen';

//This can be the login screen later. -ak

function App() {
  const [showNav, setShowNav] = useState(false);

  if (showNav) {
    // Comment out the Navbar and return AIScreen instead
    // return <NavbarContainer onLogout={() => setShowNav(false)} />;
    return <AIScreen />;
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

export default App;
