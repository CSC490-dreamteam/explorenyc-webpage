import '../../App.css'
import './MapScreen.css'
import React, { useEffect, useMemo, useRef, useState } from "react"
import 'mapbox-gl/dist/mapbox-gl.css'
import polyline from '@mapbox/polyline';
import Map, { Layer, Marker, Source } from 'react-map-gl/mapbox';
import mapStyleJson from '../../assets/dark_nyc.json';
import learnMapGeoJsonUrl from '../../assets/explorenycfinal.geojson?url';
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

const learnMapFillLayer = {
    id: 'learn-map-fill',
    type: 'fill',
    paint: {
        'fill-color': '#2563eb',
        'fill-opacity': 0.32,
    },
};

const learnMapOutlineLayer = {
    id: 'learn-map-outline',
    type: 'line',
    paint: {
        'line-color': '#bfdbfe',
        'line-width': 1.8,
        'line-opacity': 0.95,
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

function flattenCoordinates(coordinates) {
    if (!Array.isArray(coordinates)) {
        return [];
    }

    if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
        return [coordinates];
    }

    return coordinates.flatMap(flattenCoordinates);
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

function MapScreen({ embedded = false, stops = [], mode = 'trip', onClose }) {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
    const mapRef = useRef(null);
    const [selectedStop, setSelectedStop] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [learnMapGeoJson, setLearnMapGeoJson] = useState(null);
    const isLearnMode = mode === 'learn';

    const NYC_BOUNDS = [
        [-74.255591, 40.496115],
        [-73.700009, 40.915533]
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

    useEffect(() => {
        if (!isLearnMode) {
            return;
        }

        let isActive = true;

        async function loadLearnMap() {
            try {
                const response = await fetch(learnMapGeoJsonUrl);
                const data = await response.json();

                if (isActive) {
                    setLearnMapGeoJson(data);
                }
            } catch (error) {
                console.error('Failed to load learn map GeoJSON:', error);
            }
        }

        loadLearnMap();

        return () => {
            isActive = false;
        };
    }, [isLearnMode]);

    const learnBounds = useMemo(() => {
        if (!learnMapGeoJson) {
            return null;
        }

        const coordinates = learnMapGeoJson.features.flatMap((feature) =>
            flattenCoordinates(feature?.geometry?.coordinates)
        );

        return buildBounds(coordinates);
    }, [learnMapGeoJson]);

    const combinedBounds = useMemo(() => {
        const routePoints = routeFeatures.flatMap((feature) => feature.geometry.coordinates);
        const stopCoordinates = stopPins.map(({ longitude, latitude }) => [longitude, latitude]);
        return buildBounds([...routePoints, ...stopCoordinates]);
    }, [routeFeatures, stopPins]);

    const activeBounds = isLearnMode ? learnBounds : combinedBounds;

    useEffect(() => {
        if (!mapRef.current || !activeBounds) {
            return;
        }

        mapRef.current.fitBounds(activeBounds, {
            padding: 40,
            duration: 0,
        });
    }, [activeBounds]);

    return (
        <div
            className={embedded ? 'map-screen map-screen--embedded' : 'map-screen map-screen--full'}
        >
            {isLearnMode && !embedded && typeof onClose === 'function' && (
                <button
                    type="button"
                    className="learn-map-close"
                    aria-label="Close map"
                    onClick={onClose}
                >
                    &times;
                </button>
            )}
            <Map
                ref={mapRef}
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{
                    longitude: -73.9778,
                    latitude: 40.7058,
                    zoom: 9.6,
                }}
                maxBounds = {NYC_BOUNDS}
                minZoom = {1}
                style={{width:'100%', height:'100%'}}
                mapStyle={mapStyleJson}
                interactiveLayerIds={isLearnMode ? ['learn-map-fill'] : undefined}
                onClick={(event) => {
                    if (!isLearnMode) {
                        return;
                    }

                    const clickedFeature = event.features?.find(
                        (feature) => feature.layer?.id === 'learn-map-fill'
                    );

                    if (!clickedFeature) {
                        return;
                    }

                    setSelectedRegion({
                        title: clickedFeature.properties?.borough || clickedFeature.properties?.name || 'NYC',
                        name: clickedFeature.properties?.name || '',
                        description: clickedFeature.properties?.description || 'No description available.',
                    });
                }}
                onLoad={() => {
                    if (activeBounds) {
                        mapRef.current?.fitBounds(activeBounds, {
                            padding: 40,
                            duration: 0,
                        });
                    }
                }}
            >
                {isLearnMode && learnMapGeoJson && (
                    <Source id="learn-map-source" type="geojson" data={learnMapGeoJson}>
                        <Layer {...learnMapFillLayer} />
                        <Layer {...learnMapOutlineLayer} />
                    </Source>
                )}
                {!isLearnMode && routeFeatures.length > 0 && (
                    <Source id="test-route-source" type="geojson" data={routeGeoJson}>
                        <Layer {...routeLayer} />
                    </Source>
                )}
                {!isLearnMode && stopPins.map((stop) => (
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

            {selectedStop && !isLearnMode && (
                <PlaceDetailsModal
                    place={selectedStop}
                    onClose={() => setSelectedStop(null)}
                    onAddToTrip={(place) => {
                        addPlaceToPendingTrip(place);
                        setSelectedStop(null);
                    }}
                />
            )}

            {selectedRegion && isLearnMode && (
                <div className="learn-map-popup" role="dialog" aria-modal="false">
                    <button
                        type="button"
                        className="learn-map-popup__close"
                        aria-label="Close description"
                        onClick={() => setSelectedRegion(null)}
                    >
                        &times;
                    </button>
                    <div className="learn-map-popup__body">
                        <h3>{selectedRegion.title}</h3>
                        {selectedRegion.name && selectedRegion.name !== selectedRegion.title && (
                            <p className="learn-map-popup__subtitle">{selectedRegion.name}</p>
                        )}
                        <p>{selectedRegion.description}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MapScreen
