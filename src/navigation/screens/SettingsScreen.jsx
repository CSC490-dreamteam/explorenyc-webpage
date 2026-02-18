import '../../App.css'
import './SettingsScreen.css'

function App() {
    return (
        <>
            <h2> Settings </h2>
            <div className="settingsCardsContainer">
                <div className="settingsCard profileCard">
                    <div className="icon userpicIcon"/>
                    <div>
                        <h2 className="profileCardName">John Doe</h2>
                        <label>john.doe@email.com</label>
                    </div>
                </div>

                <div className="settingsCard categoriesCard">
                    <label className="categoryHeader"><b>Account</b></label>
                    <div className="settingsOption">
                        <br/>
                        <div className="icon userpicIcon"/>
                        Account info
                    </div>
                </div>
            </div>
        </>
    )
}


export default App
