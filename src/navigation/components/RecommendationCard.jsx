import "./RecommendationCard.css";

function RecommendationCard({ place, loading, error }) {
  const name = place?.DBA ?? "Unknown place";
  const grade = place?.GRADE ?? "N/A";
  const cuisine = place?.["CUISINE DESCRIPTION"] ?? "Unknown cuisine";
  const address = [place?.BUILDING, place?.STREET, place?.ZIPCODE].filter(Boolean).join(" ");

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
          src="/restaurant.svg"
          alt={name}
          className="icon-image"
        />
      </div>

      <div className="card-content">
        <div className="card-top">
          <h2 className="card-title">{name}</h2>
          <div className="card-rating">⭐ {grade}</div>
        </div>

        <div className="card-category">
          {cuisine}
        </div>

        <div className="card-bottom">
          <div className="card-distance">
            {address || "Address unavailable"}
          </div>
        </div>
      </div>
    </div>
  );
}


export default RecommendationCard;
