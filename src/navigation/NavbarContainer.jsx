import './NavbarContainer.css'
import HomeScreen from './screens/HomeScreen'
import MapScreen from './screens/MapScreen'
import SettingScreen from './screens/SettingsScreen'
import {useState} from "react";

function NavbarContainer() {
    const [currentScreen, setCurrentScreen] = useState('HomeState')

    const renderContent = () => {
        switch (currentScreen) {
            case 'HomeState': return <HomeScreen />
            case 'MapState': return <MapScreen />
            case 'SettingsState': return <SettingScreen />
            default: return <HomeScreen />
        }
    }

    return (
        <div className="navbarContainer">
            <div className="navbarContainer__top">
                Welcome back, User!
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
                <button className="navbarContainer__settingsbutton" onClick={()=>setCurrentScreen('SettingsState')}>
                    <div className="icon mapIcon"/>
                    History
                </button>
            </nav>
        </div>
    )
}

export default NavbarContainer