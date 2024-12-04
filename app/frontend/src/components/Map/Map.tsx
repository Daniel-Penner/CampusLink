import React, { useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, OverlayView } from '@react-google-maps/api';
import './MarkerStyles.css'; // Import the custom marker CSS styles

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 49.88, // Default latitude (e.g., Kelowna)
    lng: -119.50, // Default longitude
};

const markerIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="black" width="28" height="28">
        <path d="M172.9 499.1C66.6 350.4 0 288 0 192C0 86 86 0 192 0C298 0 384 86 384 192C384 288 317.4 350.4 211.1 499.1C201.8 512 182.2 512 172.9 499.1H172.9zM192 272C227.3 272 256 243.3 256 208C256 172.7 227.3 144 192 144C156.7 144 128 172.7 128 208C128 243.3 156.7 272 192 272z"/>
    </svg>
`;

const CustomPopup: React.FC<{
    location: any;
    onClose: () => void;
    handleMoreInfo: (location: any) => void; // Add the handleMoreInfo prop
}> = ({ location, onClose, handleMoreInfo }) => {
    return (
        <div
            className="custom-popup"
            style={{
                backgroundColor: 'var(--secondary-background)',
                padding: '10px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                width: '170px',
                zIndex: 1000,
            }}
        >
            <h3 style={{ color: 'var(--text-color)', marginBottom: '10px', fontSize: 16 }}>
                {location.name}
            </h3>
            <img
                src={location.image}
                alt={location.name}
                style={{
                    width: '150px',
                    height: 'auto',
                    borderRadius: '8px',
                    marginBottom: '10px',
                }}
            />
            <p style={{ color: 'var(--text-color)', marginBottom: '5px', fontSize: 12 }}>
                {location.description}
            </p>
            <p style={{ color: 'var(--text-color)', fontSize: 14 }}>
                Rating: {'★'.repeat(location.rating)}{'☆'.repeat(5 - location.rating)}
            </p>
            <button
                onClick={onClose}
                style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Close
            </button>
            <button
                onClick={() => handleMoreInfo(location)} // Call handleMoreInfo to open the modal
                style={{
                    marginTop: '10px',
                    marginLeft: '10px',
                    padding: '8px 12px',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                More Info
            </button>
        </div>
    );
};


const MapComponent: React.FC<{
    locations: any[];
    selectedLocation: any | null;
    onMoreInfo: (location: any | null) => void;
    handleMoreInfo: (location: any) => void;
}> = ({locations, selectedLocation, onMoreInfo, handleMoreInfo}) => {
    const {isLoaded, loadError} = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: ['marker'],
        version: 'weekly',
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

    const initializeMarkers = () => {
        if (!mapRef.current || !window.google) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => (marker.map = null));
        markersRef.current = [];

        locations.forEach((location) => {
            const markerElement = document.createElement('div');
            markerElement.className = 'custom-marker';
            markerElement.setAttribute('data-name', location.name);

            const iconElement = document.createElement('div');
            iconElement.className = 'custom-marker-icon';
            iconElement.innerHTML = markerIconSVG;
            markerElement.appendChild(iconElement);

            const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
                map: mapRef.current,
                position: { lat: location.lat, lng: location.lng },
                content: markerElement,
            });

            // Add click listener to set the selected location
            advancedMarker.addListener('click', () => {
                onMoreInfo(location);
            });

            markersRef.current.push(advancedMarker);
        });
    };

    useEffect(() => {
        if (mapRef.current) initializeMarkers();
    }, [locations]);

    if (loadError) return <div>Error loading maps. Please check your API key.</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={defaultCenter}
            onLoad={(map) => {
                mapRef.current = map;
                initializeMarkers();
            }}
            options={{
                mapId: '3e075ec058fc01f6', // Your Map ID
            }}
        >
            {/* Custom Popup using OverlayView */}
            {selectedLocation && (
                <OverlayView
                    position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                    mapPaneName={OverlayView.FLOAT_PANE}
                >
                    <CustomPopup
                        location={selectedLocation}
                        onClose={() => onMoreInfo(null)}
                        handleMoreInfo={handleMoreInfo}
                    />
                </OverlayView>
            )}
        </GoogleMap>
    );
};

export default MapComponent;
