import './NavbarContainer.css'
import HomeScreen from './screens/HomeScreen'
import NewTripScreen from './screens/NewTripScreen.jsx'
import SettingScreen from './screens/SettingsScreen.jsx'
import {useState} from "react";
import HistoryScreen from "./screens/HistoryScreen.jsx";
import MapScreen from "./screens/MapScreen.jsx";

function NavbarContainer({ onLogout }) {
    const [currentScreen, setCurrentScreen] = useState('HomeState')

    const renderContent = () => {
        switch (currentScreen) {
            case 'HomeState': return <HomeScreen setCurrentScreen={setCurrentScreen} />
            case 'MapState': return <NewTripScreen />
            case 'LearnMapState': return <MapScreen mode="learn" onClose={() => setCurrentScreen('HomeState')} />
            case 'HistoryState': return <HistoryScreen setCurrentScreen={setCurrentScreen} />
            case 'SettingsState': return <SettingScreen onLogout={onLogout} />
            default: return <HomeScreen setCurrentScreen={setCurrentScreen} />
        }
    }

    return (
        <div className="navbarContainer">
            <div className="navbarContainer__top">
                <span className="navbarContainer__greeting">ExploreNYC</span>
                <button className="navbarContainer__settingsButton" onClick={()=>setCurrentScreen('SettingsState')}>
                    <div className="icon settingsIcon"/>
                </button>

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
