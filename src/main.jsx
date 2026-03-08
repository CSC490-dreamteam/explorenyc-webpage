import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NavbarContainer from './navigation/NavbarContainer'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NavbarContainer />
  </StrictMode>,
)
