import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import NavbarContainer from './navigation/NavbarContainer'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<NavbarContainer />*/}
      <a href={"https://explorenyc-webpage-git-testing-party-csc490-dreamteam.vercel.app?_vercel_share=vnonJ6aRcCcrJnmQpvagjeWEpP9Zs3fX"}>
          Testing users: click here
      </a>
  </StrictMode>,
)
