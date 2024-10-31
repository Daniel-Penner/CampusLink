import { Server } from 'socket.io';
import express from 'express';

declare global {
    namespace Express {
        export interface Request {
            io: Server;
            user?: any;
        }
    }
}
