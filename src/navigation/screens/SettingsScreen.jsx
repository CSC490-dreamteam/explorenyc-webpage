import '../../App.css'
import './SettingsScreen.css'

function App() {
    return (
        <div className="settingsRoot">
            <h2> Settings </h2>
            <div className="settingsCardsContainer">
                <div className="settingsCard profileCard">

                    <div style={{padding:'8px'}}>
                        <h2 className="profileCardName">Testing User</h2>
                        <label>testing@user.com</label>
                    </div>
                </div>

                <div className="settingsCard categoriesCard">
                    <label className="categoryHeader"><b>Account</b></label>
                    <div className="settingsOption">
                        Edit Profile
                    </div>
                    <div className="dividerLine"/>
                    <div className="settingsOption">
                        Change Password
                    </div>
                    <div className="dividerLine"/>
                    <div className="settingsOption">
                        Friends
                    </div>
                </div>

                <div className="settingsCard categoriesCard">
                    <label className="categoryHeader"><b>Preferences</b></label>
                    <div className="settingsOption">
                        Notifications
                    </div>
                    <div className="dividerLine"/>
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
