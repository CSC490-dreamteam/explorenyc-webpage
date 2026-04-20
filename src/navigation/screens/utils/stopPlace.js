export function formatAddress(address, fallbackLocation = "") {
    if (typeof address === "string" && address.trim()) {
        return address.trim();
    }

    if (address && typeof address === "object") {
        return [
            address.Street,
            address.City,
            address.State,
            address.ZipCode,
        ].filter(Boolean).join(", ") || fallbackLocation || "Address unavailable";
    }

    return fallbackLocation || "Address unavailable";
}

export function getStopName(stop, index) {
    return stop?.Name
        || stop?.name
        || stop?.Title
        || stop?.title
        || stop?.place_name
        || stop?.location
        || stop?.Location
        || `Stop ${index + 1}`;
}

export function getStopType(stop) {
    return stop?.PlaceType
        || stop?.place_type
        || stop?.Type
        || stop?.type
        || "Stop";
}

export function getStopDescription(stop) {
    return stop?.Description
        || stop?.description
        || stop?.Summary
        || stop?.summary
        || "";
}

export function getStopBorough(stop) {
    return stop?.Address?.Borough
        || stop?.Address?.Boro
        || stop?.Borough
        || stop?.boro
        || stop?.borough
        || "Borough unavailable";
}

export function parseCoordinate(value) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function getStopLatitude(stop) {
    return parseCoordinate(
        stop?.Lat
        ?? stop?.lat
        ?? stop?.Latitude
        ?? stop?.latitude
        ?? stop?.Address?.Lat
        ?? stop?.Address?.lat
        ?? stop?.Address?.Latitude
        ?? stop?.Address?.latitude
    );
}

export function getStopLongitude(stop) {
    return parseCoordinate(
        stop?.Lon
        ?? stop?.lon
        ?? stop?.Lng
        ?? stop?.lng
        ?? stop?.Long
        ?? stop?.longitude
        ?? stop?.Address?.Lon
        ?? stop?.Address?.lon
        ?? stop?.Address?.Lng
        ?? stop?.Address?.lng
        ?? stop?.Address?.Long
        ?? stop?.Address?.longitude
    );
}

export function normalizeStopToPlace(stop, index, tripId) {
    const fallbackLocation = typeof stop?.location === "string"
        ? stop.location.trim()
        : typeof stop?.Location === "string"
            ? stop.Location.trim()
            : "";

    return {
        id: stop?.id ?? `${tripId ?? "trip"}-${index}`,
        name: getStopName(stop, index),
        place_type: getStopType(stop),
        category: stop?.Category
            || stop?.category
            || stop?.PlaceType
            || stop?.place_type
            || "Trip stop",
        description: getStopDescription(stop),
        address: formatAddress(stop?.Address, fallbackLocation),
        boro: getStopBorough(stop),
        latitude: getStopLatitude(stop),
        longitude: getStopLongitude(stop),
        img: stop?.img || stop?.image || stop?.Image || stop?.photo || stop?.Photo || "",
    };
}

export function getStopMapMarker(stop, index) {
    const latitude = getStopLatitude(stop);
    const longitude = getStopLongitude(stop);

    if (latitude === null || longitude === null) {
        return null;
    }

    return {
        id: stop?.id ?? `${stop?.Name ?? stop?.name ?? "stop"}-${index}`,
        latitude,
        longitude,
        label: index + 1,
        name: getStopName(stop, index),
    };
}
