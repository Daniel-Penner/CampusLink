import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import MapComponent from '../../components/Map/Map';
import AddLocationButton from '../../components/AddLocationButton/AddLocationButton';
import LocationModal from '../../components/LocationModal/LocationModal';
import CreationModal from '../../components/LocationCreationModal/LocationCreationModal';
import LocationEditModal from '../../components/LocationEditModal/LocationEditModal'; // Ensure this is imported
import styles from './Locations.module.css';

const LocationsPage: React.FC = () => {
    const [locations, setLocations] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [isEditingLocation, setIsEditingLocation] = useState(false); // Track if editing
    const [newLocationCoords, setNewLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const token = localStorage.getItem('token');

    // Fetch all locations from the server
    useEffect(() => {
        fetch('/api/locations', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => setLocations(data))
            .catch((error) => console.error('Error fetching locations:', error));
    }, []);

    const calculateScore = (location: any) => {
        const { reviews, rating } = location;
        const reviewCount = reviews.length;
        const reviewWeight = 0.1;
        return rating + reviewWeight * reviewCount;
    };

    const sortedLocations = [...locations]
        .sort((a, b) => calculateScore(b) - calculateScore(a))
        .filter((location) => location.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleStartAddingLocation = () => {
        setIsAddingLocation(true);
        setNewLocationCoords(null);
    };

    const handleCancelAddingLocation = () => {
        setIsAddingLocation(false);
        setNewLocationCoords(null);
    };

    const handleSaveNewLocation = (data: { name: string; description: string }) => {
        if (newLocationCoords) {
            fetch('/api/locations/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: data.name,
                    description: data.description,
                    lat: newLocationCoords.lat,
                    lng: newLocationCoords.lng,
                }),
            })
                .then((response) => response.json())
                .then((newLocation) => {
                    setLocations((prev) => [...prev, newLocation]);
                    handleCancelAddingLocation();
                })
                .catch((error) => console.error('Error creating location:', error));
        }
    };

    const handleOpenInfo = (location: any) => setSelectedLocation(location);

    const handleMoreInfo = (location: any) => {
        setSelectedLocation(location);
        setIsModalOpen(true);
    };

    const handleEditLocation = (location: any) => {
        setSelectedLocation(location);
        setIsEditingLocation(true);
    };

    const handleUpdateLocation = (updatedLocation: any) => {
        setLocations((prev) =>
            prev.map((location) =>
                location._id === updatedLocation._id ? { ...location, ...updatedLocation } : location
            )
        );

        // Ensure the selected location updates immediately
        setSelectedLocation((prev: any) =>
            prev && prev._id === updatedLocation._id ? updatedLocation : prev
        );
    };

    const handleDeleteLocation = (deletedLocationId: string) => {
        setLocations((prev) => prev.filter((location) => location._id !== deletedLocationId));
        setIsEditingLocation(false);
        setSelectedLocation(null);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const fractionalPart = rating % 1;
        const hasHalfStar = fractionalPart >= 0.25 && fractionalPart < 0.75;
        const adjustedFullStars = fractionalPart >= 0.75 ? fullStars + 1 : fullStars;
        const emptyStars = 5 - adjustedFullStars - (hasHalfStar ? 1 : 0);

        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {Array(adjustedFullStars)
                    .fill(0)
                    .map((_, index) => (
                        <span key={`full-${index}`} style={{ color: '#FFD700', fontSize: '16px' }}>
                            ★
                        </span>
                    ))}
                {hasHalfStar && <span style={{ color: '#FFD700', fontSize: '16px' }}>½</span>}
                {Array(emptyStars)
                    .fill(0)
                    .map((_, index) => (
                        <span key={`empty-${index}`} style={{ color: '#DDD', fontSize: '16px' }}>
                            ☆
                        </span>
                    ))}
            </div>
        );
    };
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <div className={styles.sidebar}>
                    <h2 className={styles.sidebarHeader}>Top Rated Locations</h2>
                    <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={styles.searchBar}
                    />
                    {sortedLocations.map((location, index) => (
                        <div
                            key={location._id}
                            className={`${styles.locationItem} ${
                                selectedLocation?._id === location._id ? styles.active : ''
                            }`}
                            onClick={() => handleOpenInfo(location)}
                        >
                            <div className={styles.locationInfo}>
                                <p>
                                    <strong>#{index + 1}</strong> {location.name}
                                </p>
                                <p className={styles.rating}>{renderStars(location.rating)}</p>
                            </div>
                        </div>
                    ))}
                    <button className={styles.addLocationSidebarButton} onClick={handleStartAddingLocation}>
                        Add Location
                    </button>
                </div>
                <div className={styles.mainColumn}>
                    <MapComponent
                        locations={locations}
                        selectedLocation={selectedLocation}
                        onMoreInfo={handleOpenInfo}
                        handleMoreInfo={handleMoreInfo}
                        renderStars={renderStars}
                        isAddingLocation={isAddingLocation}
                        onNewLocationSelected={(coords) => setNewLocationCoords(coords)}
                        onCancelAddingLocation={handleCancelAddingLocation}
                        onEdit={handleEditLocation}
                        isOwner={(location) => location.owner === localStorage.getItem('id')}
                    />
                    <AddLocationButton onClick={handleStartAddingLocation} />
                </div>
            </div>
            {isModalOpen && selectedLocation && (
                <LocationModal location={selectedLocation} onClose={handleCloseModal} onLocationUpdated={handleUpdateLocation} />
            )}
            {isAddingLocation && newLocationCoords && (
                <CreationModal
                    coords={newLocationCoords}
                    onSave={handleSaveNewLocation}
                    onCancel={handleCancelAddingLocation}
                />
            )}
            {isEditingLocation && selectedLocation && (
                <LocationEditModal
                    location={selectedLocation}
                    onClose={() => setIsEditingLocation(false)}
                    onLocationDeleted={handleDeleteLocation}
                    onLocationUpdated={handleUpdateLocation}
                />
            )}
        </div>
    );
};

export default LocationsPage;
