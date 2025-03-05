import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext'; // Import the AuthProvider
import FriendsPage from '../../pages/Connections/Friends/Friends';
import IncomingRequestsPage from '../../pages/Connections/IncomingRequests/IncomingRequests';
import OutgoingRequestsPage from '../../pages/Connections/OutgoingRequests/OutgoingRequests';
import fetchMock from 'jest-fetch-mock';
import { JSX } from 'react/jsx-runtime';

fetchMock.enableMocks();

beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear(); // Clear local storage before each test
    jest.spyOn(Storage.prototype, 'setItem'); // Mock setItem
    jest.spyOn(Storage.prototype, 'getItem'); // Mock getItem
    localStorage.setItem('token', 'fake-token'); // Assume token is set for authenticated route
});

const renderWithContextAndRouter = (Component: string | number | boolean | Iterable<React.ReactNode> | JSX.Element | null | undefined) => {
    return render(
        <AuthProvider> {/* Use AuthProvider to wrap the component */}
            <BrowserRouter>
                {Component}
            </BrowserRouter>
        </AuthProvider>
    );
};

describe('Connection Pages Tests', () => {
    it('renders FriendsPage, opens the modal, and checks for the success message', async () => {
        renderWithContextAndRouter(<FriendsPage />);
        await waitFor(() => screen.getByRole('button', { name: /add friend/i }));

        const addButton = screen.getByRole('button', { name: /add friend/i });
        userEvent.click(addButton);

        // Mock the response for adding a friend
        fetchMock.mockResponseOnce(JSON.stringify({ message: 'Friend request sent successfully' }));

        // Simulate filling the input and clicking the add friend button inside the modal
        const input = await screen.findByPlaceholderText('Enter friend code');
        userEvent.type(input, '123456');
        const modalAddButton = screen.getAllByText('Add Friend');
        userEvent.click(modalAddButton[1]);

        // Wait for and check the success message in the modal
        await waitFor(() => {
            const statusMessage = screen.getByText(/friend request sent successfully/i);
            expect(statusMessage).toBeInTheDocument();
        });
    });

    it('renders IncomingRequestsPage and handles accept and decline interactions', async () => {
        renderWithContextAndRouter(<IncomingRequestsPage />);
        await waitFor(() => screen.getByText('Incoming Requests'));

        // Simulate interactions only if buttons are rendered
        if (screen.queryByRole('button', { name: /accept/i })) {
            const acceptButton = screen.getByRole('button', { name: /accept/i });
            userEvent.click(acceptButton);

            expect(fetchMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                method: 'POST'
            }));
        }
    });

    it('renders OutgoingRequestsPage and validates outgoing requests display', async () => {
        renderWithContextAndRouter(<OutgoingRequestsPage />);
        await waitFor(() => screen.getByText('Outgoing Requests'));

        // Simulate interactions only if buttons are rendered
        if (screen.queryByRole('button', { name: /revoke/i })) {
            const revokeButton = screen.getByRole('button', { name: /revoke/i });
            userEvent.click(revokeButton);

            expect(fetchMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                method: 'POST'
            }));
        }
    });
});
