import * as express from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: any; // Extend the Request interface with 'user' property
        }
    }
}
