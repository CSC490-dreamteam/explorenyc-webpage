import React, {useEffect, useRef, useState} from 'react';
import './NewTripScreen.css';
import SearchModal from './components/SearchModal';


function NewTripScreen() {
    const [isLoading, setIsLoading] = useState(false)
    const [errorState, setErrorState] = useState(null)

    //general trip vars
    const [startLocation, setStartLocation] = useState('')
    const [endLocation, setEndLocation] = useState('')

    const [tripName, setTripName] = useState('')
    const [date, setDate] = useState('')
    const [entryTime, setEntryTime] = useState('')
    const [exitTime, setExitTime] = useState('')

    const addStopErrorRef = useRef(null)
    const startPointErrorRef = useRef(null)
    const baseMaxStops = 8

    //PLACEHOLDER



    const handleTripSubmit = async () => {
        //errors
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

        if (!entryTime.trim()) {
            setErrorState({
                target: 'startPoint', //BUGGED
                message: 'You must specify a start time.',
                reason: 'missingEntryTime'
            })
            return
        }

        if (!exitTime.trim()) {
            setErrorState({
                target: 'startPoint', //BUGGED
                message: 'You must specify an exit time.',
                reason: 'missingExitTime'
            })
            return
        }

        // iOS Safari blocks window.open unless it's called synchronously in a user gesture.
        const popup = window.open('about:blank', '_blank');

        //actual endpoint data
        const tripData = {
            tripName: tripName.trim() ? tripName.trim() : 'My NYC Trip',
            date: date,
            entryTime: entryTime,
            exitTime: exitTime,
            startLocation: startLocation.trim(),
            endLocation: endLocation.trim() ? endLocation.trim() : null,
            stops: stops.map(stop => ({
                location: stop.location,
                mandatory: stop.mandatory,
                timePreference: stop.timePreference ? stop.timePreference : null,
                duration: stop.duration
            }))
        };
        console.log(tripData);

        
        const tempLocations = [
            startLocation.trim(),
            ...stops.map(stop => stop.location.trim()).filter(loc => loc),
            ...(endLocation.trim() ? [endLocation.trim()] : [])
        ];

        const oldTripData = {
            locations: tempLocations
        };


        setErrorState(null)
        setIsLoading(true)
        try {
            //old endpoint that shows the maps link
            const oldResponse = await fetch('https://explorenyc-backend-production.up.railway.app/GenerateRoute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'sauce1234'
                },
                body: JSON.stringify(oldTripData)
            });

            if (!oldResponse.ok) {
                throw new Error('Old endpoint response was not ok');
            }

            const oldResponseData = await oldResponse.json();

            if (popup && !popup.closed) {
                popup.location = oldResponseData.url;
                if (popup.opener) {
                    popup.opener = null;
                }
            } else {
                window.location.assign(oldResponseData.url);
            }

            //new real endpoint, does nothing rn
            const response = await fetch('https://explorenyc-backend-production.up.railway.app/GenerateItinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'sauce1234'
                },
                body: JSON.stringify(tripData)
            });

            if (!response.ok) {
                console.error('New endpoint failed:', response.status);
            } else {
                const responseData = await response.json();
                console.log('New endpoint response:', responseData);
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
    const [stops, setStops] = useState([{
        location: '', mandatory: false, timePreference: '', duration: 60
    }]);

    //function that edits a stop by index, used when the user changes it in the ui
    //under the hood it takes the existing stops array, edits one index entry as needed, then reassigns the state variable to the new array
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

        setStops([...stops, { location: '', mandatory: false, timePreference: '', duration: 60 }]);
        if (errorState?.reason === 'minStops') {
            setErrorState(null)
        }
    };

    const removeStop = (indexToRemove) => {
        setStops(stops.filter((_, index) => index !== indexToRemove));
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
                    <input id="trip-name" type="text" className='bigField' placeholder="e.g. Weekend Food Tour" 
                    value={tripName} onChange={(e) => setTripName(e.target.value)}
                    />
                </div>
            </section>

            <section className="newTripCard">
                <h3>Time Window</h3>


                <div className="fieldGroup">
                    <label htmlFor="trip-date">Date</label>
                    <div className="inputWithIcon">
                        <input id="trip-date" type="date" className="smallField" 
                        value={date} onChange={(e) => setDate(e.target.value)}/>
                    </div>
                </div>

                <div className="fieldRow twoCol">
                    <div className="fieldGroup">
                        <label htmlFor="entry-time">Entry Time</label>
                        <input id="entry-time" type="time" className="smallField timeField" 
                        value={entryTime} onChange={(e) => setEntryTime(e.target.value)}/>
                    </div>

                    <div className="fieldGroup">
                        <label htmlFor="exit-time">Exit Time</label>
                        <input id="exit-time" type="time" className="smallField timeField" 
                        value={exitTime} onChange={(e) => setExitTime(e.target.value)}/>
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




            <button type="button" className="generateButton" onClick={handleTripSubmit}>
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
                            onSelect={(val) => {
                                onChange('location', val); // Update the main form
                                setIsModalOpen(false);      // Close modal
                            }} 
                        />
                    )}

                    <div className="stopOptions">
                        <label className="checkboxItem">
                            <input
                                type="checkbox"
                                checked={data.mandatory}
                                onChange={(e) => onChange('mandatory', e.target.checked)}
                            />
                            Mandatory
                        </label>
                        <div className="stopOptionsTimeGroup">
                            <label className="stopOptionsTimeLabel" htmlFor={`stop-time-${index}`}>
                                Time Preference
                            </label>
                            <input
                                id={`stop-time-${index}`}
                                type="time"
                                className="smallField timeField stopOptionsTimeField"
                                value={data.timePreference}
                                onChange={(e) => onChange('timePreference', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="fieldGroup">
                        <label htmlFor={`stop-duration-${index}`}>Duration of Stay</label>
                        <input
                            id={`stop-duration-${index}`}
                            type="range"
                            min="0"
                            max="120"
                            step="1"
                            value={data.duration}
                            onChange={(e) => onChange('duration', Number(e.target.value))}
                            className='slider'
                        />
                        <label className="sliderLabel">{formatBufferLabel(data.duration)}</label>
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

function formatBufferLabel(minutes) {
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

export default NewTripScreen;
