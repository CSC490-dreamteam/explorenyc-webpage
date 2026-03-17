import React, { useState } from 'react';
import "./SearchModal.css";

function SearchModal({ onClose, onSelect }) {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {

        setHasSearched(true);

        console.log("search button clicked")
        if (!searchText) {
            console.log("no search text")
            return;
        } 
        console.log("sending request to backend with: ", searchText)
        try {
            //const response = await fetch(`https://explorenyc-recommendation-service.onrender.com/recommend?user_text=${encodeURIComponent(searchText)}&top_k=5`);
            const response = await fetch(`http://127.0.0.1:8000/recommend-all?user_text=${encodeURIComponent(searchText)}&top_k=5`)

            const data = await response.json();
            
            console.log("received data:", data)

            setResults(data);
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h3>Find a Location</h3>
                <div className="modal-search-row">
                    <input 
                        type="text" 
                        placeholder="Search for places to eat..." 
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <button type="button" onClick={handleSearch}>Search</button>
                </div>
                <ul className="modal-results">
                    {results.map((place, i) => (
                        <li key={i} onClick={() => onSelect(place.name)}>
                            <strong>{place.name}</strong>
                            <p>{place.address}</p>
                        </li>
                    ))}
                </ul>

                {hasSearched && results.length === 0 && (
                    <div className="no-results">No results found</div>
                )}

            </div>
        </div>
    );
}

export default SearchModal;
