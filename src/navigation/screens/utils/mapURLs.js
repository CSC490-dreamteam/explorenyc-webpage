import { getStopLatitude, getStopLongitude, formatAddress, getStopName } from "./stopPlace.js";

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
    return encodeURIComponent(`${name}, ${address}`);
  }

  // fallback case: Address only
  if (hasValidAddress) {
    return encodeURIComponent(address);
  }

  // fallback case: Lat, Lng only
  if (hasCoordinates) {
    return `${lat},${lng}`;
  }

  return "";
}
