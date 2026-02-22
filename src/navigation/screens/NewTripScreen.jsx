import React, {useState} from 'react';
import './NewTripScreen.css';

function NewTripScreen() {

    //PLACEHOLDER
    const handleGenerateTripSubmit = async () => {
        //later this will have everyhting we throw to the backend for submission
        const tripData = {
            locations: stops.map(stop => stop.location)
        };
        console.log(tripData);

        try {
            const response = await fetch('https://explorenyc-backend-testing.up.railway.app/GenerateRoute', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': 'sauce1234'
                },
                body: JSON.stringify(tripData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log(responseData.url);
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
        <div className='content'>

            <h2>Trip Name</h2>
            <input type="text" className='bigField'/>

            <h3>Date</h3>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <label>🗓</label>
                <input type="date" className="smallField"/>
            </div>

            <h2>Start & End Destination</h2>
            <label>📍</label><input type="text" className="smallField" placeholder="Start location" /><br /><br />
            <label>📍</label><input type="text" className="smallField" placeholder="End location" />

            <h2>Entry & Exit Times</h2>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <input type="time" className="smallField" />
                <span>To</span>
                <input type="time" className="smallField" />
            </div>

            <h2>Stops</h2>
                {
                    stops.map((stop, index) => (
                        <StopEntryBlock 
                        key={index}
                        data={stop}
                        onChange={(field, value) => handleStopChange(index, field, value)}
                        />
                    ))
                }
            <div className='spacer'>
                
                <button onClick={addStop}>+ Add an Additional Stop</button>
            </div>

            <h2>Transportation</h2>

            <label><input type="checkbox" /> Subway</label>
            <label><input type="checkbox" /> Car</label>
            <div className='spacer' />
            <label><input type="checkbox" /> Walking</label>
            <label><input type="checkbox" /> Uber</label>


            <h2>Preferences</h2>
            <p><input type="checkbox" /> Avoid road tolls (?)</p>
            <p><input type="checkbox" /> Avoid Chain Restaurants (?)</p>
            <p><input type="checkbox" /> Place holder</p>
            <p><input type="checkbox" /> Place holder</p>

            <p>Minimum Buffer Between Stops</p>
            <input type="range" min="0" max="120" className='slider' />
            <label className="sliderLabel">minutes/hours</label>

            <button className="generateButton" onClick={handleGenerateTripSubmit}>Generate My Trip</button>

        </div>
    );
}

function StopEntryBlock({data, onChange}) {
    return ( <>

    {/* text box where user enters the location string */}
    <input type="text" 
    className="smallField" 
    value={data.location}
    onChange={(e) => onChange('location', e.target.value)}
    />
            <br/>
            <br />

            {/* mandatory checkbox */}
            <label><input type="checkbox" 
            checked={data.mandatory} 
            onChange={(e) => onChange('mandatory', e.target.checked)} /> Mandatory</label><br />


            {/* flexible checkbox */}
            <label><input type="checkbox" 
            checked={data.flexible} 
            onChange={(e) => onChange('flexible', e.target.checked)} /> Flexible</label><br /><br />


            {/* time preference picker */}
            <div style={{display: 'flex', alignItems: 'center'}}>
                <label>Time preference?</label>
                <input type="time" className="smallField" 
                value={data.timePreference} 
                onChange={(e) => onChange('timePreference', e.target.value)} />
            </div>

            {/* space between next component  */}
            <div className='spacer'></div>
        </> 
    )
}

export default NewTripScreen;