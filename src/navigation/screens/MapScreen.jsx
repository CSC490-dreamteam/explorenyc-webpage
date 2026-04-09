import '../../App.css'
import React, { useEffect, useMemo, useRef, useState } from "react"
import 'mapbox-gl/dist/mapbox-gl.css'
import polyline from '@mapbox/polyline';
import Map, { Layer, Marker, Source } from 'react-map-gl/mapbox';
import mapStyleJson from '../../assets/dark_manhattan.json';
import PlaceDetailsModal from "./components/PlaceDetailsModal.jsx";
import { addPlaceToPendingTrip } from "./utils/tripDrafts.js";
import { getStopMapMarker, normalizeStopToPlace } from "./utils/stopPlace.js";

const routeLayer = {
    id: 'test-route',
    type: 'line',
    paint: {
        'line-color': [
            'match',
            ['get', 'transportType'],
            0, '#22c55e',
            1, '#ef4444',
            2, '#facc15',
            '#67e8f9',
        ],
        'line-width': 5,
        'line-opacity': 0.9,
    },
    layout: {
        'line-cap': 'round',
        'line-join': 'round',
    },
};

function buildBounds(points) {
    if (points.length === 0) {
        return null;
    }

    return points.reduce(
        (bounds, [longitude, latitude]) => [
            [Math.min(bounds[0][0], longitude), Math.min(bounds[0][1], latitude)],
            [Math.max(bounds[1][0], longitude), Math.max(bounds[1][1], latitude)],
        ],
        [
            [...points[0]],
            [...points[0]],
        ]
    );
}

function decodePolyline(encodedPolyline) {
    if (typeof encodedPolyline !== 'string' || encodedPolyline.length === 0) {
        return [];
    }

    try {
        return polyline
            .decode(encodedPolyline)
            .map(([latitude, longitude]) => [longitude, latitude]);
    } catch (error) {
        console.warn('Failed to decode polyline:', error);
        return [];
    }
}

function getRouteFeatures(stops) {
    return stops.flatMap((stop, stopIndex) => {
        const legs = Array.isArray(stop?.Legs) ? stop.Legs : [];

        return legs.flatMap((leg, legIndex) => {
            const polylines = Array.isArray(leg?.Polylines) ? leg.Polylines : [];

            return polylines
                .map((encodedPolyline, polylineIndex) => {
                    const coordinates = decodePolyline(encodedPolyline);

                    if (coordinates.length < 2) {
                        return null;
                    }

                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates,
                        },
                        properties: {
                            stopIndex,
                            legIndex,
                            polylineIndex,
                            transportType: leg?.TransportType ?? null,
                        },
                    };
                })
                .filter(Boolean);
        });
    });
}

function MapScreen({ embedded = false, stops = [] }) {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
    const mapRef = useRef(null);
    const [selectedStop, setSelectedStop] = useState(null);

    const MANHATTAN_BOUNDS = [
        [-74.047285, 40.679548], // Southwest coordinates
        [-73.907000, 40.882214]  // Northeast coordinates
    ];

    const stopPins = useMemo(
        () => stops
            .map((stop, index) => {
                const marker = getStopMapMarker(stop, index);

                if (!marker) {
                    return null;
                }

                return {
                    ...marker,
                    place: normalizeStopToPlace(stop, index, null),
                };
            })
            .filter(Boolean),
        [stops]
    );

    const routeFeatures = useMemo(() => getRouteFeatures(stops), [stops]);

    const routeGeoJson = useMemo(() => ({
        type: 'FeatureCollection',
        features: routeFeatures,
    }), [routeFeatures]);

    const combinedBounds = useMemo(() => {
        const routePoints = routeFeatures.flatMap((feature) => feature.geometry.coordinates);
        const stopCoordinates = stopPins.map(({ longitude, latitude }) => [longitude, latitude]);
        return buildBounds([...routePoints, ...stopCoordinates]);
    }, [routeFeatures, stopPins]);

    useEffect(() => {
        if (!mapRef.current || !combinedBounds) {
            return;
        }

        mapRef.current.fitBounds(combinedBounds, {
            padding: 40,
            duration: 0,
        });
    }, [combinedBounds]);

    return (
        <div style={embedded ? { width: '100%', height: '100%' } : { width: '100vw', height: '100vh' }}>
            <Map
                ref={mapRef}
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
                onLoad={() => {
                    if (combinedBounds) {
                        mapRef.current?.fitBounds(combinedBounds, {
                            padding: 40,
                            duration: 0,
                        });
                    }
                }}
            >
                {routeFeatures.length > 0 && (
                    <Source id="test-route-source" type="geojson" data={routeGeoJson}>
                        <Layer {...routeLayer} />
                    </Source>
                )}
                {stopPins.map((stop) => (
                        <Marker
                            key={stop.id}
                            longitude={stop.longitude}
                            latitude={stop.latitude}
                            anchor="bottom"
                        >
                            <button
                                type="button"
                                title={stop.name}
                                aria-label={`${stop.name}, stop ${stop.label}`}
                                onClick={() => setSelectedStop(stop.place)}
                                style={{
                                    position: 'relative',
                                    width: 30,
                                    height: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 28,
                                    lineHeight: 1,
                                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                }}
                            >
                                <span aria-hidden="true">📍</span>
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -8,
                                        minWidth: 16,
                                        height: 16,
                                        padding: '0 4px',
                                        borderRadius: 999,
                                        background: '#ffffff',
                                        color: '#111111',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        lineHeight: '16px',
                                        textAlign: 'center',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
                                    }}
                                >
                                    {stop.label}
                                </span>
                            </button>
                        </Marker>
                    ))}
            </Map>

            {selectedStop && (
                <PlaceDetailsModal
                    place={selectedStop}
                    onClose={() => setSelectedStop(null)}
                    onAddToTrip={(place) => {
                        addPlaceToPendingTrip(place);
                        setSelectedStop(null);
                    }}
                />
            )}
        </div>
    )
}

export default MapScreen
