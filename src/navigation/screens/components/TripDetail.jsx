import '/src/App.css'

const TRANSPORT_MODES = {
    0: { label: 'Walking', icon: '🚶' },
    1: { label: 'Car', icon: '🚗' },
    2: { label: 'Subway', icon: '🚇' },
}

function formatCost(cents) {
    if (!cents) return null
    return `$${(cents / 100).toFixed(2)}`
}

function TripDetail({ stops }) {

    return (
        <div>
            {stops?.map((stop, index) => (
                <div key={index}>
                    <div style={{ padding: '10px' }}>
                    <strong>{stop.Name}</strong>
                    <p>{stop.Address.Street}</p>
                </div>

                {index < stops.length - 1 &&  stop.TravelTimeToNextStop >0 && (
                    <div>
                            <span className='transit-icon'> {TRANSPORT_MODES[stop.TransportToNextStop]?.icon}</span>
                        <div className='transit-info'>
                            <strong> {TRANSPORT_MODES[stop.TransportToNextStop]?.label}</strong>
                            <span className='transit-details'> 
                                {stop.TravelTimeToNextStop} min
                                {stop.TransitCost >0 && ` . ${formatCost(stop.TransitCost)}`}
                            </span>
                        </div>
                    </div>
                )}
             </div>
            ))}

            {/* Optional: Show a message if no stops are found yet */}
            {!stops && <p>Loading stops...</p>}
        </div>
    )
}

export default TripDetail