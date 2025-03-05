import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import PasswordResetForm from '../../pages/NewPassword/NewPassword';

// Mock `useParams` to return a fake token
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ token: 'test-token' }),
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
        ok: url.toString().includes('/api/auth/reset-password'),
        json: async () =>
            url.toString().includes('/api/auth/reset-password')
                ? { message: 'Password successfully reset. Redirecting...' }
                : { message: 'Password reset failed. Please try again.' },
    } as Response)
);

describe('Password Reset Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the password reset form correctly', () => {
        renderWithProviders(<PasswordResetForm />);

        // Check for form fields using test IDs
        expect(screen.getByTestId('new-password')).toBeInTheDocument();
        expect(screen.getByTestId('confirm-password')).toBeInTheDocument();
        expect(screen.getByText(/Reset Your Password/i)).toBeInTheDocument();
    });

    it('shows error when passwords do not match', async () => {
        renderWithProviders(<PasswordResetForm />);

        // Enter passwords (mismatched)
        fireEvent.change(screen.getByTestId('new-password'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByTestId('confirm-password'), {
            target: { value: 'DifferentPass!' },
        });

        // Click submit
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

        // Check error message
        await waitFor(() => expect(screen.getByText('Passwords do not match')).toBeInTheDocument());
    });

    it('submits form successfully and displays success message', async () => {
        renderWithProviders(<PasswordResetForm />);

        // Enter matching passwords
        fireEvent.change(screen.getByTestId('new-password'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByTestId('confirm-password'), {
            target: { value: 'Password123!' },
        });

        // Click submit
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

        // Check for success message
        await waitFor(() =>
            expect(screen.getByText('Password successfully reset. Redirecting...')).toBeInTheDocument()
        );
    });

    it('shows an error if the password reset fails', async () => {
        // Modify fetch to simulate a failed response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Password reset failed. Please try again.' }),
        });

        renderWithProviders(<PasswordResetForm />);

        // Enter matching passwords
        fireEvent.change(screen.getByTestId('new-password'), {
            target: { value: 'Password123!' },
        });
        fireEvent.change(screen.getByTestId('confirm-password'), {
            target: { value: 'Password123!' },
        });

        // Click submit
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

        // Check for failure message
        await waitFor(() =>
            expect(screen.getByText('Password reset failed. Please try again.')).toBeInTheDocument()
        );
    });
});
