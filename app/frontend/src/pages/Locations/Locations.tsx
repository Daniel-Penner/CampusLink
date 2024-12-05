import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import MapComponent from '../../components/Map/Map';
import AddLocationButton from '../../components/AddLocationButton/AddLocationButton';
import LocationModal from '../../components/LocationModal/LocationModal';
import CreationModal from "../../components/LocationCreationModal/LocationCreationModal";
import styles from './Locations.module.css';

const LocationsPage: React.FC = () => {
    const [locations, setLocations] = useState<any[]>([
        {
            id: 1,
            name: 'John’s Cafe',
            lat: 49.89,
            lng: -119.49,
            rating: 3.75,
            image: 'https://via.placeholder.com/150',
            description: 'Cozy cafe with great coffee.',
            reviews: [
                { rating: 4, text: 'Great coffee and ambiance!' },
                { rating: 5, text: 'Amazing service!' },
            ],
        },
        {
            id: 2,
            name: 'Raudz Restaurant',
            lat: 49.88,
            lng: -119.47,
            rating: 3.44,
            image: 'https://via.placeholder.com/150',
            description: 'Fine dining with local ingredients.',
            reviews: [
                { rating: 3, text: 'Good food but pricey.' },
            ],
        },
    ]);

    const calculateScore = (location: any) => {
        const { reviews, rating } = location;
        const reviewCount = reviews.length;
        const reviewWeight = 0.1;
        return rating + reviewWeight * reviewCount;
    };

    const sortedLocations = [...locations].sort((a, b) => calculateScore(b) - calculateScore(a));

    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [newLocationCoords, setNewLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

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
            setLocations((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    name: data.name,
                    description: data.description,
                    lat: newLocationCoords.lat,
                    lng: newLocationCoords.lng,
                    rating: 0,
                    reviews: [],
                    image: 'https://via.placeholder.com/150',
                },
            ]);
        }
        handleCancelAddingLocation();
    };

    const handleOpenInfo = (location: any) => setSelectedLocation(location);

    const handleMoreInfo = (location: any) => {
        setSelectedLocation(location);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleAddReview = (id: number, newReview: { rating: number; text: string }) => {
        setLocations((prev) =>
            prev.map((loc) =>
                loc.id === id
                    ? {
                        ...loc,
                        reviews: [...loc.reviews, newReview],
                        rating:
                            [...loc.reviews, newReview].reduce((acc, review) => acc + review.rating, 0) /
                            (loc.reviews.length + 1),
                    }
                    : loc
            )
        );
    };

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

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <div className={styles.sidebar}>
                    <h2 className={styles.sidebarHeader}>Top Rated Locations</h2>
                    {sortedLocations.map((location, index) => (
                        <div
                            key={location.id}
                            className={`${styles.locationItem} ${selectedLocation?.id === location.id ? styles.active : ''}`}
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
                    />
                    <AddLocationButton onClick={handleStartAddingLocation} />
                </div>
            </div>
            {isModalOpen && selectedLocation && (
                <LocationModal location={selectedLocation} onClose={handleCloseModal} onAddReview={handleAddReview} />
            )}
            {isAddingLocation && (
                <>
                    {newLocationCoords && (
                        <CreationModal
                            coords={newLocationCoords}
                            onSave={handleSaveNewLocation}
                            onCancel={handleCancelAddingLocation}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default LocationsPage;
