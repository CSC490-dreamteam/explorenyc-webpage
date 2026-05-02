import { useEffect, useState } from 'react';
import TripDetail from './navigation/screens/components/TripDetail.jsx';


export default function PublicTripPage({ tripId }) {
  const [trip, setTrip] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const API_BASE_URL = 'https://explorenyc-recommendation-service-production.up.railway.app';

    const fetchTrip = async () => {
      setStatus('loading');
      try {
        const response = await fetch(`${API_BASE_URL}/public-trip?trip_id=${tripId}`);

        if (!response.ok) {
          setStatus('not-found');
          return;
        }

        const data = await response.json();
        setTrip({ ...data, stops: data.stops?.stops ?? [] });
        setStatus('ready');
      } catch (error) {
        console.error("Failed to fetch trip:", error);
        setStatus('not-found');
      }
    };

    fetchTrip();
  }, [tripId]);

  if (status === 'loading') {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p>Loading trip…</p>
        </div>
      );
    }

  if (status === 'not-found') {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h1>Trip Not Found</h1>
          <h2>This trip doesn't exist or isn't public.</h2>
          <a href="/">← Back to ExploreNYC</a>
        </div>
      );
    }

  //actually return the trip
  return (
    <TripDetail
      trip={trip}
      onClose={() => { window.location.href = '/'; }} //links back to homepage
      onTripsUpdated={null}
      isReadOnly={true} //trip is read-only since it's public
    />
  );
}
