import React from "react";
import "./RecommendationCard.css";

function RecommendationCard({ place, loading, error }) {
  if (loading) {
    return (
      <div className="card skeleton-card">
        <div className="card-icon skeleton-icon"></div>

        <div className="card-content">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line category"></div>
          <div className="skeleton-line distance"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card error-card">
        <div className="card-content">
          <div className="error-text">Could not load this card</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-icon">
        <img
          src="src/assets/restaurant.svg"
          alt={place.DBA}
          className="icon-image"
        />
      </div>

      <div className="card-content">
        <div className="card-top">
          <h2 className="card-title">{place.DBA}</h2>
          <div className="card-rating">⭐ {place.GRADE}</div>
        </div>

        <div className="card-category">
          {place["CUISINE DESCRIPTION"]}
        </div>

        <div className="card-bottom">
          <div className="card-distance">
            {place.BUILDING} {place.STREET}, {place.ZIPCODE}
          </div>
        </div>
      </div>
    </div>
  );
}


export default RecommendationCard;
