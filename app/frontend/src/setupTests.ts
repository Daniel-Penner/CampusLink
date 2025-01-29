// setupTests.ts
import '@testing-library/jest-dom';
(global as any).importMetaEnv = {
    VITE_API_URL: 'http://localhost:3000',
    VITE_GOOGLE_MAPS_API_KEY: 'mock-google-maps-api-key',
};

// Mock import.meta globally for Jest
Object.defineProperty(global, 'import', {
    value: {
        meta: {
            env: (global as any).importMetaEnv,
        },
    },
});
