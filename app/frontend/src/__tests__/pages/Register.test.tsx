import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../../pages/Register/Register";
import { AuthContext } from "../../contexts/AuthContext";

// Mock Auth Context to avoid the "AuthContext is not provided" error
const mockAuthContext = {
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    name: "",
    code: "",
    id: "",
    profilePicture: "",
    updateProfilePicture: jest.fn(),
    theme: "light",
    setTheme: jest.fn(),
};

// ✅ Ensure the test component is wrapped with AuthContext.Provider
const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <BrowserRouter>{ui}</BrowserRouter>
        </AuthContext.Provider>
    );
};

describe("Register Page UI Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it("renders all input fields and the register button", () => {
        renderWithProviders(<Register />);

        expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    });

    it("updates input fields on user input", () => {
        renderWithProviders(<Register />);

        const emailInput = screen.getByPlaceholderText("Email Address") as HTMLInputElement;
        const firstNameInput = screen.getByPlaceholderText("First Name") as HTMLInputElement;
        const lastNameInput = screen.getByPlaceholderText("Last Name") as HTMLInputElement;
        const passwordInput = screen.getByPlaceholderText("Password") as HTMLInputElement;
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm Password") as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(firstNameInput, { target: { value: "John" } });
        fireEvent.change(lastNameInput, { target: { value: "Doe" } });
        fireEvent.change(passwordInput, { target: { value: "TestPass123" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "TestPass123" } });

        expect(emailInput.value).toBe("test@example.com");
        expect(firstNameInput.value).toBe("John");
        expect(lastNameInput.value).toBe("Doe");
        expect(passwordInput.value).toBe("TestPass123");
        expect(confirmPasswordInput.value).toBe("TestPass123");
    });

    it("shows error message when passwords do not match", async () => {
        renderWithProviders(<Register />);

        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "TestPass123" } });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "Mismatch123" } });

        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
        });
    });

    it("submits form and shows success message on successful registration", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 201,
                json: async () => ({ message: "Registration Successful! Please verify your email to continue." }),
            } as Response)
        );

        renderWithProviders(<Register />);

        fireEvent.change(screen.getByPlaceholderText("Email Address"), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "TestPass123" } });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "TestPass123" } });

        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText("Registration Successful! Please verify your email to continue.")).toBeInTheDocument();
        });

        expect(fetch).toHaveBeenCalledWith("/api/auth/register", expect.anything());
    });

    it("shows error message on failed registration", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: async () => ({ message: "Email is already in use." }),
            } as Response)
        );

        renderWithProviders(<Register />);

        fireEvent.change(screen.getByPlaceholderText("Email Address"), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "TestPass123" } });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "TestPass123" } });

        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText("Email is already in use.")).toBeInTheDocument();
        });

        expect(fetch).toHaveBeenCalledWith("/api/auth/register", expect.anything());
    });
});
