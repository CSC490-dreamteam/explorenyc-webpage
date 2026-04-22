import React, {useEffect, useRef, useState} from 'react';
import './NewTripScreen.css';
import SearchModal from './components/SearchModal';
import { defaultTripDraft, readTripDraft, writeTripDraft } from '../../utils/tripDraftStorage';
import { createEmptyStop, getKnownStopAddress } from '../../utils/stopLocations';

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

const splitLocationAddress = (value) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : ''
    if (!trimmedValue) {
        return { location: '', address: '' }
    }

    const separatorIndex = trimmedValue.indexOf(',')
    if (separatorIndex === -1) {
        return { location: trimmedValue, address: '' }
    }

    return {
        location: trimmedValue.slice(0, separatorIndex).trim(),
        address: trimmedValue.slice(separatorIndex + 1).trim(),
    }
}

const joinLocationAddress = (location, address) => {
    const trimmedLocation = typeof location === 'string' ? location.trim() : ''
    const trimmedAddress = typeof address === 'string' ? address.trim() : ''

    return [trimmedLocation, trimmedAddress].filter(Boolean).join(', ')
}

function NewTripScreen() {
    const initialDraft = readTripDraft()
    const [bufferMinutes, setBufferMinutes] = useState(initialDraft.bufferMinutes ?? defaultTripDraft.bufferMinutes)
    const [isLoading, setIsLoading] = useState(false)
    const [startLocation, setStartLocation] = useState(initialDraft.startLocation)
    const [startAddress, setStartAddress] = useState(initialDraft.startAddress)
    const [errorState, setErrorState] = useState(null)
    const [endLocation, setEndLocation] = useState(initialDraft.endLocation)
    const [endAddress, setEndAddress] = useState(initialDraft.endAddress)
    const [tripName, setTripName] = useState(initialDraft.tripName)
    const [tripDate, setTripDate] = useState(initialDraft.date)
    const [entryTime, setEntryTime] = useState(initialDraft.entryTime)
    const [exitTime, setExitTime] = useState(initialDraft.exitTime)
    const [transitTypes, setTransitTypes] = useState(initialDraft.transitTypes)
    const [stops, setStops] = useState(initialDraft.stops)

    const addStopErrorRef = useRef(null)
    const startPointErrorRef = useRef(null)
    const baseMaxStops = 8

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

        const popup = window.open('about:blank', '_blank')
        const tripData = {
            locations: stops.map((stop) => stop.location)
        }

        console.log(tripData)

        setErrorState(null)
        setIsLoading(true)
        try {
            const response = await fetch('https://explorenyc-backend-testing.up.railway.app/GenerateRoute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': 'sauce1234'
                },
                body: JSON.stringify(tripData)
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const responseData = await response.json()

            if (popup && !popup.closed) {
                popup.location = responseData.url
                if (popup.opener) {
                    popup.opener = null
                }
            } else {
                window.location.assign(responseData.url)
            }
        } catch (error) {
            console.error('Error submitting trip data:', error)
            if (popup && !popup.closed) {
                popup.close()
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleStopChange = (index, field, value) => {
        const newStops = [...stops]
        const nextStop = {
            ...newStops[index],
            [field]: value,
        }

        if (field === 'location') {
            const knownAddress = getKnownStopAddress(value)
            if (!nextStop.address.trim() || knownAddress) {
                nextStop.address = knownAddress
            }
        }

        newStops[index] = nextStop
        setStops(newStops)
    }

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

        setStops([...stops, createEmptyStop()])
        if (errorState?.reason === 'minStops') {
            setErrorState(null)
        }
    }

    const removeStop = (indexToRemove) => {
        setStops(stops.filter((_, index) => index !== indexToRemove))
    }

    useEffect(() => {
        const nextDraft = {
            tripName,
            date: tripDate,
            entryTime,
            exitTime,
            startLocation,
            startAddress,
            endLocation,
            endAddress,
            stops,
            transitTypes,
            bufferMinutes,
        }

        writeTripDraft(nextDraft)
    }, [bufferMinutes, endAddress, endLocation, entryTime, exitTime, startAddress, startLocation, stops, transitTypes, tripDate, tripName])

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

    const handleStartLocationChange = (nextValue) => {
        const { location, address } = splitLocationAddress(nextValue)
        const knownAddress = getKnownStopAddress(location)

        setStartLocation(location)
        setStartAddress(address || knownAddress)
    }

    const handleEndLocationChange = (nextValue) => {
        const { location, address } = splitLocationAddress(nextValue)
        const knownAddress = getKnownStopAddress(location)

        setEndLocation(location)
        setEndAddress(address || knownAddress)
    }

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
                            <label htmlFor="trip-start">Location</label>
                            <div className="inputWithIcon">
                                <input
                                    id="trip-start"
                                    type="text"
                                    className="smallField noZoomField"
                                    placeholder="Enter location, address"
                                    value={joinLocationAddress(startLocation, startAddress)}
                                    onChange={(e) => {
                                        const nextValue = e.target.value
                                        handleStartLocationChange(nextValue)
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
                        <label htmlFor="trip-start">Location</label>
                        <div className="inputWithIcon">
                            <input
                                id="trip-start"
                                type="text"
                                className="smallField noZoomField"
                                placeholder="Enter location, address"
                                value={joinLocationAddress(startLocation, startAddress)}
                                onChange={(e) => handleStartLocationChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="fieldGroup">
                    <label htmlFor="trip-end">Location</label>
                    <div className="inputWithIcon">
                        <input
                            id="trip-end"
                            type="text"
                            className="smallField noZoomField"
                            placeholder="Enter location, address"
                            value={joinLocationAddress(endLocation, endAddress)}
                            onChange={(e) => handleEndLocationChange(e.target.value)}
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
                    {stops.map((stop, index) => (
                        <StopEntryBlock
                            key={index}
                            index={index}
                            data={stop}
                            stopCount={stops.length}
                            onChange={(field, value) => handleStopChange(index, field, value)}
                            onDelete={() => removeStop(index)}
                        />
                    ))}
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
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const stopAddress = data.address?.trim() ?? ''
    const stopSummary = [data.location.trim(), stopAddress].filter(Boolean).join(', ')
    const stopFieldValue = joinLocationAddress(data.location, data.address)

    const handleStopLocationFieldChange = (nextValue) => {
        const { location, address } = splitLocationAddress(nextValue)
        const knownAddress = getKnownStopAddress(location)

        onChange('location', location)
        onChange('address', address || knownAddress)
    }

    return (
        <div className={`stopCard ${isCollapsed ? 'stopCardCollapsed' : ''}`}>
            <div className="stopCardHeader">
                <h4>
                    {`Stop ${index + 1}`}

                    {data.location.trim() && isCollapsed && (
                        <span className="stopCardLocationLabel">
                            {stopSummary}
                        </span>
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
                            X
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
                            value={stopFieldValue}
                            onChange={(e) => handleStopLocationFieldChange(e.target.value)}
                            placeholder="e.g. Central Park, New York, NY 10022"
                        />
                    </div>

                    {isModalOpen && (
                        <SearchModal
                            onClose={() => setIsModalOpen(false)}
                            onSelect={(selectedStop) => {
                                onChange('location', selectedStop.location)
                                onChange('address', selectedStop.address ?? getKnownStopAddress(selectedStop.location))
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
                    {isCollapsed ? 'v' : '^'}
                </button>
            </div>
        </div>

    );
}

export default NewTripScreen;
