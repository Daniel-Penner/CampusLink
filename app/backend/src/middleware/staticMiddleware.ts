import path from 'path';
import { Express } from 'express';
import express from 'express';

const staticMiddleware = (app: Express): void => {
    // Serve static files from the "uploads" directory
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    console.log('Serving static files from:', path.join(__dirname, '../uploads'));
};

export default staticMiddleware;
