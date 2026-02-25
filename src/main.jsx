import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import NavbarContainer from './navigation/NavbarContainer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NavbarContainer />
  </StrictMode>,
)
