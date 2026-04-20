import React, { useEffect, useState } from "react";
import './HistoryScreen.css';
import '../../App.css'
import TripDetail from "./components/TripDetail.jsx";
import Auth from '../../auth';

async function fetchTripStopsForUser(userId) {
    const id = userId ?? Auth.currentUserId ?? 1;
    const res = await fetch(
        `https://explorenyc-recommendation-service-production.up.railway.app/trip-stops?user_id=${encodeURIComponent(id)}`
    );
    return res.json();
}

export default function History({ setCurrentScreen }) {
    const [userTrips, setUserTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const trips = Array.isArray(userTrips?.trips) ? userTrips.trips : [];

    async function refreshTrips() {
        try {
            const json = await fetchTripStopsForUser();
            setUserTrips(json);
            console.log("trip-stops response:", json);
        } catch (err) {
            console.error("Error fetching /trip-stops:", err);
        }
    }

    function formatTripDate(dateString) {
        if (!dateString) return "No date";

        const parsedDate = new Date(dateString);
        if (Number.isNaN(parsedDate.getTime())) return dateString;

        return parsedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    function formatTripTags(tags) {
        if (Array.isArray(tags)) return tags.join(", ");
        if (tags && typeof tags === "object") return Object.values(tags).join(", ");
        if (typeof tags === "string") return tags;
        return "No tags";
    }

    useEffect(() => {
        let isActive = true;

        async function loadTrips() {
            try {
                const json = await fetchTripStopsForUser();
                if (!isActive) {
                    return;
                }

                setUserTrips(json);
                console.log("trip-stops response:", json);
            } catch (err) {
                if (!isActive) {
                    return;
                }

                console.error("Error fetching /trip-stops:", err);
            }
        }

        loadTrips();

        return () => {
            isActive = false;
        };
    }, []);



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

            {/* Past trips*/}
            {trips.map((trip) => (
                <div className="trip-box" key={trip.trip_id}>
                    <div className="trip-box-image">
                        <img src='/new-york-city.jpeg' alt="New York City trip preview" />
                    </div>
                    <div className="trip-box-content">
                        <h3>{trip.name}</h3>
                        <p>{trip.status}</p>
                        <div className="trip-box-meta" aria-label="Trip details">
                            <span>🗓️ {formatTripDate(trip.entry_datetime)}</span>
                            <span>📍 {trip.stops?.length ?? 0} stops</span>
                            <span>🏷️ {formatTripTags(trip.tags)}</span>
                        </div>
                    </div>
                    <button
                        className="trip-action-btn trip-box-button"
                        type="button"
                        onClick={() => setSelectedTrip(trip)}
                    >
                        View
                    </button>
                </div>
            ))}

            {selectedTrip && (
                <TripDetail
                    trip={selectedTrip}
                    onTripsUpdated={refreshTrips}
                    onClose={() => setSelectedTrip(null)}
                />
            )}
            </div>
    );
}