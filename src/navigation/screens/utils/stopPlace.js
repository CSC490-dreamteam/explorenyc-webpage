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


export function formatArrivalTime(minutesFromMidnight) {
    if (minutesFromMidnight === undefined) return null;
    const hours = Math.floor(minutesFromMidnight / 60);
    const mins = minutesFromMidnight % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function formatTimeRange(arrivalMinutes, departureMinutes) {
    if (arrivalMinutes === undefined) return null;
    
    const arrivalStr = formatArrivalTime(arrivalMinutes);
    
    //if departure is the same as arrival, just show arrival
    if (departureMinutes === undefined || departureMinutes === arrivalMinutes) {
        return arrivalStr;
    }

    return `${arrivalStr} - ${formatArrivalTime(departureMinutes)}`;
}

export function formatDuration(minutes) {
    if (minutes === 0 || !minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
}