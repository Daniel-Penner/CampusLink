import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import MapComponent from '../../components/Map/Map';
import AddLocationButton from '../../components/AddLocationButton/AddLocationButton';
import LocationModal from '../../components/LocationModal/LocationModal';
import styles from './Locations.module.css';

const LocationsPage: React.FC = () => {
    const [locations, setLocations] = useState<any[]>([
        {
            id: 1,
            name: 'John’s Cafe',
            lat: 49.89,
            lng: -119.49,
            rating: 4,
            image: 'https://via.placeholder.com/150',
            description: 'Cozy cafe with great coffee.',
        },
        {
            id: 2,
            name: 'Raudz Restaurant',
            lat: 49.88,
            lng: -119.47,
            rating: 5,
            image: 'https://via.placeholder.com/150',
            description: 'Fine dining with local ingredients.',
        },
    ]);
    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddLocation = () => {
        alert('Add location functionality coming soon!');
    };

    const handleOpenInfo = (location: any) => {
        setSelectedLocation(location);
    };

    const handleMoreInfo = (location: any) => {
        setSelectedLocation(location);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedLocation(null);
        setIsModalOpen(false);
    };

    return (
        <div className={styles.pageContainer}>
            <Navbar />
            <div className={styles.mainContent}>
                <div className={styles.sidebar}>
                    <h2 className={styles.sidebarHeader}>Top Rated Locations</h2>
                    {locations.map((location) => (
                        <div
                            key={location.id}
                            className={`${styles.locationItem} ${
                                selectedLocation?.id === location.id ? styles.active : ''
                            }`}
                            onClick={() => handleOpenInfo(location)}
                        >
                            <div className={styles.locationInfo}>
                                <p>{location.name}</p>
                                <p className={styles.rating}>
                                    {'★'.repeat(location.rating)}{'☆'.repeat(5 - location.rating)}
                                </p>
                            </div>
                        </div>
                    ))}

                </div>
                <div className={styles.mainColumn}>
                    <MapComponent
                        locations={locations}
                        selectedLocation={selectedLocation}
                        onMoreInfo={handleOpenInfo}
                        handleMoreInfo={handleMoreInfo}
                    />
                    <AddLocationButton onClick={handleAddLocation} />
                </div>
            </div>
            {isModalOpen && selectedLocation && (
                <LocationModal
                    location={selectedLocation}
                    onClose={handleCloseModal}
                    onAddRating={(id, newRating) =>
                        setLocations((prev) =>
                            prev.map((loc) =>
                                loc.id === id ? { ...loc, rating: newRating } : loc
                            )
                        )
                    }
                />
            )}
        </div>
    );
};

export default LocationsPage;
