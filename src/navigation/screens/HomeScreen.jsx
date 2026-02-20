import '../../App.css'
import './HomeScreen.css'
import React, { useState, useEffect } from "react";

function HomeScreen() {

    //create a "area" to store the places
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //The API call
    useEffect(() => {
        async function fetchDiscover() {
            try {
                const res = await fetch(
                    "http://127.0.0.1:8000/discover"
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch /discover");
                }

                const json = await res.json();
                setPlaces(json.data); //the API returns {count, data: []} therefore we want the 'data' array

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchDiscover();
    }, []);

    if (loading) return <div>Loading recommendations...</div>;
    if (error) return <div>Error: {error}</div>;



    return (
        <div className="welcome-container">
            <header className="welcome-header">

                <button className="btn-primary">
                        <div className="statistic">0<br />Trips</div>
                        <div className="statistic">0 <br />Places</div>
                        <div className="statistic">0 <br />Steps</div>
                </button>

            </header>
            


            {/* <div className="for-you">
                <h3 align='left'>Recommended for you</h3>
                <div className="card">Place info</div>
                <div className="card">Place info</div>
                <div className="card">Place info</div>
            </div> */}
            
            <div className="for-you">
                <h3 align="left">Recommended for you</h3>

                {places.map((place, idx) => (
                    <div key={idx} className="card">
                    <h4>{place.DBA}</h4>

                    <p><strong>Cuisine:</strong> {place["CUISINE DESCRIPTION"]}</p>
                    <p><strong>Borough:</strong> {place.BORO}</p>

                    <p>
                        <strong>Address:</strong>{" "}
                        {place.BUILDING} {place.STREET}, {place.ZIPCODE}
                    </p>

                    <p><strong>Grade:</strong> {place.GRADE}</p>
                    </div>
                ))}
            </div>






        </div>
    )
}

export default HomeScreen