import React, { useState } from 'react';
import styles from './LocationEditModal.module.css';

interface Location {
    _id: string;
    name: string;
    description: string;
    lat: number;
    lng: number;
    image?: string;
}

interface LocationEditModalProps {
    location: Location;
    onClose: () => void;
    onLocationUpdated: (updatedLocation: Location) => void;
    onLocationDeleted: (deletedLocationId: string) => void; // Updated to accept ID
}

const LocationEditModal: React.FC<LocationEditModalProps> = ({
                                                                 location,
                                                                 onClose,
                                                                 onLocationUpdated,
                                                                 onLocationDeleted,
                                                             }) => {
    const [name, setName] = useState(location.name);
    const [description, setDescription] = useState(location.description);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState(location.image || '');

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/locations/${location._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) {
                throw new Error('Failed to update location.');
            }

            const updatedLocation = await response.json();
            onLocationUpdated(updatedLocation);
            onClose();
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/locations/${location._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete location.');
            }

            onLocationDeleted(location._id); // Pass the ID of the deleted location
            onClose();
        } catch (error) {
            console.error('Error deleting location:', error);
        }
    };

    const handleImageUpload = async () => {
        if (!image) return;

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', image);

            const response = await fetch(`/api/locations/${location._id}/upload-image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image.');
            }

            const updatedLocation = await response.json();
            setPreview(updatedLocation.image); // Update the preview
            onLocationUpdated(updatedLocation); // Notify parent of the updated location

            // Update the image in the selectedLocation state
            setTimeout(() => {
                onLocationUpdated({ ...location, image: updatedLocation.image });
            }, 100);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Show a preview of the image
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2>Edit Location</h2>
                <div className={styles.section}>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.inputField}
                    />
                </div>
                <div className={styles.section}>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={styles.textArea}
                    />
                </div>
                <div className={styles.section}>
                    <label>Image:</label>
                    {preview && (
                        <img
                            src={preview}
                            alt="Location Preview"
                            className={styles.imagePreview}
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={styles.inputField}
                    />
                    <button
                        onClick={handleImageUpload}
                        className={styles.uploadButton}
                        disabled={!image} // Disable if no image is selected
                    >
                        Upload Image
                    </button>
                </div>
                <div className={styles.actions}>
                    <button onClick={handleUpdate} className={styles.saveButton}>
                        Save Changes
                    </button>
                    <button onClick={handleDelete} className={styles.deleteButton}>
                        Delete Location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationEditModal;
