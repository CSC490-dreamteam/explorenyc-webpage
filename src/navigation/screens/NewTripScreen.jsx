import React, {useEffect, useRef, useState} from 'react';
import './NewTripScreen.css';

function NewTripScreen() {
    const [bufferMinutes, setBufferMinutes] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [startLocation, setStartLocation] = useState('')
    const [errorState, setErrorState] = useState(null)
    const [endLocation, setEndLocation] = useState('')

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
            
            window.open(responseData.url, '_blank'); //open google map url in new tab


        } catch (error) {
            console.error('Error submitting trip data:', error);
        } finally {
            setIsLoading(false)
        }
        
    };



    // React state variable known as stops that is an array full of JSON
    const [stops, setStops] = useState([{
        location: '', mandatory: false, flexible: false, timePreference: ''
    }]);

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
                message: 'You cannot add any more stops.',
                reason: 'maxStops'
            })
            return
        }

        setStops([...stops, { location: '', mandatory: false, flexible: false, timePreference: '' }]);
        if (errorState?.reason === 'minStops') {
            setErrorState(null)
        }
    };

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
                    <input id="trip-name" type="text" className='bigField' placeholder="e.g. Weekend Food Tour" />
                </div>
            </section>

            <section className="newTripCard">
                <h3>Time Window</h3>

                <div className="fieldGroup">
                    <label htmlFor="trip-date">Date</label>
                    <div className="inputWithIcon">
                        <input id="trip-date" type="date" className="smallField" />
                    </div>
                </div>

                <div className="fieldRow twoCol">
                    <div className="fieldGroup">
                        <label htmlFor="entry-time">Entry Time</label>
                        <input id="entry-time" type="time" className="smallField timeField" />
                    </div>

                    <div className="fieldGroup">
                        <label htmlFor="exit-time">Exit Time</label>
                        <input id="exit-time" type="time" className="smallField timeField" />
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
                                onChange={(field, value) => handleStopChange(index, field, value)}
                            />
                        ))
                    }
                </div>
            </section>

            <section className="newTripCard">
                <h3>Transportation</h3>
                <div className="checkboxGrid">
                    <label className="checkboxItem"><input type="checkbox" /> Subway</label>
                    <label className="checkboxItem"><input type="checkbox" /> Car</label>
                    <label className="checkboxItem"><input type="checkbox" /> Walking</label>
                    <label className="checkboxItem"><input type="checkbox" /> Uber</label>
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

function StopEntryBlock({data, onChange, index}) {
    return (
        <div className="stopCard">
            <h4>Stop {index + 1}</h4>

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
            return remainder === 0 ? '1 hour' : `1 hour ${remainder} minutes`
        }
        return `${minutes} minutes`
    }
