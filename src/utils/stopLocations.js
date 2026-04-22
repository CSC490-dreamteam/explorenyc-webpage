const KNOWN_STOP_ADDRESSES = {
    'penn station': '351 West 31st Street, New York, NY 10001',
    'penn station, new york': '351 West 31st Street, New York, NY 10001',
    'new york penn station': '351 West 31st Street, New York, NY 10001',
    'empire state building': '20 W 34th St., New York, NY 10001',
    'freedom tower': '117 West St, New York, NY 10007',
    'one world trade center': '117 West St, New York, NY 10007',
    'one wtc': '117 West St, New York, NY 10007',
    'moma': '11 W 53rd St, New York, NY 10019',
    'museum of modern art': '11 W 53rd St, New York, NY 10019',
    'chrysler building': '405 Lexington Ave, New York, NY 10174',
    'trump tower': '725 5th Ave, New York, NY 10022',
    'grand central terminal': '89 E 42nd St, New York, NY 10017',
    'grand central station': '89 E 42nd St, New York, NY 10017',
    'the metropolitan museum of art': '1000 5th Ave, New York, NY 10028',
    'metropolitan museum of art': '1000 5th Ave, New York, NY 10028',
    'the met': '1000 5th Ave, New York, NY 10028',
    'the vessel': '20 Hudson Yards, New York, NY 10001',
    'vessel': '20 Hudson Yards, New York, NY 10001',
    'times square': 'Broadway and 7th Ave, New York, NY 10036',
};

function normalizeStopName(value) {
    return typeof value === 'string'
        ? value.trim().toLowerCase().replace(/\s+/g, ' ')
        : '';
}

function getKnownStopAddress(location) {
    return KNOWN_STOP_ADDRESSES[normalizeStopName(location)] ?? '';
}

function fillKnownStopAddress(stop) {
    const location = typeof stop?.location === 'string' ? stop.location : ''
    const currentAddress = typeof stop?.address === 'string' ? stop.address : ''
    const knownAddress = getKnownStopAddress(location)

    return {
        ...stop,
        location,
        address: currentAddress || knownAddress,
    }
}

function createEmptyStop() {
    return {
        location: '',
        address: '',
        mandatory: false,
        flexible: false,
        timePreference: '',
    };
}

export {
    createEmptyStop,
    fillKnownStopAddress,
    getKnownStopAddress,
};
