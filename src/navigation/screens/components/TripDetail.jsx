import '/src/App.css'
import './TripDetail.css'
import MapScreen from "../MapScreen.jsx";
import { useState } from "react";

function formatStopAddress(address) {
    if (!address) return "Address unavailable";
    if (typeof address === "string") return address;

    return [
        address.Street,
        address.City,
        address.State,
        address.ZipCode,
    ].filter(Boolean).join(", ") || "Address unavailable";
}

function TripDetail({ trip, onClose }) {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const stops = Array.isArray(trip?.stops) ? trip.stops : [];

    return (
        <>
            <div
                className="trip-detail-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="trip-detail-title"
                onClick={onClose}
            >
                <div className="trip-detail-box" onClick={(event) => event.stopPropagation()}>
                    <button
                        className="trip-detail-close"
                        type="button"
                        onClick={onClose}
                        aria-label="Close trip details"
                    >
                        X
                    </button>

                    <h2 id="trip-detail-title">{trip?.name || "Trip Information"}</h2>
                    <p className="trip-detail-subtitle">
                        Trip ID: {trip?.trip_id ?? "Unknown"}
                    </p>

                    <h3>Stops Visited</h3>
                    {stops.length > 0 ? (
                        <div className="trip-detail-stops">
                            {stops.map((stop, index) => (
                                <div
                                    className="trip-detail-stop"
                                    key={stop?.id ?? `${trip?.trip_id}-${index}`}
                                >
                                    <strong>{stop?.Name || `Stop ${index + 1}`}</strong>
                                    <p>{formatStopAddress(stop?.Address)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No stops found for this trip.</p>
                    )}

                    <button
                        className="trip-action-btn"
                        type="button"
                        onClick={() => setIsMapOpen(true)}
                    >
                        Open Map
                    </button>
                </div>
            </div>

            {isMapOpen && (
                <div className="trip-map-overlay" role="dialog" aria-modal="true">
                    <div className="trip-map-modal">
                        <button
                            className="trip-action-btn trip-map-close"
                            type="button"
                            onClick={() => setIsMapOpen(false)}
                            aria-label="Close map"
                        >
                            X
                        </button>
                        <MapScreen embedded stops={stops} />
                    </div>
                </div>
            )}
        </>
    )
}

export default TripDetail
