import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User'; // Adjust the path based on your project structure
import authenticateToken from '../middleware/authMiddleware';

const router = express.Router();

// GET /api/users/:userId - Fetch user by ID
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            bio: user.bio || '',
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/users/:userId - Update user profile
router.put('/:userId', authenticateToken, async (req, res) => {
    const { firstName, lastName, email, bio, currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify if the current user matches the user being updated
        if (req.user.userId !== user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (bio) user.bio = bio;

        // If password update is requested, verify the current password
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
