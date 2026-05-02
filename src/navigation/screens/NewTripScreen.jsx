import React, {useEffect, useRef, useState} from 'react';
import './NewTripScreen.css';
import SearchModal from './components/SearchModal';
import Auth from '../../auth';
import { calculateAllUserStats } from './utils/statCrunching';


import walkingIcon from '../../assets/walking.svg';
import subwayIcon from '../../assets/subway.svg';
import carIcon from '../../assets/car.svg';


function NewTripScreen() {
    const [isLoading, setIsLoading] = useState(false)
    const [errorState, setErrorState] = useState(null)
    const [routeErrorVisible, setRouteErrorVisible] = useState(false);

    //general trip vars
    const [startLocation, setStartLocation] = useState('Penn Station')
    const [endLocation, setEndLocation] = useState('')

    const [transitPreferences, setTransitPreferences] = useState({
        walking: true,
        subway: true,
        car: true
    });

    const transitIcons = {
        walking: walkingIcon,
        subway: subwayIcon,
        car: carIcon
    };

    const [tripName, setTripName] = useState('')
    const [date, setDate] = useState('')
    const [entryTime, setEntryTime] = useState('')
    const [exitTime, setExitTime] = useState('')

    const addStopErrorRef = useRef(null)
    const startPointErrorRef = useRef(null)
    const dateErrorRef = useRef(null)
    const entryTimeErrorRef = useRef(null)
    const exitTimeErrorRef = useRef(null)
    const transitTypesErrorRef = useRef(null)
    const timeWindowErrorRef = useRef(null)
    const baseMaxStops = 8

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

        if (!date.trim()) {
            setErrorState({
                target: 'date',
                message: 'You must specify a date.',
                reason: 'missingDate'
            })
            return
        }

        if (!entryTime.trim()) {
            setErrorState({
                target: 'entryTime',
                message: 'You must specify an entry time.',
                reason: 'missingEntryTime'
            })
            return
        }

        if (!exitTime.trim()) {
            setErrorState({
                target: 'exitTime',
                message: 'You must specify an exit time.',
                reason: 'missingExitTime'
            })
            return
        }

        const hasSelectedTransit = Object.values(transitPreferences).includes(true);
        if (!hasSelectedTransit) {
            setErrorState({
                target: 'transitTypes',
                message: 'Please select at least one transit type.',
                reason: 'noTransitSelected'
            });
            return;
        }

        //check that the time window can fit all mandatory stops
        const [entryHours, entryMinutes] = entryTime.split(':').map(Number)
        const [exitHours, exitMinutes] = exitTime.split(':').map(Number)
        const availableMinutes = (exitHours * 60 + exitMinutes) - (entryHours * 60 + entryMinutes)

        const requiredMinutes = stops
            .filter(stop => !stop.optional)
            .reduce((sum, stop) => sum + (stop.duration || 0), 0)

        if (requiredMinutes > availableMinutes) {
            setErrorState({
                target: 'timeWindow',
                message: 'There is not enough time for all your stops.',
                reason: 'insufficientTime'
            })
            return
        }

        //actual endpoint data
        const tripData = {
            tripName: tripName.trim() ? tripName.trim() : 'My NYC Trip',
            date: date,
            entryTime: entryTime,
            exitTime: exitTime,
            startLocation: startLocation.trim(),
            endLocation: endLocation.trim() ? endLocation.trim() : null,
            transitTypes: transitPreferences,
            stops: stops.map(stop => ({
                location: stop.location,
                mandatory: !stop.optional, //if a stop is not optional that its mandatory
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

        setErrorState(null)
        setIsLoading(true)
        try {
            const response = await fetch('https://explorenyc-backend-production.up.railway.app/GenerateItinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'sauce1234'
                },
                body: JSON.stringify(tripData)
            });

            //if an impossible rotue was asked to be made
            if (response.status === 422) {
                setRouteErrorVisible(true);
                setIsLoading(false);
                return;
            }


            if (!response.ok) {
                console.error('Endpoint failed:', response.status);
            } else {
                const responseData = await response.json();
                console.log('Endpoint response:', responseData);

                // Remove tripName and date from responseData and rename Stops to stops
                const { tripName: _unusedName, date: _unusedDate, Stops, ...rest } = responseData;
                const stopsData = {
                    stops: Stops,
                    ...rest
                };

                // Store Itinerary
                const itineraryData = {
                    user_id: String(Auth.currentUserId),
                    date: date.trim(),
                    entryTime: entryTime.trim(),
                    exitTime: exitTime.trim(),
                    trip_name: tripName.trim() ? tripName.trim() : 'My NYC Trip',
                    stops: stopsData
                };

                console.log('Sending to StoreItinerary:', itineraryData);

                try {
                    const storeResponse = await fetch('https://explorenyc-recommendation-service-production.up.railway.app/StoreItinerary', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(itineraryData)
                    });

                    if (!storeResponse.ok) {
                        console.error('StoreItinerary failed:', storeResponse.status);
                    } else {
                        const storeData = await storeResponse.json();
                        console.log('StoreItinerary success:', storeData);
                    }
                } catch (storeError) {
                    console.error('Error storing itinerary:', storeError);
                }
            }
        } catch (error) {
            console.error('Error submitting trip data:', error);
            if (popup && !popup.closed) {
                popup.close();
            }
        } finally {
            setIsLoading(false)
        }

        updateUserStats();

    };

    async function updateUserStats() {
        console.log("Updating user stats...");
        const id = Auth?.currentUserId ?? 1;

        try {

            //grab user's trips
            const res = await fetch(
                `https://explorenyc-recommendation-testing.up.railway.app/trip-stops?user_id=${encodeURIComponent(id)}`
            );

            if (!res.ok) throw new Error("Failed to fetch trip data");

       
            const json = await res.json();
            const trips = Array.isArray(json?.trips) ? json.trips : [];

            //calc the stats
            const UserStats = calculateAllUserStats(trips);

            console.log("Calculated user stats:", UserStats);

            //make payload 
            const payload = {
                user_id: id,
                total_walking_minutes: UserStats.totalWalkingMinutes,
                trip_count: UserStats.tripCount,
                unique_stops_count: UserStats.uniqueStopsCount
            };

            //contact endpoint
            const upsertResponse = await fetch('https://explorenyc-recommendation-service-production.up.railway.app/upsert-user-stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!upsertResponse.ok) {
                const errorDetail = await upsertResponse.json();
                console.error('Upsert User Stats failed:', upsertResponse.status, errorDetail);
                return null;
            }

            const result = await upsertResponse.json();
            console.log('User stats successfully upserted:', result);
            return result;

        } catch (err) {
            console.error("Error updating user stats:", err);
            return null;
        }
        
    }

    const [stops, setStops] = useState(() => {
        const saved = localStorage.getItem('active_trip_draft');
        //If we have a saved draft, use it. If not, start with one empty stop. 
        return saved 
            ? JSON.parse(saved)
            : [{ location: "", mandatory: false, duration: 30, timePreference: "" }];
    });

    useEffect(() => {
        localStorage.setItem('active_trip_draft', JSON.stringify(stops));
    }, [stops]); // This triggers when 'stops' is updated

    //function that edits a stop by index, used when the user changes it in the ui
    //under the hood it takes the existing stops array, edits one index entry as needed, then reassigns the state variable to the new array
    const handleStopChange = (index, field, value) => {
        const newStops = [...stops];
        newStops[index][field] = value;
        setStops(newStops);
    };

    //handles changes to transit checkboxes
    const handleTransitChange = (type) => {
        setTransitPreferences(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
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

        setStops([...stops, { location: '', optional: false, timePreference: '', duration: 60 }]);
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
            startPoint: startPointErrorRef,
            date: dateErrorRef,
            entryTime: entryTimeErrorRef,
            exitTime: exitTimeErrorRef,
            transitTypes: transitTypesErrorRef,
            timeWindow: timeWindowErrorRef
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
    const isEntryTimeError = errorState?.target === 'entryTime' || errorState?.target === 'timeWindow'
    const isExitTimeError = errorState?.target === 'exitTime' || errorState?.target === 'timeWindow'

    //check if there are any stops in local storage
    useEffect(() => {
        //check for saved stops in storage
        const savedStops = localStorage.getItem('pendingStops');

        if (savedStops) {
            const parsedStops = JSON.parse(savedStops);

            setStops(prevStops => {
                //filter out the initial empty stop if it exists
                const activeStops = prevStops.filter(s => s.location !== "");
                return [...activeStops, ...parsedStops];
            });

            //clear the storage so they don't get added 
            //every time the user visits this screen
            localStorage.removeItem('pendingStops');
        }
    }, []); // Runs once when the screen loads

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

            {/* Route Error Popup */}
            {routeErrorVisible && (
                <div className="loadingOverlay" role="alert">
                    <div className="loadingCard">
                        <div style={{ fontSize: '2rem' }}>⚠️</div>
                        <div className="loadingText">Unable to create a route with the given information.</div>
                        <div className="loadingText">Please change your trip details and try again.</div>
                        <button 
                            type="button" 
                            className="secondaryButton" 
                            onClick={() => setRouteErrorVisible(false)}
                            style={{ marginTop: '10px', width: '100%' }}
                        >
                            Close
                        </button>
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

            <section className="newTripCard" style={{minHeight:'227'}}>
                <h3>Time Window</h3>


                <div className="fieldGroup">
                    <label htmlFor="trip-date">Date</label>
                    {errorState?.target === 'date' ? (
                        <ErrorWrapper
                            message={errorState.message}
                            innerRef={dateErrorRef}
                            className="errorWrapper--field"
                        >
                            <div className="inputWithIcon">
                                <input id="trip-date" type="date" className="smallField" 
                                value={date} onChange={(e) => {
                                    const nextValue = e.target.value
                                    setDate(nextValue)
                                    if (nextValue.trim()) {
                                        setErrorState(null)
                                    }
                                }}/>
                            </div>
                        </ErrorWrapper>
                    ) : (
                        <div className="inputWithIcon">
                            <input id="trip-date" type="date" className="smallField" 
                            value={date} onChange={(e) => setDate(e.target.value)}/>
                        </div>
                    )}
                </div>

                <div className="fieldRow twoCol">
                    {isEntryTimeError ? (
                        <ErrorWrapper
                            message={errorState.message}
                            innerRef={entryTimeErrorRef}
                            className="errorWrapper--field errorWrapper--timeField"
                        >
                            <div className="fieldGroup">
                                <label htmlFor="entry-time">Entry Time</label>
                                <input
                                    id="entry-time"
                                    type="time"
                                    className="smallField timeField"
                                    value={entryTime}
                                    onChange={(e) => {
                                        const nextValue = e.target.value
                                        setEntryTime(nextValue)
                                        if (nextValue.trim()) {
                                            setErrorState(null)
                                        }
                                    }}
                                />
                            </div>
                        </ErrorWrapper>
                    ) : (
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
                    )}

                    {isExitTimeError ? (
                        <ErrorWrapper
                            message={errorState?.target === 'timeWindow' ? '' : errorState.message}
                            innerRef={exitTimeErrorRef}
                            className="errorWrapper--field errorWrapper--timeField"
                        >
                            <div className="fieldGroup">
                                <label htmlFor="exit-time">Exit Time</label>
                                <input
                                    id="exit-time"
                                    type="time"
                                    className="smallField timeField"
                                    value={exitTime}
                                    onChange={(e) => {
                                        const nextValue = e.target.value
                                        setExitTime(nextValue)
                                        if (nextValue.trim()) {
                                            setErrorState(null)
                                        }
                                    }}
                                />
                            </div>
                        </ErrorWrapper>
                    ) : (
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
                    )}
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
                            <StartEndPicker
                                value={startLocation}
                                onChange={(val) => {
                                    setStartLocation(val)
                                    if (val.trim() && errorState?.reason === 'missingStart') {
                                        setErrorState(null)
                                    }
                                }}
                                inputId="trip-start"
                                placeholder="Enter starting point"
                                allowNone={false}
                            />
                        </div>
                    </ErrorWrapper>
                ) : (
                    <div className="fieldGroup">
                        <label htmlFor="trip-start">Starting Location</label>
                        <StartEndPicker
                            value={startLocation}
                            onChange={setStartLocation}
                            inputId="trip-start"
                            placeholder="Enter starting point"
                            allowNone={false}
                        />
                    </div>
                )}

                <div className="fieldGroup">
                    <label htmlFor="trip-end">Ending Location</label>
                    <StartEndPicker
                        value={endLocation}
                        onChange={setEndLocation}
                        inputId="trip-end"
                        placeholder="Enter ending point"
                        allowNone={true}
                    />
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

            {/* Transit Types Selection Section */}
            <section className="newTripCard">
                <h3 className="transitTitle">Transit Types</h3>
                {errorState?.target === 'transitTypes' ? (
                    <ErrorWrapper
                        message={errorState.message}
                        innerRef={transitTypesErrorRef}
                        className="errorWrapper--field"
                    >
                        <div className="transitGroup">
                            {Object.keys(transitPreferences).map((type) => (
                                <label key={type} className="transitCard">
                                    <div className={`transitIcon transitIcon${type.charAt(0).toUpperCase() + type.slice(1)}`} />
                                    <span className="transitLabel">{type}</span>
                                    <input
                                        type="checkbox"
                                        className="transitCheckbox"
                                        checked={transitPreferences[type]}
                                        onChange={() => handleTransitChange(type)}
                                    />
                                </label>
                            ))}
                        </div>
                    </ErrorWrapper>
                ) : (
                    <div className="transitGroup">
                        {Object.keys(transitPreferences).map((type) => (
                            <label key={type} className="transitCard">
                                <div className={`transitIcon transitIcon${type.charAt(0).toUpperCase() + type.slice(1)}`} />

                                <span className="transitLabel">{type}</span>
                                <input
                                    type="checkbox"
                                    className="transitCheckbox"
                                    checked={transitPreferences[type]}
                                    onChange={() => handleTransitChange(type)}
                                />
                            </label>
                        ))}
                    </div>
                )}
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
           {message && <span className="errorWrapperLabel">{message}</span>}
            {children}
        </div>
    )
}

function StartEndPicker({ value, onChange, inputId, placeholder, allowNone }) {
    const presets = ['Penn Station', 'Grand Central Terminal']

    //if the current value isn't a preset and isn't empty, the user is in custom mode
    const [isCustom, setIsCustom] = useState(
        value !== '' && !presets.includes(value)
    )

    const handleSelectChange = (e) => {
        const selected = e.target.value

        if (selected === 'other') {
            setIsCustom(true)
            onChange('')
        } else if (selected === 'none') {
            setIsCustom(false)
            onChange('')
        } else {
            setIsCustom(false)
            onChange(selected)
        }
    }

    if (isCustom) {
        return (
            <div className="inputWithIcon">
                <input
                    id={inputId}
                    type="text"
                    className="smallField noZoomField"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    className="secondaryButton"
                    onClick={() => {
                        setIsCustom(false)
                        onChange(allowNone ? '' : 'Penn Station')
                    }}
                >
                    Back (change to svg)
                </button>
            </div>
        )
    }

    const currentSelection = value === '' ? 'none' : value

    return (
        <div className="selectWrapper">
            <select
                id={inputId}
                className="smallField noZoomField"
                value={currentSelection}
                onChange={handleSelectChange}
            >
                {allowNone && <option value="none">None</option>}
                {presets.map(preset => (
                    <option key={preset} value={preset}>{preset}</option>
                ))}
                <option value="other" style={{ color: '#a3a3a3' }} >Other...</option>
            </select>
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
                                onChange('location', `${val.name}, ${val.address}`); // Update the main form
                                setIsModalOpen(false);      // Close modal
                            }} 
                        />
                    )}

                    <div className="stopOptions">
                        <label className="checkboxItem">
                            <input
                                type="checkbox"
                                checked={data.optional}
                                onChange={(e) => onChange('optional', e.target.checked)}
                            />
                            Optional
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
                            min="5"
                            max="240"
                            step="5"
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
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    const hourText = h === 1 ? 'hour' : 'hours';
    const minuteText = m === 1 ? 'minute' : 'minutes';

    if (h > 0) {
        if (m > 0) {
            return `${h} ${hourText} ${m} ${minuteText}`;
        }
        return `${h} ${hourText}`;
    }

    return `${m} ${minuteText}`;
}

export default NewTripScreen;
