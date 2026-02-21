import '../../App.css'
import './HomeScreen.css'
import React, { useState, useEffect } from "react";
import RecommendationCard from '../components/RecommendationCard';

function HomeScreen() {

    const [places, setPlaces] = useState([]); //Stores the list of recommended places returned from the API
    const [loading, setLoading] = useState(true); //Tracks whether the API request is still in progress
    const [error, setError] = useState(null); //Holds any error message if the API request fails

    //The API call
    useEffect(() => {
        //we define an async function so we can use await inside useEffect
        async function fetchDiscover() {
            //make request to fastapi backend
            try {
                const res = await fetch(
                    "https://explorenyc-recommendation-service.onrender.com/discover"
                );
                //if the response is not OK status, throw an error
                if (!res.ok) {
                    throw new Error("Failed to fetch /discover");
                }
                //parse the JSON body of the response
                const json = await res.json();
                //the api returns { count, data: [...] }, so we store only the data array
                setPlaces(json.data); //the API returns {count, data: []} therefore we want the 'data' array

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false); //whether we get success or failure, the loading is now complete
            }
        }
        fetchDiscover(); //start fetching the data
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

                {
                    // If data is still loading, render 3 skeleton cards
                    loading
                        ? [1, 2, 3].map((n) => (
                            <RecommendationCard key={n} loading={true} />
                        ))
                        // Else, render the real recommendation cards
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