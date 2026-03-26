import React, { useState } from "react";
import './HistoryScreen.css';
import '../../App.css'
import MapScreen from "./MapScreen.jsx";

export default function History({ setCurrentScreen }) {
    const [isMapOpen, setIsMapOpen] = useState(false);

    const trips = [
        {id:1,title:'NYC Adventure',status:'Completed',startDate:'Feb 8, 2026',stops:5,time:'1 day'}
    ]

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

            {trips.map((trip) => (
                <div className="trip-box">
                    <div className="trip-box-image">
                        <img src='/new-york-city.jpeg' alt="New York City trip preview" />
                    </div>
                    <div className="trip-box-content">
                        <h3>{trip.title}</h3>
                        <p>{trip.status}</p>
                        <div className="trip-box-meta" aria-label="Trip details">
                            <span>🗓️ {trip.startDate}</span>
                            <span>📍 {trip.stops} stops</span>
                            <span>🕒 {trip.time}</span>
                        </div>
                    </div>
                    <button className="trip-action-btn trip-box-button" type="button">
                        View
                    </button>
                </div>
            ))}

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

            </div>



    );
}
