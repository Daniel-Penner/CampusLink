import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Login from "../../pages/Login/Login";

const mockAuthContext = {
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    profilePicture: 'default_profile.jpg',
    updateProfilePicture: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
    name: 'John Doe',
    code: '12345',
    id: '123',
};


// Mock Fetch API globally
global.fetch = jest.fn();

const renderWithProviders = (component: React.ReactNode) => {
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <BrowserRouter>{component}</BrowserRouter>
        </AuthContext.Provider>
    );
};

describe("Login Page Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the login page with all necessary elements", () => {
        renderWithProviders(<Login />);

        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
        expect(screen.getByText(/Forgot Password?/i)).toBeInTheDocument();
    });

    it("handles user input correctly", () => {
        renderWithProviders(<Login />);

        const emailInput = screen.getByPlaceholderText(/Email Address/i);
        const passwordInput = screen.getByPlaceholderText(/Password/i);

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });

        expect(emailInput).toHaveValue("test@example.com");
        expect(passwordInput).toHaveValue("password123");
    });

    it("shows error message when login fails", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ message: "Invalid credentials" }),
        });

        renderWithProviders(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: "wrong@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "wrongpassword" } });

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));

        await waitFor(() => expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument());
    });

    it("navigates to the dashboard on successful login", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    token: "mockToken",
                    user: { id: "123", firstName: "John", lastName: "Doe", friendCode: "12345" },
                }),
        });

        renderWithProviders(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "password123" } });

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));

        await waitFor(() => {
            expect(mockAuthContext.login).toHaveBeenCalledWith("mockToken", "123", "John Doe", "12345");
        });
    });

    it("shows 'Resend Verification' button when account is not verified", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ message: "This account is not yet verified" }),
        });

        renderWithProviders(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "password123" } });

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));

        await waitFor(() => {
            expect(screen.getByText(/This account is not yet verified/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Resend Verification Email/i })).toBeInTheDocument();
        });
    });

    it("handles resending verification email", async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ message: "This account is not yet verified" }),
        });

        renderWithProviders(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "password123" } });

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /Resend Verification Email/i })).toBeInTheDocument();
        });

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({}),
        });

        fireEvent.click(screen.getByRole("button", { name: /Resend Verification Email/i }));

        await waitFor(() => {
            expect(screen.getByText(/Verification email resent successfully/i)).toBeInTheDocument();
        });
    });

    it("shows server error when fetch fails", async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

        renderWithProviders(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: "password123" } });

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));

        await waitFor(() => {
            expect(screen.getByText(/Server error/i)).toBeInTheDocument();
        });
    });
});
