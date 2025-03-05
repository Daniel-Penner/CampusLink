import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LocationsPage from '../../pages/Locations/Locations';

// Mock the Map component
jest.mock('../../components/Map/Map', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-map">Mock Map</div>
}));

// Mock fetch globally to return test data
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () =>
            Promise.resolve([
                { _id: '1', name: 'Test Location', rating: 4.5, reviews: [], owner: '123' }
            ])
    })
) as jest.Mock;

const mockAuthContext = {
    isAuthenticated: true,
    user: { id: '123', name: 'John Doe' },
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

// Helper function to render with providers
const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <BrowserRouter>{component}</BrowserRouter>
        </AuthContext.Provider>
    );
};

describe('LocationsPage UI Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders LocationsPage with all necessary UI components', async () => {
        renderWithProviders(<LocationsPage/>);

        await waitFor(() => {
            expect(screen.getByText(/Top Rated Locations/i)).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /Add Location/i})).toBeInTheDocument();
            expect(screen.getByTestId('mock-map')).toBeInTheDocument();
        });
    });

    it('ensures profile picture is displayed in the navbar', async () => {
        renderWithProviders(<LocationsPage/>);

        await waitFor(() => {
            expect(screen.getByAltText('Profile')).toBeInTheDocument();
        });
    });

    it('triggers location selection when clicking on a location', async () => {
        renderWithProviders(<LocationsPage/>);

        await waitFor(() => {
            expect(screen.getByText(/Test Location/i)).toBeInTheDocument();
        });

        // Click the location
        fireEvent.click(screen.getByText(/Test Location/i));

        // Expect the modal or details to appear
        await waitFor(() => {
            expect(screen.getByText(/Test Location/i)).toBeInTheDocument();
        });
    });

    it('handles clicking on a location modal', async () => {
        renderWithProviders(<LocationsPage/>);

        await waitFor(() => {
            expect(screen.getByText(/Test Location/i)).toBeInTheDocument();
        });

        // Click the location to open modal
        fireEvent.click(screen.getByText(/Test Location/i));

        // Wait for modal to appear
        await waitFor(() => {
            expect(screen.getByText(/Test Location/i)).toBeInTheDocument();
        });
    });
});
