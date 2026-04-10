import './NavbarContainer.css'
import HomeScreen from './screens/HomeScreen'
import NewTripScreen from './screens/NewTripScreen.jsx'
import SettingScreen from './screens/SettingsScreen.jsx'
import {useState} from "react";
import HistoryScreen from "./screens/HistoryScreen.jsx";
import AIScreen from "../components/AIScreen.jsx";

function NavbarContainer({ onLogout }) {
    const [currentScreen, setCurrentScreen] = useState('HomeState')

    const renderContent = () => {
        switch (currentScreen) {
            case 'HomeState': return <HomeScreen />
            case 'MapState': return <NewTripScreen />
            case 'HistoryState': return <HistoryScreen setCurrentScreen={setCurrentScreen} />
            case 'SettingsState': return <SettingScreen onLogout={onLogout} />
            case 'AIState': return <AIScreen />
            default: return <HomeScreen />
        }
    }

    return (
        <div className="navbarContainer">
            <div className="navbarContainer__top">
                <span className="navbarContainer__greeting">Welcome back, User!</span>
                <div className="navbarContainer__actions">
                    <button
                        className="navbarContainer__actionButton"
                        onClick={() => setCurrentScreen('AIState')}
                        aria-label="Open AI assistant"
                    >
                        <div className="icon aiIcon"/>
                    </button>
                    <button
                        className="navbarContainer__actionButton"
                        onClick={() => setCurrentScreen('SettingsState')}
                        aria-label="Open settings"
                    >
                        <div className="icon settingsIcon"/>
                    </button>
                </div>

            </div>

            <main className="navbarContainer__main">
                {renderContent()}
            </main>

            <nav className="navbarContainer__nav">
                <button onClick={()=>setCurrentScreen('HomeState')}>
                        <div className="icon homeIcon"/>
                        Home
                </button>
                <button onClick={()=>setCurrentScreen('MapState')}>
                    <div className="icon newIcon"/>
                    New Trip
                </button>
                <button onClick={()=>setCurrentScreen('HistoryState')}>
                    <div className="icon mapIcon"/>
                    My Trips
                </button>
            </nav>
        </div>
    )
}

export default NavbarContainer
