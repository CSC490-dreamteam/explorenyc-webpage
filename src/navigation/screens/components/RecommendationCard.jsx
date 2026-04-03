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
        <span className="icon-image" aria-hidden="true" />
      </div>

      <div className="card-content">
        <div className="card-top">
          <h2 className="card-title">{place.name}</h2>
          <div className="card-rating">⭐ {"A"}</div>
        </div>

        <div className="card-category">
          {place.category || place.place_type}
        </div>

        <div className="card-bottom">
          <div className="card-distance">
            {place.address}, {place.boro}
          </div>
        </div>
      </div>
    </div>
  );
}


export default RecommendationCard;
