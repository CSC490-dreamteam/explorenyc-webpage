import '/src/App.css'
import './TripDetail.css'
import MapScreen from "../MapScreen.jsx";
import { useEffect, useRef, useState } from "react";

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

function processLegs(legs){
    if (!legs) return [];
    const processedLegs = [];
    let i=0;
    while (i< legs.length) {
        if ( //if legs has a subway followed by walk followed by another subway, we combine them into a single leg with the walk as a transfer
            legs[i].TransportType === 2
            && i + 2 < legs.length
            && legs[i + 1].TransportType === 0
            && legs[i + 2].TransportType === 2
        ) {
            processedLegs.push({
                TransportType: 2,
                TravelTimes: legs[i].TravelTimes + legs[i + 1].TravelTimes + legs[i + 2].TravelTimes,
                TransitCosts: legs[i].TransitCosts, // just get first cost
                isTransfer: true,
            });
            i += 3;
        } else {
            processedLegs.push({...legs[i], isTransfer: false});
            i++;
        }
    }
    return processedLegs;
}

function TripDetail({ trip, onClose, onTripsUpdated }) {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
    const [duplicateDate, setDuplicateDate] = useState("");
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [duplicateError, setDuplicateError] = useState("");
    const stops = Array.isArray(trip?.stops) ? trip.stops : [];
    const detailBoxRef = useRef(null);

    useEffect(() => {
        setIsDuplicateOpen(false);
        setDuplicateDate("");
        setIsDuplicating(false);
        setDuplicateError("");
    }, [trip?.trip_id]);

    useEffect(() => {
        if (!isDuplicateOpen || !detailBoxRef.current) {
            return;
        }

        requestAnimationFrame(() => {
            if (!detailBoxRef.current) {
                return;
            }

            detailBoxRef.current.scrollTo({
                top: detailBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        });
    }, [isDuplicateOpen]);

    async function handleDuplicateTrip() {
        if (!trip?.trip_id) {
            const message = "Unable to duplicate this trip because the trip ID is missing.";
            setDuplicateError(message);
            console.error(message);
            return;
        }

        if (!duplicateDate) {
            setDuplicateError("Select a new date before duplicating this trip.");
            return;
        }

        setIsDuplicating(true);
        setDuplicateError("");

        const params = new URLSearchParams({
            trip_id: String(trip.trip_id),
            new_date: duplicateDate,
        });

        try {
            const response = await fetch(
                `https://explorenyc-recommendation-service.onrender.com/duplicate-trip?${params.toString()}`,
                { method: "POST" }
            );

            if (response.status !== 200) {
                const errorText = await response.text();
                const message = errorText
                    ? `Failed to duplicate trip (${response.status}): ${errorText}`
                    : `Failed to duplicate trip (${response.status}).`;
                setDuplicateError(message);
                console.error("Failed to duplicate trip:", {
                    status: response.status,
                    body: errorText,
                });
                return;
            }

            if (onTripsUpdated) {
                await onTripsUpdated();
            }

            onClose();
        } catch (error) {
            const message = `Failed to duplicate trip: ${error instanceof Error ? error.message : "Unknown error."}`;
            setDuplicateError(message);
            console.error("Failed to duplicate trip:", error);
        } finally {
            setIsDuplicating(false);
        }
    }

    return (
        <>
            <div
                className="trip-detail-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="trip-detail-title"
                onClick={onClose}
            >
                <div
                    className="trip-detail-box"
                    ref={detailBoxRef}
                    onClick={(event) => event.stopPropagation()}
                >
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
                                    {processLegs(stop.Legs).map((leg, legIndex) => {
                                        const mode = TRANSPORT_MODES[leg.TransportType];
                                        return (
                                            <div className='transit-block' key={legIndex}>
                                                <div className={`transit-icon ${mode?.className}`} />
                                                <div className="transit-info">
                                                    <strong>
                                                        {mode?.label}
                                                        {leg.isTransfer && ' w/ Transfer'}
                                                    </strong>
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

                    <div className="trip-action-row">
                        <button
                            className="trip-action-btn"
                            type="button"
                            onClick={() => setIsMapOpen(true)}
                        >
                            Open Map
                        </button>

                        <button
                            className="trip-action-btn"
                            type="button"
                            onClick={() => {
                                setIsDuplicateOpen(true);
                                setDuplicateError("");
                            }}
                        >
                            Duplicate Trip
                        </button>
                    </div>

                    {isDuplicateOpen && (
                        <div className="trip-duplicate-panel">
                            <label className="trip-duplicate-label" htmlFor="duplicate-trip-date">
                                New date
                            </label>
                            <input
                                id="duplicate-trip-date"
                                type="date"
                                className="trip-duplicate-input"
                                value={duplicateDate}
                                onChange={(event) => {
                                    setDuplicateDate(event.target.value);
                                    if (duplicateError) {
                                        setDuplicateError("");
                                    }
                                }}
                            />

                            {duplicateError && (
                                <p className="trip-duplicate-error" role="alert">
                                    {duplicateError}
                                </p>
                            )}

                            <div className="trip-duplicate-actions">
                                <button
                                    className="trip-action-btn"
                                    type="button"
                                    onClick={handleDuplicateTrip}
                                    disabled={isDuplicating}
                                >
                                    {isDuplicating ? "Duplicating..." : "Confirm Duplicate"}
                                </button>
                                <button
                                    className="trip-action-btn trip-action-btn-secondary"
                                    type="button"
                                    onClick={() => {
                                        setIsDuplicateOpen(false);
                                        setDuplicateDate("");
                                        setDuplicateError("");
                                    }}
                                    disabled={isDuplicating}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
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
