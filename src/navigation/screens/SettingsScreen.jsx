import '../../App.css'
import './SettingsScreen.css'

function App() {
    return (
        <div className="settingsRoot">
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
                    <div className="dividerLine"><br/></div>
                    <div className="settingsOption">
                        Change Password
                    </div>
                    <div className="dividerLine"><br/></div>
                    <div className="settingsOption">
                        Friends
                    </div>
                </div>

                <div className="settingsCard categoriesCard">
                    <label className="categoryHeader"><b>Preferences</b></label>
                    <div className="settingsOption">
                        Notifications
                    </div>
                    <div className="dividerLine"><br/></div>
                    <div className="settingsOption">
                        Dark Mode
                    </div>
                </div>

                <div className="settingsCard categoriesCard">
                    <label className="categoryHeader"><b>Support</b></label>
                    <div className="settingsOption">
                        Help & FAQ
                    </div>
                </div>
            </div>
        </div>
    )
}


export default App
