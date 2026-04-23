import '/src/App.css'
import './TripDetail.css'
import MapScreen from "../MapScreen.jsx";
import { useEffect, useRef, useState } from "react";
import PlaceDetailsModal from "./PlaceDetailsModal.jsx";
import Toast from "./Toast.jsx";
import { addPlaceToPendingTrip } from "../utils/tripDrafts.js";
import { normalizeStopToPlace } from "../utils/stopPlace.js";
import { getGoogleMapsNavLink } from "../utils/mapURLs.js"; //

const TRANSPORT_MODES = {
    0: { label: 'Walking', className: 'transitIconWalking'  },
    1: { label: 'Car', className: 'transitIconCar' },
    2: { label: 'Subway', className: 'transitIconSubway' },
}

function formatCost(cents) {
    if (!cents) return null
    return `$${(cents / 100).toFixed(2)}`
}

function formatArrivalTime(baseDateTime, minutesOffset) {
    if (!baseDateTime || minutesOffset === undefined) return null;
    const date = new Date(baseDateTime);
    date.setMinutes(date.getMinutes() + minutesOffset);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatTimeRange(baseDateTime, arrivalOffset, departureOffset) {
    if (!baseDateTime || arrivalOffset === undefined) return null;
    
    const arrivalStr = formatArrivalTime(baseDateTime, arrivalOffset);
    
    //if departure is the same as arrival, just show arrival
    if (departureOffset === undefined || departureOffset === arrivalOffset) {
        return arrivalStr;
    }

    const departureStr = formatArrivalTime(baseDateTime, departureOffset);
    return `${arrivalStr} - ${departureStr}`;
}

function formatDuration(minutes) {
    if (minutes === 0 || !minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
}

//decides which legs 'dominates' for the google maps nav URL
function getRepresentativeLeg(processedLegs) {
    if (!processedLegs || processedLegs.length === 0) return null;
    if (processedLegs.length === 1) return processedLegs[0];
    return processedLegs[1];
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
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [toastConfig, setToastConfig] = useState({ show: false, message: "", type: "" });
    const stops = Array.isArray(trip?.stops) ? trip.stops : [];
    const detailBoxRef = useRef(null);
    const [gmapsButton, setGmapsButton] = useState(null);

    function handleTransitClick(event, processedLegs, originStop, destinationStop) {
        if (!detailBoxRef.current) return;
        const leg = getRepresentativeLeg(processedLegs);
        if (!leg) return;
        // anchor to the transit-block element center and account for container scroll
        const containerRect = detailBoxRef.current.getBoundingClientRect();
        const targetRect = event.currentTarget.getBoundingClientRect();
        const x = (targetRect.left - containerRect.left) + (targetRect.width / 2) + detailBoxRef.current.scrollLeft;
        const y = (targetRect.top - containerRect.top) + detailBoxRef.current.scrollTop;
        setGmapsButton({ x, y, leg, originStop, destinationStop });
    }

    function handleDetailBoxClick(event) {
        // prevent overlay from closing
        event.stopPropagation();
        // if clicked the gm button or a transit block, keep it
        if (event.target && event.target.closest && event.target.closest('.gmaps-open-btn')) {
            return;
        }
        if (event.target && event.target.closest && event.target.closest('.transit-legs')) {
            return;
        }
        setGmapsButton(null);
    }

    function handleOpenInGoogleMaps() {
        if (!gmapsButton) return;

        const { originStop, destinationStop, leg } = gmapsButton;
        const transitType = leg.TransportType; // 0=walking, 1=car, 2=subway

        const navLink = getGoogleMapsNavLink(originStop, destinationStop, transitType);

        if (navLink) {
            window.open(navLink, '_blank', 'noopener,noreferrer');
        } else {
            console.warn('Failed to generate Google Maps link');
        }

        setGmapsButton(null);
    }

    useEffect(() => {
        setIsDuplicateOpen(false);
        setDuplicateDate("");
        setIsDuplicating(false);
        setDuplicateError("");
        setSelectedPlace(null);
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
                `https://explorenyc-recommendation-service-production.up.railway.app/duplicate-trip?${params.toString()}`,
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

    function triggerToast(message, type) {
        setToastConfig({ show: true, message, type });
    }

    function handleStopClick(stop, index) {
        setSelectedPlace(normalizeStopToPlace(stop, index, trip?.trip_id));
    }

    function handleAddToTrip(place) {
        const result = addPlaceToPendingTrip(place);
        triggerToast(result.message, result.type);
        setSelectedPlace(null);
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
                    onClick={handleDetailBoxClick}
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

                            {stops.map((stop, index) => {
                                const place = normalizeStopToPlace(stop, index, trip?.trip_id);
                                const processedLegs = index < stops.length - 1 && stop.Legs
                                    ? processLegs(stop.Legs)
                                    : [];

                                return (
                                    <div key={stop?.id ?? `${trip?.trip_id}-${index}`}>
                                        <button
                                            className="trip-detail-stop trip-detail-stop-button"
                                            type="button"
                                            onClick={() => handleStopClick(stop, index)}
                                        >

                                            {/* name and address */}
                                            <div className="stop-main-info">
                                                <strong>{place.name}</strong>
                                                <p>{place.address}</p>
                                            </div>

                                            {/* trip stop arrival time and duration  */}
                                            {formatTimeRange(trip?.entry_datetime, stop.ArrivalTimeInMinutes, stop.DepartureTimeInMinutes) && (
                                                <span className="stop-arrival-time">
                                                    {formatTimeRange(trip?.entry_datetime, stop.ArrivalTimeInMinutes, stop.DepartureTimeInMinutes)}
                                                </span>
                                            )}

                                            {stop.DurationAtStopInMinutes > 0 && (
                                                <span className="stop-duration-badge">
                                                    {formatDuration(stop.DurationAtStopInMinutes)}
                                                </span>
                                            )}
                                        </button>

                                        {processedLegs.length > 0 && (
                                            <div
                                                className="transit-legs"
                                                onClick={(e) => handleTransitClick(e, processedLegs, stop, stops[index + 1])}
                                            >
                                                {processedLegs.map((leg, legIndex) => {
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
                                );
                            })}
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

                    {gmapsButton && (
                        <button
                            type="button"
                            className="gmaps-open-btn"
                            style={{
                                position: "absolute",
                                left: `${gmapsButton.x}px`,
                                top: `${gmapsButton.y}px`,
                                zIndex: 1200,
                                transform: "translate(-50%, -140%)",
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenInGoogleMaps();
                            }}
                        >
                            <img src="/gmaps_icon.svg" alt="" className="gmaps-open-btn-icon" />
                            <span>Open In Google Maps</span>
                        </button>
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

            {selectedPlace && (
                <PlaceDetailsModal
                    place={selectedPlace}
                    onClose={() => setSelectedPlace(null)}
                    onAddToTrip={handleAddToTrip}
                />
            )}

            {toastConfig.show && (
                <Toast
                    message={toastConfig.message}
                    type={toastConfig.type}
                    onClose={() => setToastConfig((current) => ({ ...current, show: false }))}
                />
            )}
        </>
    )
}

export default TripDetail
