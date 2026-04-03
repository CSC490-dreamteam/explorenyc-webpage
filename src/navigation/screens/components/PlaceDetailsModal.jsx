import React from "react";
import "./PlaceDetailsModal.css";

function PlaceDetailsModal({ place, onClose, onAddToTrip }) {
    if (!place) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content place-details-modal">

                <button className="close-btn" onClick={onClose}>&times;</button>

                {/* Header */}
                <div className="place-header">
                    <div className="place-icon">
                        <span className="icon-image" aria-hidden="true" />
                    </div>
                    <h2 className="place-title">{place.name}</h2>
                    <p className="place-subtitle">
                        {place.category || place.place_type}
                    </p>
                </div>

                <div className="divider" />

                {/* Info Sections */}
                <div className="info-section">
                    <h4>Description</h4>
                    <p>{place.description || "No description available."}</p>
                </div>

                <div className="info-section">
                    <h4>Address</h4>
                    <p>{place.address}</p>
                </div>

                <div className="info-section">
                    <h4>Borough</h4>
                    <p>{place.boro}</p>
                </div>

                <div className="divider" />

                {/* Action */}
                <button 
                    className="add-trip-btn"
                    onClick={() => onAddToTrip(place)}
                >
                    Add to Trip
                </button>

            </div>
        </div>
    );
}

export default PlaceDetailsModal;
