import { getStopLatitude, getStopLongitude, formatAddress, getStopName, formatArrivalTime, formatTimeRange } from "./stopPlace.js";

export function getGoogleMapsNavLink(originStop, destinationStop, transitType) {
  const travelModeMap = {
    0: "walking",
    1: "driving",
    2: "transit", //google doesnt support a direct subway url param
  };

  const origin = formatStopLocation(originStop, 0);
  const destination = formatStopLocation(destinationStop, 1);

  if (!origin || !destination) {
    console.warn("Missing origin or destination data for Google Maps link.");
    return "https://www.google.com/maps";
  }

  const travelmode = travelModeMap[transitType] || "walking";

  const params = new URLSearchParams({
    api: 1,
    origin: origin,
    destination: destination,
    travelmode: travelmode,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function getAppleMapsNavLink(originStop, destinationStop, transitType) {
  const travelModeMap = {
    0: "w", //walking
    1: "d", //driving
    2: "r", //transit
  };

  const origin = formatStopLocation(originStop, 0);
  const destination = formatStopLocation(destinationStop, 1);

  if (!origin || !destination) {
    console.warn("Missing origin or destination data for Apple Maps link.");
    return "https://maps.apple.com";
  }

  const dirflg = travelModeMap[transitType] || "w";

  //apple Maps uses saddr/daddr. Passing "Name, Address" lets Apple geocode the string and display the name nicely in the UI.
  const params = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    dirflg: dirflg,
  });

  return `https://maps.apple.com/?${params.toString()}`;
}


//sub function to format an individual stop
function formatStopLocation(stop, index) {
  const lat = getStopLatitude(stop);
  const lng = getStopLongitude(stop);
  const name = getStopName(stop, index);
  const address = formatAddress(stop?.Address);

  const hasValidName = name && name !== `Stop ${index + 1}`;
  const hasValidAddress = address && address !== "Address unavailable";
  const hasCoordinates = lat !== null && lng !== null;

  //best case: Name + Coordinates.
  //"Name@Lat,Lng" forces Google Maps to display the name but route using exact coordinates
  if (hasValidName && hasValidAddress) {
    return `${name}, ${address}`;
  }

  // fallback case: Address only
  if (hasValidAddress) {
    return address;
  }

  // fallback case: Lat, Lng only
  if (hasCoordinates) {
    return `${lat},${lng}`;
  }

  return "";
}


export function getGoogleCalendarLink(tripName, stops, entryDatetime) {
  if (!entryDatetime || !stops || stops.length === 0) {
    console.warn("Missing trip data for Google Calendar link.");
    return "https://www.google.com/calendar";
  }

  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];

  const startMinutes = firstStop.ArrivalTimeInMinutes ?? 0;
  const endMinutes =
    lastStop.DepartureTimeInMinutes ??
    lastStop.ArrivalTimeInMinutes ??
    startMinutes;

  //start date at midnight
  const baseDate = new Date(entryDatetime);
  baseDate.setHours(0, 0, 0, 0);

  //set start time to the date
  const startDate = new Date(baseDate);
  startDate.setMinutes(startMinutes);

  //set end time to the date
  const endDate = new Date(baseDate);
  endDate.setMinutes(endMinutes);

  //YYYYMMDDTHHmmSS format
  const formatDate = (date) => {
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}${mo}${d}T${h}${mi}${s}`;
  };

  const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;

  const stopList = stops
  .map((stop, index) => {
    const name = getStopName(stop, index) || `Stop ${index + 1}`;
    const timeRange = formatTimeRange(stop.ArrivalTimeInMinutes, stop.DepartureTimeInMinutes);
    return `• ${name}${timeRange ? ` (${timeRange})` : ""}`;
  })
  .join("\n");

  const details = `Here are your stops for this trip:\n\n${stopList}\n\nEnjoy your trip!`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: tripName || "NYC Trip",
    dates: dates,
    location: "New York City, NY",
    details: details,
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}