import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import UpdateProfile from "../../pages/Profile/Profile";

// Mock useNavigate from react-router-dom
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => jest.fn(),
}));

// Mock Auth Context
const mockAuthContext = {
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    id: "123",
    name: "John Doe",
    code: "abc123",
    profilePicture: "https://example.com/profile.jpg",
    updateProfilePicture: jest.fn(),
    theme: "light",
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

describe("UpdateProfile Page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders UpdateProfile form correctly", () => {
        renderWithProviders(<UpdateProfile />);
        
        expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Bio/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Current Password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/New Password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Update Profile/i })).toBeInTheDocument();
    });

    it("allows users to enter text in input fields", () => {
        renderWithProviders(<UpdateProfile />);

        // Simulate user input
        fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: "Alice" } });
        fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: "Smith" } });
        fireEvent.change(screen.getByPlaceholderText(/Bio/i), { target: { value: "Software Developer" } });
        fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: "alice@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/Current Password/i), { target: { value: "oldpassword" } });
        fireEvent.change(screen.getByPlaceholderText(/New Password/i), { target: { value: "newpassword123" } });

        // Verify input values
        expect(screen.getByPlaceholderText(/First Name/i)).toHaveValue("Alice");
        expect(screen.getByPlaceholderText(/Last Name/i)).toHaveValue("Smith");
        expect(screen.getByPlaceholderText(/Bio/i)).toHaveValue("Software Developer");
        expect(screen.getByPlaceholderText(/Email Address/i)).toHaveValue("alice@example.com");
        expect(screen.getByPlaceholderText(/Current Password/i)).toHaveValue("oldpassword");
        expect(screen.getByPlaceholderText(/New Password/i)).toHaveValue("newpassword123");
    });


    it("displays an error message when update fails", async () => {
        renderWithProviders(<UpdateProfile />);

        // Mock failed API response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: async () => ({ message: "Error updating profile" }),
            } as Response)
        );

        // Click update button
        fireEvent.click(screen.getByRole("button", { name: /Update Profile/i }));

        // Expect error message
        await waitFor(() => expect(screen.getByText(/Error updating profile/i)).toBeInTheDocument());
    });

    it("displays a success message when update is successful", async () => {
        renderWithProviders(<UpdateProfile />);

        // Mock successful API response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: async () => ({ message: "Profile updated successfully!" }),
            } as Response)
        );

        // Click update button
        fireEvent.click(screen.getByRole("button", { name: /Update Profile/i }));

        // Expect success message
        await waitFor(() => expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument());
    });
});
