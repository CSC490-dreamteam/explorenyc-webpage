import '../../App.css'
import './HomeScreen.css'
import './components/TrendingCard.jsx'
import TrendingCard from "./components/TrendingCard.jsx";
import React, { useState, useEffect } from "react";
import RecommendationCard from './components/RecommendationCard.jsx';
import PlaceDetailsModal from './components/PlaceDetailsModal.jsx';
import Toast from './components/Toast.jsx';

function HomeScreen() {
    

    const [places, setPlaces] = useState([]); //Stores the list of recommended places returned from the API
    const [loading, setLoading] = useState(true); //Tracks whether the API request is still in progress
    const [error, setError] = useState(null); //Holds any error message if the API request fails
    const [randomTrending, setRandomTrending] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [toastConfig, setToastConfig] = useState({ show: false, message: '', type: '' });


    //The API call
    useEffect(() => {
        //we define an async function so we can use await inside useEffect
        async function fetchDiscover() {
            //make request to fastapi backend
            try {
                const res = await fetch(
                    "https://explorenyc-recommendation-testing.up.railway.app/discover-all"
                );
                //if the response is not OK status, throw an error
                if (!res.ok) {
                    throw new Error("Failed to fetch /discover-all");
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
                    "Ocp-Apim-Subscription-Key": "dca93bc1050e4756bc93900f7c54a2e9",
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
        const existingStops = JSON.parse(localStorage.getItem('pendingStops') || "[]");
        const currentDraft = JSON.parse(localStorage.getItem('active_trip_draft') || "[]");
        
        // 1. Normalize the address (Trending uses .address, Recommendations might vary)
        const placeAddress = place.address || "";
        const fullAddress = `${place.name}, ${placeAddress}`;

        // 2. CHECK: Is it a duplicate in EITHER the pending list or the active draft?
        // We trim and lowercase to ensure "Central Park" matches "central park "
        const isDuplicate = [...existingStops, ...currentDraft].some(s => 
            s.location.trim().toLowerCase() === fullAddress.trim().toLowerCase()
        );

        if (isDuplicate) {
            triggerToast(`${place.name} is already in your trip!`, 'error');
            setSelectedPlace(null);
            return;
        }

        // 3. Limit Check
        const totalStops = existingStops.length + currentDraft.length;
        if (totalStops >= 8) {
            triggerToast(`Stop limit reached!`, 'error');
            setSelectedPlace(null);
            return;
        }

        // 4. Success! Add it
        const newStop = { location: fullAddress, duration: 30, mandatory: false };
        localStorage.setItem('pendingStops', JSON.stringify([...existingStops, newStop]));
        
        triggerToast(`Added ${place.name} to your trip!`, 'success');
        setSelectedPlace(null);
    };


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
                            onClick={() => setSelectedPlace(place)}
                            />
                        ))
                }

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


        </div>
    )
}

export default HomeScreen