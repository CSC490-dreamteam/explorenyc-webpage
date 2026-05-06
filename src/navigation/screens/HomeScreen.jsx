import '../../App.css'
import './HomeScreen.css'
import './components/TrendingCard.jsx'
import TrendingCard from "./components/TrendingCard.jsx";
import React, { useState, useEffect } from "react";
import RecommendationCard from './components/RecommendationCard.jsx';
import PlaceDetailsModal from './components/PlaceDetailsModal.jsx';
import Toast from './components/Toast.jsx';
import { addPlaceToPendingTrip } from './utils/tripDrafts.js';
import Auth from '../../auth';
import { calculateAllUserStats } from "./utils/statCrunching.js";

const nyc_env_var = import.meta.env.VITE_NYC_API_KEY;

function HomeScreen({ setCurrentScreen }) {
    

    const [places, setPlaces] = useState([]); //Stores the list of recommended places returned from the API
    const [loading, setLoading] = useState(true); //Tracks whether the API request is still in progress
    const [error, setError] = useState(null); //Holds any error message if the API request fails
    const [randomTrending, setRandomTrending] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [toastConfig, setToastConfig] = useState({ show: false, message: '', type: '' });
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const [userStats, setUserStats] = useState({
        totalWalkingMinutes: 0,
        tripCount: 0,
        uniqueStopsCount: 0
    });

    useEffect(() => {
        async function fetchUserStats() {
            try {
                const userId = Auth?.currentUserId; 
                const response = await fetch(
                    `https://explorenyc-recommendation-service-production.up.railway.app/get-user-stats/${userId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch user stats");
                }

                const data = await response.json();
                setUserStats(data);
            } catch (err) {
                console.error("Error fetching user stats:", err);
            }
        }

        fetchUserStats();
        console.log("Fetched user stats:", userStats);
    }, []); //runs once on mount

    useEffect(() => {
        async function fetchTailoredRecommendations() {
            setLoading(true);
            try {
                // Fetch user history (using ID 1 for now)
                const historyRes = await fetch(
                    "https://explorenyc-recommendation-service-production.up.railway.app/trip-stops?user_id=1"
                );
                const historyData = await historyRes.json();
                
                // Extract Location Titles from past trips
                // historyData.trips contains an array of trips, each having a 'stops' array
                const pastLocations = historyData.trips
                    ? historyData.trips.flatMap(trip => 
                        trip.stops ? trip.stops.map(stop => stop.name || stop.location) : []
                    )
                    : [];

                // Create a unique list and join them into a search string
                // Take the most recent 5-10 locations so the query isn't too long
                const recentLocations = [...new Set(pastLocations)].slice(0, 8).join(", ");
                
                //Determine the query History based or Default
                const searchQuery = recentLocations.length > 0 
                    ? `Places similar to ${recentLocations}` 
                    : "Top rated sights in New York City";

                //Fetch from the recommendation engine
                const recRes = await fetch(
                    `https://explorenyc-recommendation-service-production.up.railway.app/recommend-all-db?user_text=${encodeURIComponent(searchQuery)}&top_k=10`
                );
                
                if (!recRes.ok) throw new Error("Recommendation fetch failed");
                
                const data = await recRes.json();
                setPlaces(data);

            } catch (err) {
                console.error("Personalization Error:", err);
                setError(err.message);
                // Fallback to your original general fetch if the history fetch fails
                fetchGeneralDiscover();
            } finally {
                setLoading(false);
            }
        }

    async function fetchGeneralDiscover() {
        try {
            const res = await fetch("https://explorenyc-recommendation-service-production.up.railway.app/discover-all");
            const json = await res.json();
            setPlaces(json.data);
        } catch (e) {
            setError("Could not load any places.");
        }
    }

    fetchTailoredRecommendations();
    }, []);

    // useEffect(() => {
    //     //shuffle and pick three
    //     const shuffled = [...trendingSpots].sort(() => Math.random() - 0.5);
    //     setRandomTrending(shuffled.slice(0, 3));
    // }, []);


    // Fetch NYC Calendar API for Trending Spots 
    useEffect(() => {
    async function fetchNYCEvents() {
        try {
            const response = await fetch("https://api.nyc.gov/calendar/discover", {
                headers: {
                    "Ocp-Apim-Subscription-Key": nyc_env_var,
                    "Cache-Control": "no-cache"
                }
            });

            if (!response.ok) throw new Error("Failed to fetch NYC Events");

            const json = await response.json();
            
            // Access the .items array from the response
            const events = json.items || [];

            const BORO_MAP = {
                "Mn": "Manhattan",
                "Bk": "Brooklyn",
                "Qn": "Queens",
                "Bx": "Bronx",
                "Si": "Staten Island"
            };

            const formattedEvents = events.map(event => {
            //extract the code first
            const boroCode = event.boroughs && event.boroughs.length > 0 ? event.boroughs[0] : "";

            return {
                id: event.id,
                name: event.name,
                place_type: "Event",
                eventDate: event.datePart,
                eventTime: event.timePart,
                tags: event.categories ? event.categories.split(',') : [],
                category: event.categories ? event.categories.split(',')[1] : "Activity",
                description: event.desc ? event.desc.replace(/<[^>]*>/g, '').substring(0, 120) + "..." : "No description available.",
                address: event.address || event.location || "New York, NY",
                
                // use boroCode to find the full name
                boro: BORO_MAP[boroCode] || boroCode || "New York City", 
                
                latitude: event.geometry?.[0]?.lat,
                longitude: event.geometry?.[0]?.lng,
                img: event.imageUrl || "/images/trending/default-nyc.jpeg" 
            };
        });

            // Shuffle and pick 3
            const shuffled = [...formattedEvents].sort(() => Math.random() - 0.5);
            setRandomTrending(shuffled.slice(0, 5));

        } catch (err) {
            console.error("NYC API Error:", err);
            setError("Could not load trending events.");
        }
    }

    fetchNYCEvents();
}, []);

    const triggerToast = (message, type) => {
        setToastConfig({ show: true, message, type });
    };

    const handleAddToTrip = (place) => {
        const result = addPlaceToPendingTrip(place);
        triggerToast(result.message, result.type);
        setSelectedPlace(null);
    };

    useEffect(() => {
        const closeDropdown = () => setShowFilterDropdown(false);
        if (showFilterDropdown) {
            window.addEventListener('click', closeDropdown);
        }
        return () => window.removeEventListener('click', closeDropdown);
    }, [showFilterDropdown]);

    const handleFilterSelection = async (category) => {
        setLoading(true);
        setShowFilterDropdown(false); //close dropdown menu
        try {
            const response = await fetch(
                `https://explorenyc-recommendation-service-production.up.railway.app/discover-category?category=${encodeURIComponent(category)}&k=10`
            );
            const json = await response.json();
            setPlaces(json.data); //Update the 'Recommended for you' list
        } catch (err) {
            setError("Failed to filter places.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="welcome-container">
            <header className="welcome-header">
                <div style={{ textAlign: "left" }}>
                <h2>Home</h2>
                <p>Discover new destinations</p>
                </div>

                <button className="btn-primary">
                    <div className="statistic">
                        {userStats.tripCount} <br /> 
                        Trips Taken
                    </div>
                    <div className="statistic">
                        {userStats.totalWalkingMinutes} <br /> 
                        Mins Walked
                    </div>
                    <div className="statistic">
                        {userStats.uniqueStopsCount} <br /> 
                        Places Seen
                    </div>
                </button>

            </header>
            
            <div className="trending">
                <h3 align='left'>📅 Events & Activities</h3>
                <div className="trending_container">

                    {randomTrending.map(place => (
                        <TrendingCard
                            key={place.id}
                            image={place.img}
                            title={place.name}
                            place={place} //pass the whole place object to the modal has data
                            date={place.eventDate}
                            time={place.eventTime}
                            onClick={() => setSelectedPlace(place)} //set the click handler

                            
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
                <div className="section-header">
                    <h3 align="left">🎯 Recommended for you</h3>

                    <div className="dropdown-container">
                        <button 
                            className="three-dots-btn" 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowFilterDropdown(!showFilterDropdown);
                            }}
                        >
                                ⋮
                        </button>

                        {showFilterDropdown && (
                            <div className="filter-dropdown">
                                <div className="dropdown-item" onClick={() => handleFilterSelection('Park')}>
                                    <span>🌳</span> Park
                                </div>
                                <div className="dropdown-item" onClick={() => handleFilterSelection('Museum')}>
                                    <span>🏛️</span> Museum
                                </div>
                                <div className="dropdown-item" onClick={() => handleFilterSelection('Restaurant')}>
                                    <span>🍴</span> Restaurant
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="recommendation-vertical-slider">
                    {loading
                        ? [1, 2, 3].map((n) => (
                            <div className="v-slider-item" key={n}>
                                <RecommendationCard loading={true} />
                            </div>
                        ))
                        : places.map((place, idx) => (
                            <div className="v-slider-item" key={idx}>
                                <RecommendationCard
                                    place={place}
                                    loading={false}
                                    error={error}
                                    onClick={() => setSelectedPlace(place)}
                                />
                            </div>
                        ))
                    }
                </div>
            </div>

                {selectedPlace && (
                    <PlaceDetailsModal
                        place={selectedPlace}
                        onClose={() => setSelectedPlace(null)}
                        onAddToTrip={(place) => {
                            handleAddToTrip(place)
                            console.log("Add to trip:", place.name);
                            setSelectedPlace(null);
                        }}
                    />
                )}

            {/* Render the toast if state is true */}
            {toastConfig.show && (
                <Toast 
                    message={toastConfig.message} 
                    type={toastConfig.type} 
                    onClose={() => setToastConfig({ ...toastConfig, show: false })} 
                />
            )}

            <button
                className="learnButton"
                onClick={() => setCurrentScreen?.('LearnMapState')}
            >
                Learn More About NYC
            </button>
        </div>
    )
}

export default HomeScreen
