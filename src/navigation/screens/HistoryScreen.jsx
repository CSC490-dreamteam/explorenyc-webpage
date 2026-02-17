import React from "react";
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


                <div className="trip-content">
                    <div className="trip-header">
                        <h3>NYC Adventure</h3>
                        <span className="rating">⭐ 5.0</span>
                    </div>
                    <span className="badge">Completed</span>

                    <div className="trip-details">
                        <span>🕒 1 day</span>
                        <span>📍 5 stops</span>
                        <span>💰 250</span>
                    </div>
                </div>

                <div className="trip-content">
                    <div className="trip-header">
                        <h3>Weekend Getaway</h3>
                        <span className="rating">⭐ 5.0</span>
                    </div>
                    <span className="badge">Completed</span>

                    <div className="trip-details">
                        <span>🕒 2 days</span>
                        <span>📍 10 stops</span>
                        <span>💰 500</span>
                    </div>
                </div>
            </div>



    );
}
