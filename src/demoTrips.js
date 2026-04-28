const DEMO_TRIPS = {
  tripone: {
    user_id: "11",
    trip_id: 89,
    entry_datetime: "2026-05-04T10:12:00",
    exit_datetime: "2026-05-04T17:12:00",
    tags: null,
    name: "Weeaboo Adventure",
    status: "Planned",
    stops: [
      {
        Name: "Penn Station",
        Address: {
          Lat: 40.750568,
          Lon: -73.993519,
          Street: "",
          City: "New York",
          State: "NY",
          Zip: "10119",
          PlaceName: "Penn Station",
          FormattedAddress: "New York, NY 10119, USA",
        },
        ArrivalTimeInMinutes: 612,
        DepartureTimeInMinutes: 612,
        DurationAtStopInMinutes: 0,
        Legs: [
          {
            TransportType: 0,
            TravelTimes: 11,
            TransitCosts: 0,
            Polylines: [
              "ydvwFj{rbMYLGDg@TEACCICICAGgBkAECKEMGAEcBgAAAAAIGMIaBeAKIKGcBgAKGKIaBiAKGMIcBaAKIMIaBmA~DcM",
            ],
          },
        ],
      },
      {
        Name: "Midtown Comics Times Square",
        Address: {
          Lat: 40.7548485,
          Lon: -73.9883862,
          Street: "200 West 40th Street",
          City: "New York",
          State: "NY",
          Zip: "10018",
          PlaceName: "Midtown Comics Times Square",
          FormattedAddress: "200 W 40th St, New York, NY 10018, USA",
        },
        ArrivalTimeInMinutes: 621,
        DepartureTimeInMinutes: 702,
        DurationAtStopInMinutes: 81,
        Legs: [
          {
            TransportType: 0,
            TravelTimes: 19,
            TransitCosts: 0,
            Polylines: [
              "_}vwFfzqbMX{@HYFS@CTw@`@sAFQB@v@P^HVFB@F@B@F@@@@?rB`@@@B?D@F@D@@?vBZ@?HBJ@@?@EDKDIHS@EtBVB@H@J@D?tBXB?H@F@B@D?FCBAB?@?@?~@NHDNFB?@?B?@?BBHDJFB@@@@EFODM@CZRFDFBF@D?|@JB?B?D@F?B?B?vBVB@D?@@J@@@LClBTD@H@H@|BVL@LBvCiJ@CFSDOBGrBuGFQFSrBsGDMJYDDXP",
            ],
          },
        ],
      },
      {
        Name: "Ramen Goku - Park Ave South",
        Address: {
          Lat: 40.7442387,
          Lon: -73.9830896,
          Street: "435 Park Avenue South",
          City: "New York",
          State: "NY",
          Zip: "10016",
          PlaceName: "Ramen Goku - Park Ave South",
          FormattedAddress: "435 Park Ave S, New York, NY 10016, USA",
        },
        ArrivalTimeInMinutes: 720,
        DepartureTimeInMinutes: 810,
        DurationAtStopInMinutes: 90,
        Legs: [
          {
            TransportType: 0,
            TravelTimes: 18,
            TransitCosts: 0,
            Polylines: [
              "_{twFnzpbMYQEEKXELsBrGGRGPsBtGCFENGRABwChJMCMA}BWIAIAEAmBUMBAAKAAAE?CAwBWC?C?G?EAC?C?}@KE?GAGCGE[SABELQIOIoAy@YOIGKGw@i@m@a@IGIGgBeAIGMIaBgAKGIGeBkAKIIEeBiAKGKGGTADkAw@",
            ],
          },
        ],
      },
      {
        Name: "Kinokuniya New York",
        Address: {
          Lat: 40.754107,
          Lon: -73.9849938,
          Street: "1073 6th Avenue",
          City: "New York",
          State: "NY",
          Zip: "10018",
          PlaceName: "Kinokuniya New York",
          FormattedAddress: "1073 6th Ave 2nd Floor, New York, NY 10018, USA",
        },
        ArrivalTimeInMinutes: 827,
        DepartureTimeInMinutes: 867,
        DurationAtStopInMinutes: 40,
        Legs: [
          {
            TransportType: 0,
            TravelTimes: 11,
            TransitCosts: 0,
            Polylines: [
              "ywvwFjdqbMWQ@EFSFU@CMIIE}AeAIGHSRq@fBsFrBmG@EGEGGH[HW`@uAnA{DHS@EFOLa@BIBIDMJYDIDKDODMOKEC@AFSAG?CAA?Ew@e@IMQOg@]Tw@BEQMC@KGw@g@",
            ],
          },
        ],
      },
      {
        Name: "Grand Central",
        Address: {
          Lat: 40.7533582,
          Lon: -73.9768041,
          Street: "89 East 42nd Street",
          City: "New York",
          State: "NY",
          Zip: "10017",
          PlaceName: "Grand Central",
          FormattedAddress: "89 E 42nd St, New York, NY 10017, USA",
        },
        ArrivalTimeInMinutes: 877,
        DepartureTimeInMinutes: 877,
        DurationAtStopInMinutes: 0,
        Legs: null,
      },
    ],
  },

  // TODO: paste trip JSON
  triptwo: null,

  // TODO: paste trip JSON
  tripthree: null,
};

export function getPublicTrip(tripId) {
  //hardcoded demos
  if (DEMO_TRIPS[tripId]) {
    return DEMO_TRIPS[tripId];
  }

  //localStorage
  //localStorage.setItem('publicTrip:abc123', JSON.stringify(tripObj))
  try {
    const raw = localStorage.getItem(`publicTrip:${tripId}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to read public trip from localStorage:", err);
  }

  //real API call once endpoint is ready
  //const res = await fetch(`https://nicks-recommendation-service.com/trips/${tripId}`);
  //if (res.ok) return await res.json();

  return null;
}
