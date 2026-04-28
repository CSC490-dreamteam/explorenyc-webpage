import { useEffect, useState } from 'react';
import TripDetail from './navigation/screens/components/TripDetail.jsx';
import { getPublicTrip } from './demoTrips.js';

export default function PublicTripPage({ tripId }) {
  const [trip, setTrip] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const found = getPublicTrip(tripId);
    if (found) {
      setTrip(found);
      setStatus('ready');
    } else {
      setStatus('not-found');
    }
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
        <h2>Trip not found</h2>
        <p>This trip doesn't exist or isn't public.</p>
        <a href="/">← Back to ExploreNYC</a> {/* link to home page */}
      </div>
    );
  }

  //actually return the trip
  return (
    <TripDetail
      trip={trip}
      onClose={() => { window.location.href = '/'; }} //links back to homepage
      onTripsUpdated={null}
    />
  );
}
