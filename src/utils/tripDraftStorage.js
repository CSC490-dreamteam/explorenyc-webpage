import { createEmptyStop, fillKnownStopAddress, getKnownStopAddress } from './stopLocations';

const TRIP_DRAFT_STORAGE_KEY = 'explorenyc.tripDraft';

const defaultTripDraft = {
    tripName: '',
    date: '',
    entryTime: '',
    exitTime: '',
    startLocation: '',
    startAddress: '',
    endLocation: '',
    endAddress: '',
    stops: [createEmptyStop()],
    transitTypes: {
        subway: false,
        car: false,
        walking: false,
        uber: false,
    },
    bufferMinutes: 0,
};

function sanitizeStops(stops) {
    if (!Array.isArray(stops) || stops.length === 0) {
        return defaultTripDraft.stops;
    }

    return stops.map((stop) => ({
        ...fillKnownStopAddress(stop),
        mandatory: Boolean(stop?.mandatory),
        flexible: Boolean(stop?.flexible),
        timePreference: typeof stop?.timePreference === 'string' ? stop.timePreference : '',
    }));
}

function sanitizeTransitTypes(transitTypes) {
    return {
        subway: Boolean(transitTypes?.subway),
        car: Boolean(transitTypes?.car),
        walking: Boolean(transitTypes?.walking),
        uber: Boolean(transitTypes?.uber),
    };
}

function sanitizeTripDraft(value) {
    return {
        tripName: typeof value?.tripName === 'string' ? value.tripName : '',
        date: typeof value?.date === 'string' ? value.date : '',
        entryTime: typeof value?.entryTime === 'string' ? value.entryTime : '',
        exitTime: typeof value?.exitTime === 'string' ? value.exitTime : '',
        startLocation: typeof value?.startLocation === 'string' ? value.startLocation : '',
        startAddress: typeof value?.startAddress === 'string'
            ? value.startAddress
            : getKnownStopAddress(typeof value?.startLocation === 'string' ? value.startLocation : ''),
        endLocation: typeof value?.endLocation === 'string' ? value.endLocation : '',
        endAddress: typeof value?.endAddress === 'string'
            ? value.endAddress
            : getKnownStopAddress(typeof value?.endLocation === 'string' ? value.endLocation : ''),
        stops: sanitizeStops(value?.stops),
        transitTypes: sanitizeTransitTypes(value?.transitTypes),
        bufferMinutes: Number.isFinite(value?.bufferMinutes) ? value.bufferMinutes : 0,
    };
}

function readTripDraft() {
    if (typeof window === 'undefined') {
        return defaultTripDraft;
    }

    try {
        const rawValue = window.localStorage.getItem(TRIP_DRAFT_STORAGE_KEY);
        if (!rawValue) {
            return defaultTripDraft;
        }

        return sanitizeTripDraft(JSON.parse(rawValue));
    } catch (error) {
        console.error('Failed to read trip draft from localStorage:', error);
        return defaultTripDraft;
    }
}

function writeTripDraft(draft) {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(
            TRIP_DRAFT_STORAGE_KEY,
            JSON.stringify(sanitizeTripDraft(draft)),
        );
    } catch (error) {
        console.error('Failed to write trip draft to localStorage:', error);
    }
}

function createTripDraftFromAiPayload(payload) {
    return sanitizeTripDraft({
        tripName: payload?.tripName,
        date: payload?.date,
        entryTime: payload?.entryTime,
        exitTime: payload?.exitTime,
        startLocation: payload?.startLocation,
        startAddress: payload?.startAddress ?? getKnownStopAddress(payload?.startLocation ?? ''),
        endLocation: payload?.endLocation,
        endAddress: payload?.endAddress ?? getKnownStopAddress(payload?.endLocation ?? ''),
        stops: Array.isArray(payload?.stops)
            ? payload.stops.map((stop) => ({
                location: stop?.location ?? '',
                address: stop?.address ?? getKnownStopAddress(stop?.location ?? ''),
                mandatory: !Boolean(stop?.optional),
                flexible: Boolean(stop?.optional),
                timePreference: stop?.timePreference ?? '',
            }))
            : defaultTripDraft.stops,
        transitTypes: {
            subway: Boolean(payload?.transitTypes?.subway),
            car: Boolean(payload?.transitTypes?.car),
            walking: Boolean(payload?.transitTypes?.walking),
            uber: false,
        },
    });
}

export {
    TRIP_DRAFT_STORAGE_KEY,
    defaultTripDraft,
    readTripDraft,
    writeTripDraft,
    createTripDraftFromAiPayload,
};
