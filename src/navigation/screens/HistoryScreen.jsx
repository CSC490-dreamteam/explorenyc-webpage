import React from "react";
import './HistoryScreen.css';
import '../../App.css'

export default function History() {
    return (
        <div className="history-page">
            <div className="settings-icon">⚙️</div>


            {/* HEADER */}
            <div className="history-header">
                <div>
                    <h1>Trip History</h1>
                    <h3>Your past and upcoming trips</h3>
                </div>
            </div>

            {/* START NEW TRIP SECTION */}
            <div className="start-trip-section">

                <p>Start a New Trip. Plan your perfect NYC journey.   +</p>
            </div>


            {/* ALL TRIPS */}
            <h2 className="section-title">All Trips</h2>

            {/* TRIP INFO TEXTBOXES */}
            <div className="trip-info-container">
                <input type="text" placeholder="Trip Info" />
                <input type="text" placeholder="Trip Info" />
                <input type="text" placeholder="Trip Info" />
            </div>


            <div className="trip-box">
                <h3>NYC Adventure</h3>
                <p>⭐ 5.0</p>
                <p>Completed</p>
                <p>🕒 1 day 📍 5 stops 💰 250</p>
            </div>



            <div className="trip-box">
                <h3>Weekend Getaway</h3>
                <p>⭐ 5.0</p>
                <p>Completed</p>
                <p>🕒 2 days 📍 10 stops 💰 500</p>
            </div>
            </div>



    );
}
