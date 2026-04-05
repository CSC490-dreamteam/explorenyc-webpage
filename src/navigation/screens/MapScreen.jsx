import '../../App.css'
import React, { useEffect, useMemo, useRef } from "react"
import 'mapbox-gl/dist/mapbox-gl.css'
import polyline from '@mapbox/polyline';
import Map, { Layer, Marker, Source } from 'react-map-gl/mapbox';
import mapStyleJson from '../../assets/dark_manhattan.json';

const routeLayer = {
    id: 'test-route',
    type: 'line',
    paint: {
        'line-color': '#67e8f9',
        'line-width': 5,
        'line-opacity': 0.9,
    },
    layout: {
        'line-cap': 'round',
        'line-join': 'round',
    },
};

function parseCoordinate(value) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getStopCoordinate(stop, index) {
    const latitude = parseCoordinate(stop?.Lat ?? stop?.Address?.Lat);
    const longitude = parseCoordinate(stop?.Lon ?? stop?.Address?.Lon);

    if (latitude === null || longitude === null) {
        return null;
    }

    return {
        id: stop?.id ?? `${stop?.Name ?? 'stop'}-${index}`,
        latitude,
        longitude,
        label: index + 1,
        name: stop?.Name || `Stop ${index + 1}`,
    };
}

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

    const MANHATTAN_BOUNDS = [
        [-74.047285, 40.679548], // Southwest coordinates
        [-73.907000, 40.882214]  // Northeast coordinates
    ];

    const stopMarkers = useMemo(
        () => stops
            .map((stop, index) => getStopCoordinate(stop, index))
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
        const stopCoordinates = stopMarkers.map(({ longitude, latitude }) => [longitude, latitude]);
        return buildBounds([...routePoints, ...stopCoordinates]);
    }, [routeFeatures, stopMarkers]);

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
                {stopMarkers.map((stop) => (
                    <Marker
                        key={stop.id}
                        longitude={stop.longitude}
                        latitude={stop.latitude}
                        anchor="bottom"
                    >
                        <div
                            title={stop.name}
                            aria-label={`${stop.name}, stop ${stop.label}`}
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
                        </div>
                    </Marker>
                ))}
            </Map>
        </div>
    )
}

export default MapScreen
