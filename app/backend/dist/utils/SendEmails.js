"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Set the SendGrid API key
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY || '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');
// Function to send an email
const sendEmail = async (to, subject, text, html) => {
    const fromEmail = process.env.FROM_EMAIL || 'campuslinksite@gmail.com'; // Fallback email
    const msg = {
        to, // Recipient email
        from: fromEmail, // Sender email with fallback
        subject, // Email subject
        text, // Plain text body
        html, // HTML body
    };
    try {
        await mail_1.default.send(msg);
    }
    catch (error) {
        // Type guard to check if the error has a 'response' property
        if (error instanceof Error) {
            if (error.response && error.response.body) {
                console.error('SendGrid Error Response:', error.response.body);
            }
            else {
                console.error('Error message:', error.message);
            }
        }
        else {
            console.error('Unexpected error:', error);
        }
    }
};
exports.sendEmail = sendEmail;
