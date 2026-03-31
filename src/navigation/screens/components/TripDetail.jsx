import '/src/App.css'

function TripDetail({ stops }) {

    return (
        <div>
            {stops?.map((stop, index) => (
                <div key={index} style={{ padding: '10px' }}>
                    <strong>{stop.Name}</strong>
                    <p>{stop.Address.Street}</p>
                </div>
            ))}

            {/* Optional: Show a message if no stops are found yet */}
            {!stops && <p>Loading stops...</p>}
        </div>
    )
}

export default TripDetail