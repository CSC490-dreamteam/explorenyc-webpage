import '../../App.css'
import './HomeScreen.css'
import React from "react";

function HomeScreen() {
    return (
        <div className="welcome-container">
            <header className="welcome-header">

                <button className="btn-primary">
                        <div className="statistic">0<br />trips</div>
                        <div className="statistic">0 <br />places visited</div>
                        <div className="statistic">0 <br />steps</div>
                </button>

            </header>
            <section className="for-you">
                <h3 align='left'>Recommended for you</h3>
                <div className="card">Place info</div>
                <div className="card">Place info</div>
                <div className="card">Place info</div>
            </section>
        </div>
    )
}

export default HomeScreen