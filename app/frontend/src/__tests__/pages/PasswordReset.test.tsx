import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import PasswordReset from '../../pages/PasswordReset/PasswordReset';

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

// Mock Auth Context
const mockAuthContext = {
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    name: '',
    code: '',
    id: '',
    profilePicture: '',
    updateProfilePicture: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
};

// Render helper function
const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <BrowserRouter>{ui}</BrowserRouter>
        </AuthContext.Provider>
    );
};

// Mock fetch for password reset API call
global.fetch = jest.fn((url: string | Request | URL) =>
    Promise.resolve({
        ok: url.toString().includes('/api/auth/forgot-password'),
        json: async () =>
            url.toString().includes('/api/auth/forgot-password')
                ? { message: 'Password reset link sent! Please check your email.' }
                : { message: 'Password reset failed. Please try again.' },
    } as Response)
);

describe('Password Reset Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the password reset form correctly', () => {
        renderWithProviders(<PasswordReset />);

        // Check for form elements
        expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('submits the form successfully and displays success message', async () => {
        renderWithProviders(<PasswordReset />);

        // Enter email
        fireEvent.change(screen.getByPlaceholderText('Email Address'), {
            target: { value: 'test@example.com' },
        });

        // Click submit
        fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

        // Check for success message
        await waitFor(() =>
            expect(screen.getByText('Password reset link sent! Please check your email.')).toBeInTheDocument()
        );
    });

    it('shows an error if the password reset fails', async () => {
        // Modify fetch to simulate a failed response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Password reset failed. Please try again.' }),
        });

        renderWithProviders(<PasswordReset />);

        // Enter email
        fireEvent.change(screen.getByPlaceholderText('Email Address'), {
            target: { value: 'invalid@example.com' },
        });

        // Click submit
        fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

        // Check for failure message
        await waitFor(() =>
            expect(screen.getByText('Password reset failed. Please try again.')).toBeInTheDocument()
        );
    });
});
