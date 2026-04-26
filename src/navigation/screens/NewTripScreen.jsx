import React, {useEffect, useRef, useState} from 'react';
import './NewTripScreen.css';
import SearchModal from './components/SearchModal';
import { createEmptyStop, formatStopLocationLabel, getKnownStopAddress } from '../../utils/stopLocations';
import { readTripDraft, writeTripDraft } from '../../utils/tripDraftStorage';


function NewTripScreen() {
    const [tripName, setTripName] = useState('')
    const [tripDate, setTripDate] = useState('')
    const [entryTime, setEntryTime] = useState('')
    const [exitTime, setExitTime] = useState('')
    const [bufferMinutes, setBufferMinutes] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [startLocation, setStartLocation] = useState('')
    const [errorState, setErrorState] = useState(null)
    const [endLocation, setEndLocation] = useState('')
    const [transitTypes, setTransitTypes] = useState({
        subway: false,
        car: false,
        walking: false,
        uber: false,
    })
    const [hasLoadedDraft, setHasLoadedDraft] = useState(false)

    const addStopErrorRef = useRef(null)
    const startPointErrorRef = useRef(null)
    const baseMaxStops = 8

    //PLACEHOLDER
    const handleGenerateTripSubmit = async () => {
        if (stops.length < 2) {
            setErrorState({
                target: 'addStop',
                message: 'You must enter at least 2 stops.',
                reason: 'minStops'
            })
            return
        }

        if (!startLocation.trim()) {
            setErrorState({
                target: 'startPoint',
                message: 'You must specify a starting point.',
                reason: 'missingStart'
            })
            return
        }

        // iOS Safari blocks window.open unless it's called synchronously in a user gesture.
        const popup = window.open('about:blank', '_blank');
        //later this will have everything we throw to the backend for submission
        const tripData = {
            locations: stops.map(stop => stop.location)
        };
        console.log(tripData);

        setErrorState(null)
        setIsLoading(true)
        try { //fetch request from backend
            const response = await fetch('https://explorenyc-backend-testing.up.railway.app/GenerateRoute', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': 'sauce1234' //YES HARDCODED THE API KEY LMAO i know to fix it later.
                },
                body: JSON.stringify(tripData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json(); //get generated trip

            if (popup && !popup.closed) {
                popup.location = responseData.url;
                if (popup.opener) {
                    popup.opener = null;
                }
            } else {
                window.location.assign(responseData.url);
            }


        } catch (error) {
            console.error('Error submitting trip data:', error);
            if (popup && !popup.closed) {
                popup.close();
            }
        } finally {
            setIsLoading(false)
        }
        
    };



    // React state variable known as stops that is an array full of JSON
    const [stops, setStops] = useState([createEmptyStop()]);

    //function that edits a stop by index, used when the user changes it in the ui
    //under the hood it takes the existing stops array, , edits one index entry as needed, then reassigns the state variable to the new array
    const handleStopChange = (index, field, value) => {
        const newStops = [...stops];
        newStops[index][field] = value;
        setStops(newStops);
    };

    //adds stop to the stops array
    const trimmedStartLocation = startLocation.trim()
    const trimmedEndLocation = endLocation.trim()
    const maxStopsAllowed = trimmedStartLocation && !trimmedEndLocation ? 9 : baseMaxStops

    const addStop = () => {
        if (stops.length >= maxStopsAllowed) {
            setErrorState({
                target: 'addStop',
                message: 'Stop limit reached.',
                reason: 'maxStops'
            })
            return
        }

        setStops([...stops, createEmptyStop()]);
        if (errorState?.reason === 'minStops') {
            setErrorState(null)
        }
    };

    const removeStop = (indexToRemove) => {
        setStops(stops.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        const draft = readTripDraft()

        setTripName(draft.tripName)
        setTripDate(draft.date)
        setEntryTime(draft.entryTime)
        setExitTime(draft.exitTime)
        setStartLocation(draft.startLocation)
        setEndLocation(draft.endLocation)
        setStops(draft.stops.length > 0 ? draft.stops : [createEmptyStop()])
        setTransitTypes(draft.transitTypes)
        setBufferMinutes(draft.bufferMinutes)
        setHasLoadedDraft(true)
    }, [])

    useEffect(() => {
        if (!hasLoadedDraft) {
            return
        }

        writeTripDraft({
            tripName,
            date: tripDate,
            entryTime,
            exitTime,
            startLocation,
            startAddress: getKnownStopAddress(startLocation),
            endLocation,
            endAddress: getKnownStopAddress(endLocation),
            stops,
            transitTypes,
            bufferMinutes,
        })
    }, [
        bufferMinutes,
        endLocation,
        entryTime,
        exitTime,
        hasLoadedDraft,
        startLocation,
        stops,
        transitTypes,
        tripDate,
        tripName,
    ])

    useEffect(() => {
        if (!errorState) {
            return
        }

        const refMap = {
            addStop: addStopErrorRef,
            startPoint: startPointErrorRef
        }

        const targetRef = refMap[errorState.target]
        if (targetRef?.current) {
            targetRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})
            targetRef.current.focus({preventScroll: true})
        }
    }, [errorState])

    useEffect(() => {
        if (errorState?.reason === 'maxStops' && stops.length < maxStopsAllowed) {
            setErrorState(null)
        }
    }, [errorState, maxStopsAllowed, stops.length])

    const addStopButton = (
        <button type="button" className="secondaryButton" onClick={addStop}>
            + Add Stop
        </button>
    )

    const isAddStopError = errorState?.target === 'addStop'
    const isStartPointError = errorState?.target === 'startPoint'

    return (
        <div className='newTripPage'>
            {isLoading && (
                <div className="loadingOverlay" role="status" aria-live="polite">
                    <div className="loadingCard">
                        <div className="loadingSpinner" aria-hidden="true" />
                        <div className="loadingText">Loading</div>
                    </div>
                </div>
            )}
            <div className="newTripHeader">
                <h2>Plan New Trip</h2>
                <p>Customize your NYC adventure</p>
            </div>

            <section className="newTripCard">
                <h3>Trip Name</h3>

                <div className="fieldGroup">
                    <input
                        id="trip-name"
                        type="text"
                        className='bigField'
                        placeholder="e.g. Weekend Food Tour"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                    />
                </div>
            </section>

            <section className="newTripCard">
                <h3>Time Window</h3>

                <div className="fieldGroup">
                    <label htmlFor="trip-date">Date</label>
                    <div className="inputWithIcon">
                        <input
                            id="trip-date"
                            type="date"
                            className="smallField"
                            value={tripDate}
                            onChange={(e) => setTripDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="fieldRow twoCol">
                    <div className="fieldGroup">
                        <label htmlFor="entry-time">Entry Time</label>
                        <input
                            id="entry-time"
                            type="time"
                            className="smallField timeField"
                            value={entryTime}
                            onChange={(e) => setEntryTime(e.target.value)}
                        />
                    </div>

                    <div className="fieldGroup">
                        <label htmlFor="exit-time">Exit Time</label>
                        <input
                            id="exit-time"
                            type="time"
                            className="smallField timeField"
                            value={exitTime}
                            onChange={(e) => setExitTime(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className="newTripCard">
                <h3>Start & End Points</h3>
                {isStartPointError ? (
                    <ErrorWrapper
                        message={errorState.message}
                        innerRef={startPointErrorRef}
                    >
                        <div className="fieldGroup">
                            <label htmlFor="trip-start">Starting Location</label>
                            <div className="inputWithIcon">
                                <input
                                    id="trip-start"
                                    type="text"
                                    className="smallField noZoomField"
                                    placeholder="Enter starting point"
                                value={startLocation}
                                onChange={(e) => {
                                    const nextValue = e.target.value
                                    setStartLocation(nextValue)
                                    if (nextValue.trim()) {
                                        setErrorState(null)
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </ErrorWrapper>
                ) : (
                    <div className="fieldGroup">
                        <label htmlFor="trip-start">Starting Location</label>
                        <div className="inputWithIcon">
                            <input
                                id="trip-start"
                                type="text"
                                className="smallField noZoomField"
                                placeholder="Enter starting point"
                                value={startLocation}
                                onChange={(e) => setStartLocation(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="fieldGroup">
                    <label htmlFor="trip-end">Ending Location</label>
                    <div className="inputWithIcon">
                        <input
                            id="trip-end"
                            type="text"
                            className="smallField noZoomField"
                            placeholder="Enter ending point"
                            value={endLocation}
                            onChange={(e) => setEndLocation(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className="newTripCard">
                <div className="cardTitleRow">
                    <h3>Stops</h3>
                    {isAddStopError ? (
                        <ErrorWrapper
                            message={errorState.message}
                            innerRef={addStopErrorRef}
                            className="errorWrapper--inline"
                        >
                            {addStopButton}
                        </ErrorWrapper>
                    ) : (
                        addStopButton
                    )}
                </div>

                <div className="stopsList">
                    {
                        stops.map((stop, index) => (
                            <StopEntryBlock
                                key={index}
                                index={index}
                                data={stop}
                                stopCount={stops.length}
                                onChange={(field, value) => handleStopChange(index, field, value)}
                                onDelete={() => removeStop(index)}
                            />
                        ))
                    }
                </div>
            </section>

            <section className="newTripCard">
                <h3>Transportation</h3>
                <div className="checkboxGrid">
                    <label className="checkboxItem">
                        <input
                            type="checkbox"
                            checked={transitTypes.subway}
                            onChange={(e) => setTransitTypes((current) => ({...current, subway: e.target.checked}))}
                        />
                        Subway
                    </label>
                    <label className="checkboxItem">
                        <input
                            type="checkbox"
                            checked={transitTypes.car}
                            onChange={(e) => setTransitTypes((current) => ({...current, car: e.target.checked}))}
                        />
                        Car
                    </label>
                    <label className="checkboxItem">
                        <input
                            type="checkbox"
                            checked={transitTypes.walking}
                            onChange={(e) => setTransitTypes((current) => ({...current, walking: e.target.checked}))}
                        />
                        Walking
                    </label>
                    <label className="checkboxItem">
                        <input
                            type="checkbox"
                            checked={transitTypes.uber}
                            onChange={(e) => setTransitTypes((current) => ({...current, uber: e.target.checked}))}
                        />
                        Uber
                    </label>
                </div>
            </section>
            <section className="newTripCard">
                <h3 className="subsectionTitle">Preferences</h3>
                <div className="checkboxList">
                    <label className="checkboxItem"><input type="checkbox" /> Avoid rush hour (5-7 PM)</label>
                    <label className="checkboxItem"><input type="checkbox" /> Instagram-worthy spots</label>
                    <label className="checkboxItem"><input type="checkbox" /> Low-key, hidden gems</label>
                    <label className="checkboxItem"><input type="checkbox" /> Off the beaten path</label>
                </div>

                <div className="fieldGroup">
                    <label htmlFor="stop-buffer">Buffer Time Between Stops</label>
                    <input
                        id="stop-buffer"
                        type="range"
                        min="0"
                        max="120"
                        step="1"
                        value={bufferMinutes}
                        onChange={(e) => setBufferMinutes(Number(e.target.value))}
                        className='slider'
                    />
                    <label className="sliderLabel">{formatBufferLabel(bufferMinutes)}</label>
                </div>
            </section>

            <button type="button" className="generateButton" onClick={handleGenerateTripSubmit}>
                Generate My Trip
            </button>
        </div>
    );
}

function ErrorWrapper({message, children, innerRef, className = ''}) {
    return (
        <div
            className={`errorWrapper ${className}`.trim()}
            ref={innerRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
        >
            <span className="errorWrapperLabel">{message}</span>
            {children}
        </div>
    )
}

function StopEntryBlock({data, onChange, index, onDelete, stopCount}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`stopCard ${isCollapsed ? 'stopCardCollapsed' : ''}`}>
            <div className="stopCardHeader">
                <h4>
                    {`Stop ${index + 1}`}

                    {data.location.trim() && isCollapsed && (
                        <span className="stopCardLocationLabel">{data.location.trim()}</span>
                    )}
                </h4>
                <div className="stopCardActions">
                    {!isCollapsed && (
                        <button type="button" onClick={() => setIsModalOpen(true)}>
                            <div className='icon mapSearchIcon'/>
                        </button>
                    )}

                    {stopCount > 1 && (
                        <button
                            type="button"
                            className="stopDeleteButton"
                            onClick={onDelete}
                            aria-label={`Delete stop ${index + 1}`}
                        >
                            ❌
                        </button>
                    )}
                </div>
            </div>

            {isCollapsed ? null : (
                <>
                    <div className="fieldGroup">
                        <label htmlFor={`stop-location-${index}`}>Location</label>
                        <input
                            id={`stop-location-${index}`}
                            type="text"
                            className="smallField noZoomField"
                            value={data.location}
                            onChange={(e) => onChange('location', e.target.value)}
                            placeholder="e.g. Central Park"
                        />
                    </div>

                    {isModalOpen && (
                        <SearchModal 
                            onClose={() => setIsModalOpen(false)} 
                            onSelect={(place) => {
                                const location = typeof place?.name === 'string' ? place.name : ''
                                const address = typeof place?.address === 'string' ? place.address : ''

                                onChange('location', formatStopLocationLabel(location, address))
                                onChange('address', address)
                                setIsModalOpen(false)
                            }} 
                        />
                    )}

                    <div className="checkboxGrid stopOptions">
                        <label className="checkboxItem">
                            <input
                                type="checkbox"
                                checked={data.mandatory}
                                onChange={(e) => onChange('mandatory', e.target.checked)}
                            />
                            Mandatory
                        </label>
                        <label className="checkboxItem">
                            <input
                                type="checkbox"
                                checked={data.flexible}
                                onChange={(e) => onChange('flexible', e.target.checked)}
                            />
                            Flexible
                        </label>
                    </div>

                    <div className="fieldGroup">
                        <label htmlFor={`stop-time-${index}`}>Time Preference</label>
                        <input
                            id={`stop-time-${index}`}
                            type="time"
                            className="smallField timeField"
                            value={data.timePreference}
                            onChange={(e) => onChange('timePreference', e.target.value)}
                        />
                    </div>
                </>
            )}
            <div style={{width: '100%'}}>
            <button
                type="button"
                className="stopCardToggle"
                style={{width:'100%'}}
                onClick={() => setIsCollapsed((current) => !current)}
            >
                {isCollapsed ? '⌄' : '^'}
            </button>
            </div>
        </div>

    );
}

export default NewTripScreen;
    const formatBufferLabel = (minutes) => {
        if (minutes >= 120) {
            return '2 hours'
        }
        if (minutes >= 60) {
            const remainder = minutes - 60
            if (remainder === 0) {
                return '1 hour'
            }
            return `1 hour ${remainder} ${remainder === 1 ? 'minute' : 'minutes'}`
        }
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    }
