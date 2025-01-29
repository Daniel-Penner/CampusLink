import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard/Dashboard';
import { AuthContext } from '../../contexts/AuthContext';
import fetchMock from 'jest-fetch-mock';

// Mock useNavigate from React Router
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();
require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);

const mockAuthContext = {
    isAuthenticated: true,
    user: null,
    name: 'John Doe',
    code: '12345',
    id: 'mockId',
    login: jest.fn(),
    logout: jest.fn(),
};

const mockFetchResponse = {
    recentMessages: [
        { content: 'Hello, world!', channelName: 'General', timestamp: new Date().toISOString() },
        { content: 'How are you?', channelName: 'Support', timestamp: new Date().toISOString() },
    ],
    mostActiveServer: { name: 'Gaming Server', lastActivity: new Date().toISOString() },
    topLocations: [
        { name: 'Park Central', rating: 4.8 },
        { name: 'Library Plaza', rating: 4.5 },
    ],
};

describe('Dashboard Component', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.mockResponseOnce(JSON.stringify(mockFetchResponse));
    });

    const renderComponent = (isAuthenticated: boolean = true) =>
        render(
            <AuthContext.Provider value={{ ...mockAuthContext, isAuthenticated }}>
                <BrowserRouter>
                    <Dashboard />
                </BrowserRouter>
            </AuthContext.Provider>
        );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Dashboard page with a navbar and welcome message', async () => {
        renderComponent();

        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(await screen.findByText(/Welcome, John Doe/i)).toBeInTheDocument();
    });

    it('shows "No recent messages" if no recent messages are available', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({
                ...mockFetchResponse,
                recentMessages: [],
            })
        );

        renderComponent();

        const noMessagesText = await screen.findByText(/No recent messages!/i);
        expect(noMessagesText).toBeInTheDocument();
    });

    it('shows "No active servers" if no servers are available', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({
                ...mockFetchResponse,
                mostActiveServer: null,
            })
        );

        renderComponent();

        const noServersText = await screen.findByText(/No active servers!/i);
        expect(noServersText).toBeInTheDocument();
    });

    it('shows "No top-rated locations" if no locations are available', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({
                ...mockFetchResponse,
                topLocations: [],
            })
        );

        renderComponent();

        const noLocationsText = await screen.findByText(/No top-rated locations found!/i);
        expect(noLocationsText).toBeInTheDocument();
    });

    it('redirects unauthenticated users with a warning message', () => {
        renderComponent(false);

        const warningMessage = screen.getByText(
            /Please log in or create an account before attempting to access this page./i
        );
        expect(warningMessage).toBeInTheDocument();
    });

    it('navigates to the correct page on button click', async () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /view all messages/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/messages');

        fireEvent.click(screen.getByRole('button', { name: /view all servers/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/servers');

        fireEvent.click(screen.getByRole('button', { name: /view all locations/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/locations');
    });
});
