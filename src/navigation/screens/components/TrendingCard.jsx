import React from "react";
import './TrendingCard.css'

const TrendingCard = ({ image, title }) => {
    return (
        <div className="trending_card">
            <div className="trending_card_image_container">
                <img src={image}/>
            </div>
            <div style={{paddingTop:'5px'}}>
                <label style={{padding: '10px'}}> {title} </label>
                <br/>
                <label style={{padding: '10px'}}>
                    ⭐️ 4.6
                </label>
                <br/>
                <label style={{padding: '10px'}}>
                    🔥+125% visits
                </label>
                <label style={{padding: '2px'}}>
                    📈2.5k Today
                </label>
            </div>
        </div>
    )
}
export default TrendingCard;