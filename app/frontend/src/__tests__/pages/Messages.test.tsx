import React from 'react';
import { render, screen , waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import MessagesPage from '../../pages/Messages/Messages';

// Mock only what you truly need (DirectMessages, ChatWindow, etc.)
// Or remove these mocks if you want them real as well
jest.mock('../../components/DirectMessages/DirectMessages', () => ({
    __esModule: true,
    default: () => <div data-testid="direct-messages">Mock DirectMessages</div>,
}));

jest.mock('../../components/ChatWindow/ChatWindow', () => ({
    __esModule: true,
    default: () => <div data-testid="chat-window">Mock ChatWindow</div>,
}));

jest.mock('../../components/CallManager/CallManager', () => ({
    __esModule: true,
    default: () => <div data-testid="call-manager">Mock CallManager</div>,
}));

// Mock Auth Context
const mockAuthContext = {
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    profilePicture: 'default_profile.jpg',
    updateProfilePicture: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
    name: 'John Doe',
    code: '12345',
    id: '123',
};

// Example fetch mocks
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: async () => {
            // ... your logic for different endpoints ...
            return [];
        },
    } as Response)
);

function renderWithProviders(ui: React.ReactNode) {
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <BrowserRouter>{ui}</BrowserRouter>
        </AuthContext.Provider>
    );
}

// Test Suite
describe('MessagesPage UI Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders MessagesPage correctly', async () => {
        renderWithProviders(<MessagesPage />);

        // Verify key UI elements render
        expect(screen.getByTestId('direct-messages')).toBeInTheDocument();
        expect(screen.getByTestId('chat-window')).toBeInTheDocument();

        // Wait for API calls to complete
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    });
});
