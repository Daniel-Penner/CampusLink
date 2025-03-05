import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import VerifyEmailChange from "../../pages/VerifyEmailChange/VerifyEmailChange";

global.fetch = jest.fn(); // Mock global fetch function

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => ({ token: "mock-token" }),
}));

describe("VerifyEmailChange Page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("displays loading message initially", () => {
        render(
            <BrowserRouter>
                <VerifyEmailChange/>
            </BrowserRouter>
        );

        expect(screen.getByText("Verifying your email...")).toBeInTheDocument();
    });

    it("handles successful verification and redirects to profile", async () => {
        // Mock successful API response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({message: "Email verified successfully!"}),
        });

        render(
            <MemoryRouter initialEntries={["/verify-email-change/mock-token"]}>
                <Routes>
                    <Route path="/verify-email-change/:token" element={<VerifyEmailChange/>}/>
                </Routes>
            </MemoryRouter>
        );

        // Expect loading message initially
        expect(screen.getByText("Verifying your email...")).toBeInTheDocument();

        // Wait for success message
        await waitFor(() => expect(screen.getByText("Email verified successfully! Redirecting...")).toBeInTheDocument());

        // Ensure redirection after 3 seconds
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/profile"), {timeout: 3500});
    });

    it("handles verification failure and displays error message", async () => {
        // Mock failure API response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: jest.fn().mockResolvedValue({message: "Invalid or expired token."}),
        });

        render(
            <MemoryRouter initialEntries={["/verify-email-change/mock-token"]}>
                <Routes>
                    <Route path="/verify-email-change/:token" element={<VerifyEmailChange/>}/>
                </Routes>
            </MemoryRouter>
        );

        // Expect loading message initially
        expect(screen.getByText("Verifying your email...")).toBeInTheDocument();

        // Wait for error message
        await waitFor(() => expect(screen.getByText("Invalid or expired token.")).toBeInTheDocument());
    });

    it("handles network errors gracefully", async () => {
        // Mock network error
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

        render(
            <MemoryRouter initialEntries={["/verify-email-change/mock-token"]}>
                <Routes>
                    <Route path="/verify-email-change/:token" element={<VerifyEmailChange/>}/>
                </Routes>
            </MemoryRouter>
        );

        // Expect loading message initially
        expect(screen.getByText("Verifying your email...")).toBeInTheDocument();

        // Wait for generic error message
        await waitFor(() => expect(screen.getByText("An error occurred. Please try again.")).toBeInTheDocument());
    });
});
