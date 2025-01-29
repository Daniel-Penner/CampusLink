import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FriendsPage from '../../pages/Connections/Friends/Friends';
import { AuthContext } from '../../contexts/AuthContext';

// Mocking Fetch
global.fetch = jest.fn();

// Mock Auth Context with all required properties
const mockAuthContext = {
    isAuthenticated: true,
    id: 'mockUserId',
    user: { id: 'mockUserId' },
    name: 'John Doe', // Add missing property
    code: '12345',    // Add missing property
    login: jest.fn(),
    logout: jest.fn(),
};


// Mock Friends Data
const mockFriendsData = [
    {
        _id: '1',
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: '',
        bio: 'Loves coding',
    },
    {
        _id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        profilePicture: 'jane.jpg',
        bio: 'Enjoys hiking',
    },
];

describe('FriendsPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url === '/api/connections/friends') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockFriendsData),
                });
            }
            return Promise.reject(new Error('Unknown API endpoint'));
        });
    });

    const renderComponent = () =>
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <BrowserRouter>
                    <FriendsPage />
                </BrowserRouter>
            </AuthContext.Provider>
        );

    it('renders the FriendsPage with navbar and major components', async () => {
        renderComponent();

        expect(screen.getByRole('navigation')).toBeInTheDocument(); // Navbar exists
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument(); // Search input exists

        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/connections/friends', expect.any(Object)));
    });

//still have more tests to write here
});
