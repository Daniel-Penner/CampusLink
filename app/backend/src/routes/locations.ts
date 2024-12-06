import express from 'express';
import authenticateToken from '../middleware/authMiddleware';
import Location from '../models/Location';
import mongoose from 'mongoose';

const router = express.Router();

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

export default router;