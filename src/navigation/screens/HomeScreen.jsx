import '../../App.css'
import './HomeScreen.css'
import './components/TrendingCard.jsx'
import TrendingCard from "./components/TrendingCard.jsx";
import React, { useState, useEffect } from "react";
import RecommendationCard from './components/RecommendationCard.jsx';

function HomeScreen() {
    
    const trendingSpots = [
        {
            id: 1,
            name: "Central Park",
            place_type: "Park",
            category: "Nature",
            description: "A massive urban park offering trails, lakes, and iconic NYC scenery.",
            tags: ["outdoors", "family-friendly", "nature"],
            address: "Central Park, New York, NY",
            boro: "Manhattan",
            latitude: 40.785091,
            longitude: -73.968285,
            img: "/images/trending/central-park.jpeg"
        },
        {
            id: 2,
            name: "Brooklyn Bridge",
            place_type: "Landmark",
            category: "Historic",
            description: "A world-famous bridge connecting Manhattan and Brooklyn.",
            tags: ["historic", "views", "walking"],
            address: "Brooklyn Bridge, New York, NY",
            boro: "Manhattan/Brooklyn",
            latitude: 40.706086,
            longitude: -73.996864,
            img: "/images/trending/brooklyn-bridge.jpeg"
        },
        {
            id: 3,
            name: "Times Square",
            place_type: "Attraction",
            category: "Entertainment",
            description: "Bright lights, Broadway shows, and the heart of NYC nightlife.",
            tags: ["tourist", "nightlife", "shopping"],
            address: "Times Square, New York, NY",
            boro: "Manhattan",
            latitude: 40.758896,
            longitude: -73.985130,
            img: "/images/trending/times-square.jpeg"
        },
        {
            id: 4,
            name: "The Metropolitan Museum of Art",
            place_type: "Museum",
            category: "Art",
            description: "One of the world’s largest and finest art museums.",
            tags: ["art", "culture", "history"],
            address: "1000 5th Ave, New York, NY 10028",
            boro: "Manhattan",
            latitude: 40.779437,
            longitude: -73.963244,
            img: "/images/trending/met-museum.jpeg"
        },
        {
            id: 5,
            name: "The High Line",
            place_type: "Park",
            category: "Urban",
            description: "An elevated park built on a historic freight rail line.",
            tags: ["walking", "views", "urban"],
            address: "High Line, New York, NY",
            boro: "Manhattan",
            latitude: 40.7480,
            longitude: -74.0048,
            img: "/images/trending/high-line.jpeg"
        },
        {
            id: 6,
            name: "Coney Island Boardwalk",
            place_type: "Attraction",
            category: "Beach",
            description: "A lively beachfront area with rides, food, and ocean views.",
            tags: ["beach", "family-friendly", "rides"],
            address: "Coney Island, Brooklyn, NY",
            boro: "Brooklyn",
            latitude: 40.574926,
            longitude: -73.985941,
            img: "/images/trending/coney-island.jpeg"
        },
        {
            id: 7,
            name: "The Vessel",
            place_type: "Landmark",
            category: "Architecture",
            description: "A honeycomb-like structure offering unique views of Hudson Yards.",
            tags: ["architecture", "views", "modern"],
            address: "20 Hudson Yards, New York, NY 10001",
            boro: "Manhattan",
            latitude: 40.753826,
            longitude: -74.001648,
            img: "/images/trending/vessel.jpeg"
        },
        {
            id: 8,
            name: "Prospect Park",
            place_type: "Park",
            category: "Nature",
            description: "Brooklyn’s flagship park with lakes, trails, and open fields.",
            tags: ["nature", "walking", "family-friendly"],
            address: "Prospect Park, Brooklyn, NY",
            boro: "Brooklyn",
            latitude: 40.660204,
            longitude: -73.968956,
            img: "/images/trending/prospect-park.jpeg"
        },
        {
            id: 9,
            name: "Grand Central Terminal",
            place_type: "Landmark",
            category: "Historic",
            description: "A historic train station known for its architecture and celestial ceiling.",
            tags: ["historic", "architecture", "shopping"],
            address: "89 E 42nd St, New York, NY 10017",
            boro: "Manhattan",
            latitude: 40.752726,
            longitude: -73.977229,
            img: "/images/trending/grand-central.jpeg"
        },
        {
            id: 10,
            name: "Flushing Meadows–Corona Park",
            place_type: "Park",
            category: "Recreation",
            description: "A massive Queens park home to the Unisphere and USTA Tennis Center.",
            tags: ["sports", "walking", "landmark"],
            address: "Flushing Meadows Corona Park, Queens, NY",
            boro: "Queens",
            latitude: 40.749824,
            longitude: -73.844437,
            img: "/images/trending/flushing-meadows.jpeg"
        }
    ];


  
    const [places, setPlaces] = useState([]); //Stores the list of recommended places returned from the API
    const [loading, setLoading] = useState(true); //Tracks whether the API request is still in progress
    const [error, setError] = useState(null); //Holds any error message if the API request fails
    const [randomTrending, setRandomTrending] = useState([]);

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

    useEffect(() => {
        //shuffle and pick three
        const shuffled = [...trendingSpots].sort(() => Math.random() - 0.5);
        setRandomTrending(shuffled.slice(0, 3));
    }, []);


    return (
        <div className="welcome-container">
            <header className="welcome-header">
                <div style={{ textAlign: "left" }}>
                <h2>Home</h2>
                <p>Discover new destinations</p>
                </div>

                <button className="btn-primary">
                        <div className="statistic">0<br />Trips</div>
                        <div className="statistic">0 <br />Places</div>
                        <div className="statistic">0 <br />Steps</div>
                </button>

            </header>
            
            <div className="trending">
                <h3 align='left'>🔥 Trending spots</h3>
                <div className="trending_container">

                    {randomTrending.map(place => (
                        <TrendingCard
                            key={place.id}
                            image={place.img}
                            title={place.name}
                            placeType={place.place_type}
                            category={place.category}
                            description={place.description}
                            tags={place.tags}
                            address={place.address}
                            boro={place.boro}
                            latitude={place.latitude}
                            longitude={place.longitude}
                        />
                    ))}


                </div>

            </div>
      
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