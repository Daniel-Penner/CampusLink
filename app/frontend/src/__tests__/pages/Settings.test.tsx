import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import Settings from "../../pages/Settings/Settings";

describe("Settings Page", () => {
    const mockSetTheme = jest.fn(); // ✅ Ensure mockSetTheme is correctly used

    const mockAuthContext = {
        isAuthenticated: true,
        user: null,
        name: "John Doe",
        code: "12345",
        id: "mockId",
        login: jest.fn(),
        logout: jest.fn(),
        profilePicture: "default_profile.jpg",
        updateProfilePicture: jest.fn(),
        theme: "light",
        setTheme: mockSetTheme, // ✅ Assign the correctly declared mock function
    };

    const renderWithProviders = () =>
        render(
            <AuthContext.Provider value={mockAuthContext}>
                <BrowserRouter>
                    <Settings />
                </BrowserRouter>
            </AuthContext.Provider>
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the Settings page correctly", () => {
        renderWithProviders();

        expect(screen.getByText("Settings")).toBeInTheDocument();
        expect(screen.getByText("Choose your preferred color theme:")).toBeInTheDocument();
    });

    it("renders all theme buttons", () => {
        renderWithProviders();

        expect(screen.getByText("Default Theme")).toBeInTheDocument();
        expect(screen.getByText("Light Theme")).toBeInTheDocument();
        expect(screen.getByText("Blue Theme")).toBeInTheDocument();
    });

    it("calls setTheme when a theme button is clicked", () => {
        renderWithProviders();

        const lightThemeButton = screen.getByText("Light Theme");
        fireEvent.click(lightThemeButton);

        expect(mockSetTheme).toHaveBeenCalledTimes(1);
        expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("applies active theme styling to selected button", () => {
        renderWithProviders();

        const defaultButton = screen.getByText("Default Theme");
        expect(defaultButton).toHaveClass("p-3 rounded-md bg-lighterGrey text-text hover:bg-buttonHover transition-all");
    });
});
