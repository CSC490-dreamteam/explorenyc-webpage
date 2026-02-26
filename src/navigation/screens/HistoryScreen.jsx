import React from "react";
import './HistoryScreen.css';
import '../../App.css'

export default function History({ setCurrentScreen }) {
    return (
        <div className="history-page">



            {/* HEADER */}
            <div className="history-header">
                <div>
                    <h2>Trip History</h2>
                    <p>Your past and upcoming trips</p>
                </div>
            </div>

            {/* START NEW TRIP SECTION */}
            <div className="start-trip-section">
                <button className="start-trip-card" onClick={() => setCurrentScreen('MapState')}>
                    <div className="newTripCircle" aria-hidden="true">
                        +
                    </div>
                    <div className="start-trip-copy">
                        <b>Start a New Trip</b>
                        <p>Plan your perfect NYC journey</p>
                    </div>
                    <span className="start-trip-arrow" aria-hidden="true">→</span>
                </button>
            </div>


            {/* ALL TRIPS */}
            <h2 className="section-title">All Trips</h2>


            <div className="trip-box">
                <h3>NYC Adventure</h3>
                <p>⭐ 5.0</p>
                <p>Completed</p>
                <p>🕒 1 day 📍 5 stops 💰 250</p>
                <button className="trip-action-btn" type="button">
                    View Trip
                </button>
            </div>



            <div className="trip-box">
                <h3>Weekend Getaway</h3>
                <p>⭐ 5.0</p>
                <p>Completed</p>
                <p>🕒 2 days 📍 10 stops 💰 500</p>
                <button className="trip-action-btn" type="button">
                    View Trip
                </button>
            </div>
        </div>



    );
}