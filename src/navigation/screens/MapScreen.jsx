import '../../App.css'
import React from "react"
import 'mapbox-gl/dist/mapbox-gl.css'
import Map from 'react-map-gl/mapbox';
import mapStyleJson from '../../assets/dark_manhattan.json';

function MapScreen({ embedded = false }) {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

    const MANHATTAN_BOUNDS = [
        [-74.047285, 40.679548], // Southwest coordinates
        [-73.907000, 40.882214]  // Northeast coordinates
    ];

    return (
        <div style={embedded ? { width: '100%', height: '100%' } : { width: '100vw', height: '100vh' }}>
            <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{
                    longitude: -73.985,
                    latitude: 40.748,
                    zoom: 12.5,
                }}
                maxBounds = {MANHATTAN_BOUNDS}
                minZoom = {1}
                style={{width:'100%', height:'100%'}}
                mapStyle={mapStyleJson}
            />
        </div>
    )
}

export default MapScreen
