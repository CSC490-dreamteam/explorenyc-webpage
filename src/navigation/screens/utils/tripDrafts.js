function parseStoredStops(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch (error) {
        console.warn(`Failed to parse ${key} from localStorage:`, error);
        return [];
    }
}

export function addPlaceToPendingTrip(place) {
    const existingStops = parseStoredStops("pendingStops");
    const currentDraft = parseStoredStops("active_trip_draft");

    const placeName = typeof place?.name === "string" && place.name.trim()
        ? place.name.trim()
        : "Unknown place";
    const placeAddress = typeof place?.address === "string" ? place.address.trim() : "";
    const fullAddress = placeAddress ? `${placeName}, ${placeAddress}` : placeName;

    const isDuplicate = [...existingStops, ...currentDraft].some((stop) =>
        typeof stop?.location === "string" &&
        stop.location.trim().toLowerCase() === fullAddress.trim().toLowerCase()
    );

    if (isDuplicate) {
        return {
            ok: false,
            message: `${placeName} is already in your trip!`,
            type: "error",
        };
    }

    const totalStops = existingStops.length + currentDraft.length;
    if (totalStops >= 8) {
        return {
            ok: false,
            message: "Stop limit reached!",
            type: "error",
        };
    }

    const newStop = {
        location: fullAddress,
        duration: 30,
        mandatory: false,
    };

    localStorage.setItem("pendingStops", JSON.stringify([...existingStops, newStop]));

    return {
        ok: true,
        message: `Added ${placeName} to your trip!`,
        type: "success",
    };
}
