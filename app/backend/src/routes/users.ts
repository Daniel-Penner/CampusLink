import express from 'express';
import User from '../models/User'; // Adjust the path based on your project structure

const router = express.Router();

// GET /api/users/:userId - Fetch user by ID
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ name: user.firstName + ' ' + user.lastName });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;