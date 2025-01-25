import React from 'react';

const LocationListItem: React.FC<{ location: any; onView: () => void }> = ({ location, onView }) => (
    <div>
        <span>{location.name}</span>
        <button onClick={onView}>View on Map</button>
    </div>
);

export default LocationListItem;
