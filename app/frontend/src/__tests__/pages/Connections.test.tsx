import React from 'react'; // Import React for type definitions
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FriendsPage from '../../pages/Connections/Friends/Friends';
import IncomingRequestsPage from '../../pages/Connections/IncomingRequests/IncomingRequests';
import OutgoingRequestsPage from '../../pages/Connections/OutgoingRequests/OutgoingRequests';
import { AuthContext } from '../../contexts/AuthContext';

// Define the type for the React Component expected as a parameter
type ReactComponent = React.ComponentType;


// Helper function to render components within the appropriate providers
const renderWithContextAndRouter = (Component: ReactComponent) => {
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <BrowserRouter>
                <Component />
            </BrowserRouter>
        </AuthContext.Provider>
    );
};

const mockAuthContext = {
    isAuthenticated: true,
    user: null,
    name: 'John Doe',
    code: '12345',
    id: 'mockId',
    login: jest.fn(),
    logout: jest.fn(),
    profilePicture: 'default_profile.jpg',
    updateProfilePicture: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
};

describe('Connection Pages', () => {
    it('renders FriendsPage with necessary components', () => {
        renderWithContextAndRouter(FriendsPage);
        expect(screen.getByText('Friends')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    it('renders IncomingRequestsPage with necessary components', () => {
        renderWithContextAndRouter(IncomingRequestsPage);
        expect(screen.getByText('Incoming Requests')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });

    it('renders OutgoingRequestsPage with necessary components', () => {
        renderWithContextAndRouter(OutgoingRequestsPage);
        expect(screen.getByText('Outgoing Requests')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    });
});
