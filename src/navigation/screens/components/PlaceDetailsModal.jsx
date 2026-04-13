import React from "react";
import "./PlaceDetailsModal.css";

function PlaceDetailsModal({ place, onClose, onAddToTrip }) {
    if (!place) return null;

    // Close modal if clicking the dark overlay background
    const handleOverlayClick = (e) => {
        if (e.target.className === "modal-overlay") {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content place-details-modal">
                
                {/* 1. New Top Image Section */}
                {place.img ? (
                    <div className="modal-image-header">
                        <img src={place.img} alt={place.name} className="modal-top-img" />
                        <button className="close-btn-overlay" onClick={onClose}>&times;</button>
                    </div>
                ) : (
                    <button className="close-btn" onClick={onClose}>&times;</button>
                )}

                <div className="modal-body-padding">
                    {/* Header - Only show icon if there's no top image */}
                    <div className="place-header">
                        {!place.img && (
                            <div className="place-icon">
                                <span className="icon-image" aria-hidden="true" />
                            </div>
                        )}
                        <h2 className="place-title">{place.name}</h2>
                        <p className="place-subtitle">
                            {place.category || place.place_type}
                        </p>
                    </div>

                    <div className="divider" />

                    {/* Info Sections
                    <div className="info-section">
                        <h4>Description</h4>
                        <p>{place.description || "No description available."}</p>
                    </div>*/}

                    <div className="info-section">
                        <h4>Address</h4>
                        <p>{place.address}</p>
                    </div>

                    {/* <div className="info-section">
                        <h4>Borough</h4>
                        <p>{place.boro}</p>
                    </div>*/}

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
        </div>
    );
}

export default PlaceDetailsModal;