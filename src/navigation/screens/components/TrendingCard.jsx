import React from "react";
import './TrendingCard.css'

const TrendingCard = ({ image, title, date, time, boro, onClick }) => {
    return (
        <div className="trending_card" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="trending_card_image_container">
                <img src={image}/>
            </div>
            <div className="trending_card_content">
                <label className="trending_card_title">{title}</label>
                
                <div className="trending_card_datetime">
                    <span>📅 {date}</span>
                    <span className="datetime_spacer">⏰ {time}</span>
                </div>

                <div className="trending_card_location">
                    <span className="boro_badge">📍 {boro}</span>
                </div>
            </div>
        </div>
    )
}
export default TrendingCard;