import '/src/App.css'
import './TripDetail.css'
import MapScreen from "../MapScreen.jsx";
import { useState } from "react";

const TRANSPORT_MODES = {
    0: { label: 'Walking', className: 'transitIconWalking'  },
    1: { label: 'Car', className: 'transitIconCar' },
    2: { label: 'Subway', className: 'transitIconSubway' },
}

function formatCost(cents) {
    if (!cents) return null
    return `$${(cents / 100).toFixed(2)}`
}

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
                                <div key={stop?.id ?? `${trip?.trip_id}-${index}`}>
                                    <div className="trip-detail-stop">
                                        <strong>{stop?.Name || `Stop ${index + 1}`}</strong>
                                        <p>{formatStopAddress(stop?.Address)}</p>
                                    </div>

                            {index < stops.length - 1 && stop.Legs && stop.Legs.length > 0 && (
                                <div className="transit-legs">
                                    {stop.Legs.map((leg, legIndex) => {
                                        const isTransfer = leg.TransportType === 0
                                            && legIndex > 0
                                            && legIndex < stop.Legs.length - 1
                                            && stop.Legs[legIndex - 1].TransportType === 2
                                            && stop.Legs[legIndex + 1].TransportType === 2;

                                        const mode = isTransfer
                                            ? { label: 'Transfer', className: 'transitIconWalking' }
                                            : TRANSPORT_MODES[leg.TransportType];
                                    
                                        return (
                                            <div className='transit-block' key={legIndex}>
                                                <div className={`transit-icon ${mode?.className}`} />
                                                <div className="transit-info">
                                                    <strong>{mode?.label}</strong>
                                                    <span className="transit-details">
                                                        {leg.TravelTimes} min
                                                        {leg.TransitCosts > 0 && ` · ${formatCost(leg.TransitCosts)}`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                             </div>
                        )}

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
                        <MapScreen embedded />
                    </div>
                </div>
            )}
        </>
    )
}

export default TripDetail

