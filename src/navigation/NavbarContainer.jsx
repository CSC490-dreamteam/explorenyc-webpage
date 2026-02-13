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
            <main className="navbarContainer__main">
                {renderContent()}
            </main>

            <nav className="navbarContainer__nav">
                <button className="navbarContainer__homebutton"
                        onClick={()=>setCurrentScreen('HomeState')}>Home</button>
                <button className="navbarContainer__mapbutton"
                        onClick={()=>setCurrentScreen('MapState')}>Map</button>
                <button className="navbarContainer__settingsbutton"
                        onClick={()=>setCurrentScreen('SettingsState')}>Settings</button>
            </nav>
        </div>
    )
}

export default NavbarContainer