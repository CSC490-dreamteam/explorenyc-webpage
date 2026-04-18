import { getStopName, formatAddress } from "./stopPlace";

export function calculateTripWalkingTime(trip) {
    let totalMinutes = 0;

    //check for valid trip and stops
    if (!trip || !trip.stops) return 0;

    for (const stop of trip.stops) {
        //only process if legs exist
        if (stop.Legs && Array.isArray(stop.Legs)) {
            const legs = stop.Legs;
            for (let i = 0; i < legs.length; i++) {
                //look for walking legs
                if (legs[i].TransportType === 0) {
                    //check if sandwiched between two subway legs
                    const prevIsSubway = i > 0 && legs[i - 1].TransportType === 2;
                    const nextIsSubway = i < legs.length - 1 && legs[i + 1].TransportType === 2;

                    //skip only if it is a transfer (subway -> walk -> subway)
                    if (!(prevIsSubway && nextIsSubway)) {
                        totalMinutes += legs[i].TravelTimes || 0;
                    }
                }
            }
        }
    }

    return totalMinutes;
}

export function calculateAllTripsWalkingTimes(trips) {
    let totalWalkingMinutes = 0;

    //check for valid trips array
    if (!Array.isArray(trips)) return 0;

    const now = new Date();

    for (const trip of trips) {
        //only add walking time if trip exists and is in the past
        if (trip && trip.entry_datetime && new Date(trip.entry_datetime) < now) {
            totalWalkingMinutes += calculateTripWalkingTime(trip);
        }
    }

    return totalWalkingMinutes;
}

export function calculateTripCountandUniqueStops(trips) {
    if (!Array.isArray(trips)) return { tripCount: 0, uniqueStopsCount: 0 };
    let totalCompletedTrips = 0;
    const now = new Date();
    const uniqueStopsSet = new Set();

    //check for valid trips array

    for (const trip of trips) {
        //only process if trip exists and is in the past
        if (trip && trip.entry_datetime && new Date(trip.entry_datetime) < now) {
            totalCompletedTrips++;

            //process stops within this trip
            if (trip.stops && Array.isArray(trip.stops)) {
                trip.stops.forEach((stop, index) => {
                    //create unique identifier with fallback for missing name or address
                    const name = getStopName(stop, index);
                    const address = formatAddress(stop?.Address, "");
                    const stopKey = `${name} | ${address}`.trim();

                    //skip the fallback "Stop N" names so empty stops don't inflate the count
                    if (name && !/^Stop \d+$/.test(name) && stopKey !== "|") {
                        uniqueStopsSet.add(stopKey);
                    }
                });
            }
        }
    }

    return {
        tripCount: totalCompletedTrips,
        uniqueStopsCount: uniqueStopsSet.size
    };
}


export function calculateAllUserStats(userTripsObject) {
    //extract trips array safely from the object
    const trips = Array.isArray(userTripsObject) ? userTripsObject : (userTripsObject?.trips || []);

    //use existing function for total walking minutes
    const totalWalkingMinutes = calculateAllTripsWalkingTimes(trips);

    //use existing function for trip and stop counts
    const { tripCount, uniqueStopsCount } = calculateTripCountandUniqueStops(trips);

    const UserStats = {
        totalWalkingMinutes,
        tripCount,
        uniqueStopsCount
    };

    return UserStats;
}
