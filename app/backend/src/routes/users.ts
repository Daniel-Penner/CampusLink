import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User'; // Adjust the path based on your project structure
import authenticateToken from '../middleware/authMiddleware';
import crypto from 'crypto';
import {sendEmail} from "../utils/SendEmails";
import { emailTemplates } from '../data/Emails'

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
        if (bio) user.bio = bio;

        // If password update is requested, verify the current password
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        let message = "Profile updated successfully!";

        // Handle email change
        if (email && email !== user.email) {
            message = "Please verify your new email to change it, a verification link was sent to the new address."
            user.emailChangeToken = crypto.randomBytes(32).toString('hex');
            user.emailChangeExpires = new Date(Date.now() + 3600000); // 1-hour expiry

            const verificationLink = `https://localhost/verify-email-change/${user.emailChangeToken}`;
            const subject = 'Verify Your New Email Address';
            const text = `Verify your new email by clicking this link: ${verificationLink}`;
            const html = emailTemplates.emailChangeVerification(verificationLink, user.firstName);

            await sendEmail(email, subject, text, html);

            // Store the new email temporarily
            user.newEmail = email;
        }


        await user.save();

        res.status(200).json({
            message: message,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                verified: user.verified,
            },
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/verify-email-change/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            emailChangeToken: token,
            emailChangeExpires: { $gt: Date.now() }, // Token must not be expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Ensure `newEmail` exists before assigning
        if (user.newEmail) {
            user.email = user.newEmail; // Apply the new email
            user.newEmail = undefined; // Clear the temporary field
        } else {
            return res.status(400).json({ message: 'New email is not available to update.' });
        }

        user.verified = true;
        user.emailChangeToken = undefined;
        user.emailChangeExpires = undefined;

        await user.save();

        return res.status(200).json({ message: 'Email updated and verified successfully.' });
    } catch (error) {
        console.error('Error verifying email change:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});






export default router;
