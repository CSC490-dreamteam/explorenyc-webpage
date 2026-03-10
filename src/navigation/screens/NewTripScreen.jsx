import React, {useState} from 'react';
import './NewTripScreen.css';

function NewTripScreen() {
    const [bufferTimeMinutes, setBufferTimeMinutes] = useState(0);

    const formatBufferTime = (minutes) => {
        const totalMinutes = Number(minutes);
        if (totalMinutes >= 120) {
            return '2 hours';
        }

        if (totalMinutes >= 60) {
            const remainingMinutes = totalMinutes - 60;
            const minuteLabel = remainingMinutes === 1 ? 'minute' : 'minutes';
            return `1 hour ${remainingMinutes} ${minuteLabel}`;
        }

        return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`;
    };

    //PLACEHOLDER
    const handleGenerateTripSubmit = async () => {
        //later this will have everything we throw to the backend for submission
        const tripData = {
            locations: stops.map(stop => stop.location)
        };
        console.log(tripData);

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
    const addStop = () => {
        setStops([...stops, { location: '', mandatory: false, flexible: false, timePreference: '' }]);
    };


    return (
        <div className='newTripPage'>
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
                        <span aria-hidden="true">🗓</span>
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
                <div className="fieldGroup">
                    <label htmlFor="trip-start">Starting Location</label>
                    <div className="inputWithIcon">
                        <span aria-hidden="true">📍</span>
                        <input id="trip-start" type="text" className="smallField noZoomField" placeholder="Enter starting point" />
                    </div>
                </div>

                <div className="fieldGroup">
                    <label htmlFor="trip-end">Ending Location</label>
                    <div className="inputWithIcon">
                        <span aria-hidden="true">📍</span>
                        <input id="trip-end" type="text" className="smallField noZoomField" placeholder="Enter ending point" />
                    </div>
                </div>
            </section>

            <section className="newTripCard">
                <div className="cardTitleRow">
                    <h3>Stops</h3>
                    <button type="button" className="secondaryButton" onClick={addStop}>
                        + Add Stop
                    </button>
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
                        value={bufferTimeMinutes}
                        onChange={(e) => setBufferTimeMinutes(Number(e.target.value))}
                        className="slider"
                    />
                    <label className="sliderLabel">{formatBufferTime(bufferTimeMinutes)}</label>
                </div>
            </section>

            <button type="button" className="generateButton" onClick={handleGenerateTripSubmit}>
                Generate My Trip
            </button>
        </div>
    );
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
