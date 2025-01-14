import express from 'express';
import authenticateToken from '../middleware/authMiddleware';
import Location from '../models/Location';
import mongoose from 'mongoose';
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/location_images'); // Directory to save profile pictures
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
        }
    },
});

// Create a new location
router.post('/create', authenticateToken, async (req, res) => {
    const { name, description, lat, lng, image } = req.body;
    const userId = req.user.userId;

    try {
        const newLocation = new Location({
            name,
            description,
            lat,
            lng,
            owner: userId,
            image,
        });

        await newLocation.save();
        res.status(201).json(newLocation);
    } catch (error) {
        console.error('Error creating location:', error);
        res.status(500).json({ message: 'Error creating location' });
    }
});

// Get all locations for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: 'Error fetching locations' });
    }
});

// Add a review to a location
router.post('/:locationId/review', authenticateToken, async (req, res) => {
    const { locationId } = req.params;
    const { rating, text } = req.body;

    try {
        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Add the new review
        location.reviews.push({ rating, text });

        // Update the location rating
        const totalRating = location.reviews.reduce((acc, review) => acc + review.rating, 0);
        location.rating = totalRating / location.reviews.length;

        await location.save();

        res.status(201).json(location);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Error adding review' });
    }
});

// Get details of a specific location
router.get('/:locationId', authenticateToken, async (req, res) => {
    const { locationId } = req.params;

    try {
        // Validate locationId as a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(locationId)) {
            return res.status(400).json({ message: 'Invalid location ID' });
        }

        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.status(200).json(location);
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ message: 'Error fetching location' });
    }
});

router.get('/:locationId/reviews', authenticateToken, async (req, res) => {
    const { locationId } = req.params;

    try {
        // Validate locationId as a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(locationId)) {
            return res.status(400).json({ message: 'Invalid location ID' });
        }

        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.status(200).json(location.reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});

router.put('/:locationId', authenticateToken, async (req, res) => {
    const { locationId } = req.params;
    const { name, description } = req.body;

    try {
        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Ensure only the owner can edit
        if (location.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (name) location.name = name;
        if (description) location.description = description;

        if (req.file) {
            location.image = `/uploads/${req.file.filename}`;
        }

        await location.save();
        res.status(200).json(location);
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: 'Error updating location' });
    }
});

router.delete('/:locationId', authenticateToken, async (req, res) => {
    const { locationId } = req.params;
    const userId = req.user.userId;

    try {
        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Check if the user is the owner of the location
        if (location.owner.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this location' });
        }

        // Delete the location
        await Location.findByIdAndDelete(locationId);

        res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ message: 'Failed to delete location' });
    }
});

// Add or update an image for a location
router.post('/:locationId/upload-image', authenticateToken, upload.single('image'), async (req, res) => {
    const { locationId } = req.params;
    const userId = req.user.userId;

    try {
        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Ensure only the owner can upload an image
        if (location.owner.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to update this location' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Save the image URL to the location document
        location.image = `/uploads/location_images/${req.file.filename}`;
        await location.save();

        res.status(200).json({
            message: 'Image uploaded successfully',
            image: location.image,
        });
    } catch (error) {
        console.error('Error uploading location image:', error);
        res.status(500).json({ message: 'Failed to upload location image' });
    }
});

export default router;