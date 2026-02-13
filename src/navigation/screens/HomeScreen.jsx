import '../../App.css'
import './HomeScreen.css'
import React from "react";

function HomeScreen() {
    return (
        <div className="welcome-container">
            <header className="welcome-header">
                <h1>Welcome to ExploreNYC!</h1>
                <p>Your NYC adventure starts here</p>
                <button className="btn-primary">Create New Trip</button>
            </header>

            {/* “For You” Section (placeholders for now) */}
            <section className="for-you">
                <h2>For You</h2>
                <div className="card">⭐ Recommended Places</div>
                <div className="card">🗺 Popular Routes</div>
                <div className="card">🔥 Trending Spots</div>
            </section>
        </div>
    )
}

export default HomeScreen