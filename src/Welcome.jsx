import React from "react";
import "./Welcome.css";

function Welcome() {
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

            {/* Bottom Nav */}
            <nav className="bottom-nav">
                <div className="nav-item active">🏠 Home</div>
                <div className="nav-item">🧳 Trips</div>
                <div className="nav-item">❤️ Saved</div>
                <div className="nav-item">👤 Profile</div>
            </nav>
        </div>
    );
}

export default Welcome;
