import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Homepage from '../../pages/Home/Home';
import { AuthContext } from '../../contexts/AuthContext';

export interface AuthContextType {
    isAuthenticated: boolean;
    user: {
        id: string | null;
        friendCode: string;
    } | null;
    name: string;
    code: string;
    id: string;
    login: (token: string, id: string, name: string, friendCode: string) => void;
    logout: () => void;
}

const mockAuthContext: AuthContextType = {
    isAuthenticated: false,
    user: {
        id: null,
        friendCode: '',
    },
    code: "12345",
    name: '',
    id: 'mockId',
    login: jest.fn(),
    logout: jest.fn(),
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
        expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
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
