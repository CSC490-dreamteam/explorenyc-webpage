import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
import AIScreen from './components/AIScreen';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AIScreen />
  </StrictMode>,
)
