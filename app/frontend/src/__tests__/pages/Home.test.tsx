import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Homepage from '../../pages/Home/Home';
import { AuthContext } from '../../contexts/AuthContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const mockAuthContext = {
    login: jest.fn(),
    isAuthenticated: false,
    logout: jest.fn(),
    name: '',
    code: '',
    id: '',
};

describe('Homepage', () => {
    const renderComponent = () =>
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <BrowserRouter>
                    <Homepage />
                </BrowserRouter>
            </AuthContext.Provider>
        );

    it('renders the sign-up and login sections', () => {
        renderComponent();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
    });

    it('navigates to the register page when "Sign Up" is clicked', () => {
        renderComponent();
        const signUpButton = screen.getByText('Sign Up');
        fireEvent.click(signUpButton);
        expect(mockNavigate).toHaveBeenCalledWith('/register', {
            state: { email: '' },
        });
    });

    it('logs in successfully on valid credentials', async () => {
        renderComponent();

        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const loginButton = screen.getByRole('button', { name: 'Log In' });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(loginButton);

        expect(mockAuthContext.login).toHaveBeenCalled(); // Check login call
    });
});
