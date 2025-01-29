import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LocationsPage from '../../pages/Locations/Locations';
import { AuthContext } from '../../contexts/AuthContext';

// Mock useNavigate from React Router
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
const mockNavigate = jest.fn();
require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);

const mockAuthContext = {
    isAuthenticated: true,
    user: { id: 'mockUserId', friendCode: '12345' },
    name: 'John Doe',
    code: '12345',
    id: 'mockId',
    login: jest.fn(),
    logout: jest.fn(),
};

describe('LocationsPage Component', () => {
    beforeEach(() => {
        global.fetch = jest.fn((url) => {
            if (url === '/api/locations') {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve([
                            {
                                _id: '1',
                                name: 'Location A',
                                description: 'Description A',
                                rating: 4.5,
                                reviews: [],
                                owner: 'user1',
                            },
                            {
                                _id: '2',
                                name: 'Location B',
                                description: 'Description B',
                                rating: 4.0,
                                reviews: [{}, {}],
                                owner: 'user2',
                            },
                        ]),
                });
            }
            return Promise.reject(new Error('Unknown API endpoint'));
        }) as jest.Mock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = () =>
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <BrowserRouter>
                    <LocationsPage />
                </BrowserRouter>
            </AuthContext.Provider>
        );

    it('renders the LocationsPage with navbar and major components', async () => {
        renderComponent();

        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add Location/i })).toBeInTheDocument();

        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/locations', expect.any(Object)));
        expect(screen.getByText(/Location A/)).toBeInTheDocument();
        expect(screen.getByText(/Location B/)).toBeInTheDocument();
    });

    it('opens the modal when a location is clicked', async () => {
        renderComponent();

        await waitFor(() => expect(screen.getByText(/Location A/)).toBeInTheDocument());

        fireEvent.click(screen.getByText(/Location A/));
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Close/i }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens the location creation modal when "Add Location" is clicked', async () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /Add Location/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('saves a new location when submitted in the creation modal', async () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /Add Location/i }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/locations/create', expect.any(Object));
        });
    });

    it('opens and closes the edit modal for a location', async () => {
        renderComponent();

        await waitFor(() => expect(screen.getByText(/Location A/)).toBeInTheDocument());

        fireEvent.click(screen.getByText(/Location A/));
        fireEvent.click(screen.getByRole('button', { name: /Edit/i }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Close/i }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('fetches and displays sorted locations', async () => {
        renderComponent();

        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/locations', expect.any(Object)));
        const locationItems = screen.getAllByText(/Location/);

        expect(locationItems[0]).toHaveTextContent('Location A');
        expect(locationItems[1]).toHaveTextContent('Location B');
    });

    it('navigates correctly when a location is clicked', async () => {
        renderComponent();

        await waitFor(() => expect(screen.getByText(/Location A/)).toBeInTheDocument());

        fireEvent.click(screen.getByText(/Location A/));
        fireEvent.click(screen.getByRole('button', { name: /More Info/i }));

        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/location/1'));
    });
});
