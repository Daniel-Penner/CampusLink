import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Set the SendGrid API key
if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY is not set in the environment variables.');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log(process.env.SENDGRID_API_KEY);

// Function to send an email
export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
    const fromEmail = process.env.FROM_EMAIL || 'campuslinksite@gmail.com'; // Fallback email

    const msg = {
        to, // Recipient email
        from: fromEmail, // Sender email with fallback
        subject, // Email subject
        text, // Plain text body
        html, // HTML body
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        if (error instanceof Error) {
            if ((error as any).response && (error as any).response.body) {
                console.error('SendGrid Error Response:', (error as any).response.body);
            } else {
                console.error('Error message:', error.message);
            }
        } else {
            console.error('Unexpected error:', error);
        }
    }
};
