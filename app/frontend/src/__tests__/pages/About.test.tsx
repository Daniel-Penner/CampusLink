import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import About from '../../pages/About/About';
import { AuthContext } from '../../contexts/AuthContext';

// Ensure the mock matches the expected context type
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
    id: '123' // Depending on your context, this might not be necessary here
};

// Utility function to render the component within the needed providers
const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </AuthContext.Provider>
    );
};

describe('About Page', () => {
    it('should render the about information correctly', () => {
        renderWithProviders(<About />);

        expect(screen.getByText('About CampusLink')).toBeInTheDocument();
        expect(screen.getByText('CampusLink is a prototype web application developed as a proof of concept social networking platform for international students studying at UBCO. With this site, I hope to provide a way for international students to meet, discuss shared interests, seek academic mentorship, and work together to explore local businesses in Kelowna.')).toBeInTheDocument();
        expect(screen.getByText('What CampusLink Offers')).toBeInTheDocument();
        expect(screen.getAllByText(/establishing friendships/i)).toHaveLength(1);
        expect(screen.getByText('Our Mission')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /join now/i })).toHaveAttribute('href', '/register');
    });

    it('navigates to register page on "Join Now" click', () => {
        renderWithProviders(<About />);
        const joinNowButton = screen.getByRole('link', { name: /join now/i });
        expect(joinNowButton).toHaveAttribute('href', '/register');
    });
});
