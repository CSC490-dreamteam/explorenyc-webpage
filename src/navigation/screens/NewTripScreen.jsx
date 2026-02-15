import React from 'react';
import './NewTripScreen.css';

function NewTripScreen() {
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
                <input type="text" className="smallField" />
            <br/>

            <br />
            <label><input type="checkbox" /> Mandatory</label><br />
            <label><input type="checkbox" /> Flexible</label><br /><br />

            <div style={{display: 'flex', alignItems: 'center'}}>
                <label>Time preference?</label>
                <input type="time" className="smallField" />
            </div>

            <div className='spacer'>
                <button>+ Add an Additional Stop</button>
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

            <button className="generateButton">Generate My Trip</button>

        </div>
    );
}

export default NewTripScreen;