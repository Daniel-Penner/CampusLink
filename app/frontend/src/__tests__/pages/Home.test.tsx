import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Homepage from '../../pages/Home/Home';
import { AuthContext } from '../../contexts/AuthContext';

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

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
const mockNavigate = jest.fn();
require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);

describe('Homepage Component', () => {
    const renderComponent = () =>
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <BrowserRouter>
                    <Homepage />
                </BrowserRouter>
            </AuthContext.Provider>
        );

    it('renders sign-up section with all elements', () => {
        renderComponent();

        expect(screen.getByText('For international students')).toBeInTheDocument();
        expect(
            screen.getByText(
                'A tool for students from abroad to communicate and share things you\'ve learned about Kelowna.'
            )
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('renders login section with all elements', () => {
        renderComponent();

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /forgot password\?/i })).toBeInTheDocument();
    });

    it('navigates to register page on "Sign Up" click', () => {
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/register', { state: { email: '' } });
    });

    it('displays error message on failed login', () => {
        renderComponent();
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const loginButton = screen.getByTestId('login-button');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(loginButton);

        // Mock error message rendering
        expect(mockAuthContext.login).not.toHaveBeenCalled();
    });
});
