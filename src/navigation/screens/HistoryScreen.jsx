import React, { useState } from "react";
import './HistoryScreen.css';
import '../../App.css'
import MapScreen from "./MapScreen.jsx";

export default function History({ setCurrentScreen }) {
    const [isMapOpen, setIsMapOpen] = useState(false);

    return (
        <div className="history-page">



            {/* HEADER */}
            <div className="history-header">
                <div>
                    <h2>My Trips</h2>
                    <p>Your past and upcoming trips</p>
                </div>
            </div>

            {/* START NEW TRIP SECTION */}
            <div className="start-trip-section">
                <button className="start-trip-card" onClick={() => setCurrentScreen('MapState')}>
                    <div className="newTripCircle">
                        +
                    </div>
                    <div className="start-trip-copy">
                        <b>Start a New Trip</b>
                        <p>Plan your perfect NYC journey</p>
                    </div>
                    <span className="start-trip-arrow" aria-hidden="true">→</span>
                </button>
            </div>

            <div className="trip-box">
                <div style={{width:'20%', paddingRight:'1%'}}>
                    <img src='/new-york-city.jpeg' />
                </div>
                <div className="trip-box-content" style={{width:'65%'}}>
                    <h3>NYC Adventure</h3>
                    <p>Completed</p>
                    <br/>
                    <label>🗓️ Feb 8, 2026 </label> <label>📍 5 stops </label> <label> 🕒 1 day </label>
                </div>
                <button className="trip-action-btn" type="button" style={{marginRight:'1%'}}>
                    View
                </button>
            </div>

            <button
                className="trip-action-btn"
                type="button"
                onClick={() => setIsMapOpen(true)}
                style={{ marginTop: '16px' }}
            >
                Open Map
            </button>

            {isMapOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '90vw',
                            height: '80vh',
                            maxWidth: '1100px',
                            background: '#111',
                        }}
                    >
                        <button
                            className="trip-action-btn"
                            type="button"
                            onClick={() => setIsMapOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                zIndex: 2,
                            }}
                            aria-label="Close map"
                        >
                            X
                        </button>
                        <MapScreen embedded />
                    </div>
                </div>
            )}

            {/* Let's make this a reusable component so we can map them later.
            <div className="trip-box">
                <h3>Weekend Getaway</h3>
                <p>⭐ 5.0</p>
                <p>Completed</p>
                <p>🕒 2 days 📍 10 stops 💰 500</p>
                <button className="trip-action-btn" type="button">
                    View Trip
                </button>
            </div>*/}
            </div>



    );
}
