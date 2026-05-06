import React, { useState, useEffect } from "react";
import "./LeaderboardModal.css";
import walkingIcon from '../../../assets/walking.svg';

function LeaderboardModal({ isOpen, onClose }) {
    const [leaderboards, setLeaderboards] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("walking"); // "walking", "places", "trips"

    useEffect(() => {
        if (!isOpen) return;

        async function fetchLeaderboards() {
            setLoading(true);
            try {
                const response = await fetch("https://explorenyc-recommendation-service-production.up.railway.app/leaderboards");
                if (!response.ok) {
                    throw new Error("Failed to fetch leaderboards");
                }
                const data = await response.json();
                setLeaderboards(data);
            } catch (err) {
                console.error("Error fetching leaderboards:", err);
                setError("Could not load leaderboards.");
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboards();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.className === "modal-overlay") {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content leaderboard-modal">
                <div className="leaderboard-modal-header">
                    <h3>Leaderboards</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="leaderboard-modal-body">
                    {/* Tab Navigation */}
                    <div className="leaderboard-tabs">
                        <button 
                            className={`tab-btn ${activeTab === "walking" ? "active" : ""}`} 
                            onClick={() => setActiveTab("walking")}
                        >
                            <span className="walking-icon"></span> Walking
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === "places" ? "active" : ""}`} 
                            onClick={() => setActiveTab("places")}
                        >
                            <span className="places-icon"></span> Places
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === "trips" ? "active" : ""}`} 
                            onClick={() => setActiveTab("trips")}
                        >
                            <span className="trip-icon"></span> Trips
                        </button>
                    </div>

                    {/* Content View */}
                    {loading ? (
                        <div className="leaderboard-status">Loading data...</div>
                    ) : error ? (
                        <div className="leaderboard-status error">{error}</div>
                    ) : (
                        <div className="leaderboard-list">
                            {activeTab === "walking" && 
                                renderList(leaderboards?.topWalkingMinutes, "totalWalkingMinutes", "min")}
                            {activeTab === "places" && 
                                renderList(leaderboards?.topUniquePlaces, "uniqueStopsCount", "stops")}
                            {activeTab === "trips" && 
                                renderList(leaderboards?.topTripCount, "tripCount", "trips")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function renderList(dataArray, keyName, unitLabel) {
    return (
        <ul className="leaderboard-items">
            {dataArray?.map((user, idx) => (
                <li key={idx} className={`leaderboard-row ${idx === 0 ? "first-place" : ""}`}>
                    <span className="rank-number">{idx + 1}</span>
                    <span className="user-name">{user.name}</span>
                    <span className="user-score">
                        {user[keyName]} {unitLabel}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default LeaderboardModal;