import '../../App.css'
import './HomeScreen.css'
import React, { useState, useEffect } from "react";
import RecommendationCard from '../components/RecommendationCard';

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
                    "https://explorenyc-recommendation-service.onrender.com/discover"
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
    }, []); //end useEffect


    return (
        <div className="welcome-container">
            <header className="welcome-header">

                <button className="btn-primary">
                        <div className="statistic">0<br />Trips</div>
                        <div className="statistic">0 <br />Places</div>
                        <div className="statistic">0 <br />Steps</div>
                </button>

            </header>

            <div className="for-you">
                <h3 align="left">Recommended for you</h3>

                {loading
                    ? [1, 2, 3].map((n) => (
                        <RecommendationCard key={n} loading={true} />
                    ))
                    : places.map((place, idx) => (
                        <RecommendationCard
                        key={idx}
                        place={place}
                        loading={false}
                        error={error}
                        />
                    ))
                }
            </div>


        </div>
    )
}

export default HomeScreen