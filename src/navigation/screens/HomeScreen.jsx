import '../../App.css'
import './HomeScreen.css'
import './components/TrendingCard.jsx'
import React from "react";
import TrendingCard from "./components/TrendingCard.jsx";

function HomeScreen() {
    const trendingSpots = [
        {id: 1, name: "New York",img:"/public/new-york-city.jpeg"},
        {id: 2, name: "New York",img:"/public/new-york-city.jpeg"},
        {id: 3, name: "New York",img:"/public/new-york-city.jpeg"},
    ]
    return (
        <div className="welcome-container">
            <header className="welcome-header">

                <button className="btn-primary">
                        <div className="statistic">0<br />Trips</div>
                        <div className="statistic">0 <br />Places</div>
                        <div className="statistic">0 <br />Steps</div>
                </button>

            </header>
            <div className="trending">
                <h3 align='left'>🔥 Trending spots</h3>
                <div className="trending_container">

                    {trendingSpots.map((spot) => (<TrendingCard image={spot.img} key={spot.id} title={spot.name} />))}

                </div>

            </div>
            <div className="for-you">
                <h3 align='left'>Recommended for you</h3>

                <div className="forYouCard">Place info</div>
                <div className="forYouCard">Place info</div>
                <div className="forYouCard">Place info</div>
            </div>
        </div>
    )
}

export default HomeScreen