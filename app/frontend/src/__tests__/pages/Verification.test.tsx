import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import EmailVerification from "../../pages/Verification/Verification";

global.fetch = jest.fn(); // Mock the global fetch function

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => ({ token: "mock-token" }),
}));

describe("EmailVerification Page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("displays loading message initially", () => {
        render(
            <BrowserRouter>
                <EmailVerification />
            </BrowserRouter>
        );

        expect(screen.getByText("Verifying your email...")).toBeInTheDocument();
    });

    it("handles successful verification and redirects to login", async () => {
        // Mock successful API response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ message: "Verified successfully" }),
        });

        render(
            <MemoryRouter initialEntries={["/verify/mock-token"]}>
                <Routes>
                    <Route path="/verify/:token" element={<EmailVerification />} />
                </Routes>
            </MemoryRouter>
        );

        // Expect loading message initially
        expect(screen.getByText("Verifying your email...")).toBeInTheDocument();

        // Wait for the success message to appear
        await waitFor(() => expect(screen.getByText("Email verified! Redirecting to the login page...")).toBeInTheDocument());

        // Ensure redirection after 3 seconds
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"), { timeout: 3500 });
    });

    it("handles verification failure and displays error message", async () => {
        // Mock failure API response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: jest.fn().mockResolvedValue({ message: "Invalid or expired token" }),
        });

        render(
            <MemoryRouter initialEntries={["/verify/mock-token"]}>
                <Routes>
                    <Route path="/verify/:token" element={<EmailVerification />} />
                </Routes>
            </MemoryRouter>
        );

        // Expect loading message initially
        expect(screen.getByText("Verifying your email...")).toBeInTheDocument();

        // Wait for error message to appear
        await waitFor(() => expect(screen.getByText("Invalid or expired token")).toBeInTheDocument());
    });

    it("handles network error gracefully", async () => {
        // Mock network error
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

        render(
            <MemoryRouter initialEntries={["/verify/mock-token"]}>
                <Routes>
                    <Route path="/verify/:token" element={<EmailVerification />} />
                </Routes>
            </MemoryRouter>
        );

        // Expect loading message initially
        expect(screen.getByText("Verifying your email...")).toBeInTheDocument();

        // Wait for generic error message
        await waitFor(() => expect(screen.getByText("An error occurred. Please try again.")).toBeInTheDocument());
    });
});
