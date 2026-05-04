import { useEffect, useState } from 'react'
import '../../App.css'
import './SettingsScreen.css'

function SettingsScreen({ onLogout }) {
    const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'system')

    useEffect(() => {
        const root = document.documentElement
        if (theme === 'system') {
            root.removeAttribute('data-theme')
        } else {
            root.setAttribute('data-theme', theme)
        }
    }, [theme])

    return (
        <div className="settingsRoot">
            <h2> Settings </h2>
            <div className="settingsCardsContainer">
                {/*<div className="settingsCard profileCard">
                    <div className="icon userpicIcon"/>
                    <div>
                        <h2 className="profileCardName">John Doe</h2>
                        <label>john.doe@email.com</label>
                    </div>
                </div>

                <div className="settingsCard categoriesCard">
                    <label className="categoryHeader"><b>Account</b></label>
                    <div className="settingsOption">
                        <div className="icon userpicIcon"/>
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
                </div>*/}

                <div className="settingsCard categoriesCard">
                    <label className="categoryHeader"><b>Preferences</b></label>
                    <div className="dividerLine"/>
                    <div className="settingsOption settingsOption--spread">
                        <span>Appearance</span>
                        <div className="themeToggle" role="group" aria-label="Appearance">
                            <button
                                type="button"
                                className={`themeToggle__btn ${theme === 'light' ? 'is-active' : ''}`}
                                onClick={() => setTheme('light')}
                            >
                                Light
                            </button>
                            <button
                                type="button"
                                className={`themeToggle__btn ${theme === 'dark' ? 'is-active' : ''}`}
                                onClick={() => setTheme('dark')}
                            >
                                Dark
                            </button>
                            <button
                                type="button"
                                className={`themeToggle__btn ${theme === 'system' ? 'is-active' : ''}`}
                                onClick={() => setTheme('system')}
                            >
                                System
                            </button>
                        </div>
                    </div>
                </div>

                <div className="settingsCard categoriesCard">
                    <label className="categoryHeader"><b>Support</b></label>
                    <div className="dividerLine"/>
                    <div className="settingsOption">
                        <a href="https://github.com/CSC490-dreamteam" target="_blank" rel="noopener noreferrer">We're open source!</a><br/>
                        <p>To submit a bug report, feel free to make a new Issue on GitHub.</p>
                    </div>
                    

                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="button" className="generateButton" style={{marginTop: 20, width: "80%"}} onClick={onLogout}>
                    Log Out
                </button>
                </div>
            </div>
        </div>
    )
}


export default SettingsScreen
