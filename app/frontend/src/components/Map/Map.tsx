import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, OverlayView } from '@react-google-maps/api';
import './MarkerStyles.css';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 49.89, // Default latitude
    lng: -119.44, // Default longitude
};

const markerIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="black" width="28" height="28">
        <path d="M172.9 499.1C66.6 350.4 0 288 0 192C0 86 86 0 192 0C298 0 384 86 384 192C384 288 317.4 350.4 211.1 499.1C201.8 512 182.2 512 172.9 499.1H172.9zM192 272C227.3 272 256 243.3 256 208C256 172.7 227.3 144 192 144C156.7 144 128 172.7 128 208C128 243.3 156.7 272 192 272z"/>
    </svg>
`;

const SelectionPrompt: React.FC<{
    onCancel: () => void;
}> = ({ onCancel }) => (
    <div
        style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: 1000,
        }}
    >
        <p>Click on the map to select the location for your new business.</p>
        <button
            onClick={onCancel}
            style={{
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: '#ff4d4d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
            }}
        >
            Cancel
        </button>
    </div>
);

const CustomPopup: React.FC<{
    location: any;
    onClose: () => void;
    handleMoreInfo: (location: any) => void;
    renderStars: (rating: number) => JSX.Element;
}> = ({ location, onClose, handleMoreInfo, renderStars }) => {
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
            <p style={{ color: 'var(--text-color)', marginBottom: '10px', fontSize: 12 }}>
                {location.description}
            </p>
            <hr />
            <p style={{ color: 'var(--text-color)', fontSize: 12, marginTop: '10px' }}>
                Rating: {location.rating.toFixed(2)}
                {renderStars(location.rating)}
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
                onClick={() => handleMoreInfo(location)}
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
                Reviews
            </button>
        </div>
    );
};

const MapComponent: React.FC<{
    locations: any[];
    selectedLocation: any | null;
    onMoreInfo: (location: any | null) => void;
    handleMoreInfo: (location: any) => void;
    renderStars: (rating: number) => JSX.Element;
    isAddingLocation: boolean;
    onNewLocationSelected: (coords: { lat: number; lng: number }) => void;
    onCancelAddingLocation: () => void;
}> = ({
          locations,
          selectedLocation,
          onMoreInfo,
          handleMoreInfo,
          renderStars,
          isAddingLocation,
          onNewLocationSelected,
          onCancelAddingLocation,
      }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: ['marker'],
        version: 'weekly',
    });

    const mapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const [temporaryMarker, setTemporaryMarker] = useState<google.maps.Marker | null>(null);

    const initializeMarkers = () => {
        if (!mapRef.current || !window.google) return;

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

            advancedMarker.addListener('click', () => onMoreInfo(location));
            markersRef.current.push(advancedMarker);
        });
    };

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (!isAddingLocation || !event.latLng) return;

        const coords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        onNewLocationSelected(coords);

        if (temporaryMarker) {
            temporaryMarker.setPosition(coords);
        } else if (mapRef.current) {
            const marker = new google.maps.Marker({
                position: coords,
                map: mapRef.current,
                draggable: true,
            });

            marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
                if (event.latLng) {
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();
                    onNewLocationSelected({ lat, lng });
                }
            });

            setTemporaryMarker(marker);
        }
    };

    useEffect(() => {
        if (!isAddingLocation && temporaryMarker) {
            temporaryMarker.setMap(null);
            setTemporaryMarker(null);
        }
    }, [isAddingLocation]);

    useEffect(() => {
        if (mapRef.current) initializeMarkers();
    }, [locations]);

    useEffect(() => {
        if (mapRef.current && selectedLocation) {
            const offsetLat = -0.009;
            const offsetLng = 0.015;

            mapRef.current.panTo({
                lat: selectedLocation.lat + offsetLat,
                lng: selectedLocation.lng + offsetLng,
            });
        }
    }, [selectedLocation]);

    const mapOptions = {
        mapId: '3e075ec058fc01f6',
        styles: [
            {
                featureType: 'poi', // General points of interest
                elementType: 'all',
                stylers: [{ visibility: 'off' }], // Hides all POIs
            },
            {
                featureType: 'poi.business', // Businesses specifically
                elementType: 'all',
                stylers: [{ visibility: 'off' }], // Hides businesses
            },
            {
                featureType: 'transit', // Transit features like bus stops
                elementType: 'all',
                stylers: [{ visibility: 'off' }], // Hides transit features
            },
            {
                featureType: 'road.local', // Local roads
                elementType: 'labels', // Labels on local roads
                stylers: [{ visibility: 'off' }], // Hides labels on local roads
            },
            {
                featureType: 'administrative.neighborhood', // Neighborhood labels
                elementType: 'labels.text',
                stylers: [{ visibility: 'off' }], // Hides neighborhood labels
            },
        ],
        disableDefaultUI: true, // Disable extra UI elements like navigation controls
        clickableIcons: false, // Disables POI icons being clickable
    };


    if (loadError) return <div>Error loading maps. Please check your API key.</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={14}
                center={defaultCenter}
                options={mapOptions}
                onLoad={(map) => {
                    console.log('Map loaded with options:', mapOptions);
                    mapRef.current = map;
                    initializeMarkers();
                }}

                onClick={handleMapClick}
            >
                {selectedLocation && (
                    <OverlayView
                        position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                        mapPaneName={OverlayView.FLOAT_PANE}
                    >
                        <CustomPopup
                            location={selectedLocation}
                            onClose={() => onMoreInfo(null)}
                            handleMoreInfo={handleMoreInfo}
                            renderStars={renderStars}
                        />
                    </OverlayView>
                )}
            </GoogleMap>
            {isAddingLocation && <SelectionPrompt onCancel={onCancelAddingLocation} />}
        </div>
    );
};

export default MapComponent;
