import './NavbarContainer.css'
import HomeScreen from './screens/HomeScreen'
import NewTripScreen from './screens/NewTripScreen.jsx'
import SettingScreen from './screens/SettingsScreen.jsx'
import {useState} from "react";
import HistoryScreen from "./screens/HistoryScreen.jsx";

function NavbarContainer() {
    const [currentScreen, setCurrentScreen] = useState('HomeState')

    const renderContent = () => {
        switch (currentScreen) {
            case 'HomeState': return <HomeScreen />
            case 'MapState': return <NewTripScreen />
            case 'HistoryState': return <HistoryScreen />
            case 'SettingsState': return <SettingScreen />
            default: return <HomeScreen />
        }
    }

    return (
        <div className="navbarContainer">
            <div className="navbarContainer__top">
                <span className="navbarContainer__greeting">Welcome back, User!</span>
                <button className="navbarContainer__settingsButton" onClick={()=>setCurrentScreen('SettingsState')}>
                    <div className="icon settingsIcon"/>
                </button>

            </div>

            <main className="navbarContainer__main">
                {renderContent()}
            </main>

            <nav className="navbarContainer__nav">
                <button className="navbarContainer__homebutton" onClick={()=>setCurrentScreen('HomeState')}>
                        <div className="icon homeIcon"/>
                        Home
                </button>
                <button className="navbarContainer__mapbutton" onClick={()=>setCurrentScreen('MapState')}>
                    <div className="icon newIcon"/>
                    New Trip
                </button>
                <button className="navbarContainer__settingsbutton" onClick={()=>setCurrentScreen('HistoryState')}>
                    <div className="icon mapIcon"/>
                    History
                </button>
            </nav>
        </div>
    )
}

export default NavbarContainer
