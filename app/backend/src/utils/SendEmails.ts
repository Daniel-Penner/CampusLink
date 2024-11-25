import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Set the SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string || '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');

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
    } catch (error) {
        // Type guard to check if the error has a 'response' property
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
