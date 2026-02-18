import '../../App.css'
import './HomeScreen.css'
import React from "react";

function HomeScreen() {
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
                <h3 align='left'>Recommended for you</h3>
                <div className="forYouCard">Place info</div>
                <div className="forYouCard">Place info</div>
                <div className="forYouCard">Place info</div>
            </div>
        </div>
    )
}

export default HomeScreen