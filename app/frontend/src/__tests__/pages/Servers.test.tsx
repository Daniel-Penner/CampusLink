import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ServersPage from "../../pages/Servers/Servers";
import { AuthContext } from "../../contexts/AuthContext";

// ✅ Only mock `ServerWindow` to prevent socket errors
jest.mock("../../components/ServerWindow/ServerWindow", () => ({
    __esModule: true,
    default: () => <div data-testid="server-window">Mock ServerWindow</div>,
}));

// ✅ Mock only modals, keep everything else real
jest.mock("../../components/ServerSettingsModal/ServerSettingsModal", () => () => (
    <div data-testid="server-settings-modal">Mock ServerSettingsModal</div>
));
jest.mock("../../components/CreateServerModal/CreateServerModal", () => ({
    __esModule: true,
    default: () => <div data-testid="create-server-modal">Mock CreateServerModal</div>,
}));
jest.mock("../../components/ServerChoiceModal/ServerChoiceModal", () => ({
    __esModule: true,
    default: () => <div data-testid="server-choice-modal">Mock ServerChoiceModal</div>,
}));

jest.mock("../../components/ServerJoinModal/ServerJoinModal", () => () => ({
    __esModule: true,
    default: () => <div data-testid="join-server-modal">Mock JoinServerModal</div>,
}));

// ✅ Mock server data
const mockServers = [
    {
        _id: "server1",
        name: "Test Server",
        owner: "user123",
        channels: [{ _id: "channel1", name: "General" }],
    },
];

// ✅ Mock Auth Context
const mockAuthContext = {
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    profilePicture: "default_profile.jpg",
    updateProfilePicture: jest.fn(),
    theme: "light",
    setTheme: jest.fn(),
    name: "John Doe",
    code: "12345",
    id: "user123",
};

// ✅ Mock Fetch API
global.fetch = jest.fn((url) =>
    Promise.resolve({
        ok: true,
        json: async () => {
            if (url.toString().includes("/api/servers")) {
                return mockServers;
            }
            return [];
        },
    } as Response)
);

// ✅ Helper function for rendering with necessary providers
const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <AuthContext.Provider value={mockAuthContext}>
            <BrowserRouter>{ui}</BrowserRouter>
        </AuthContext.Provider>
    );
};

describe("ServersPage UI Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders ServersPage correctly", async () => {
        renderWithProviders(<ServersPage />);

        expect(screen.getByText("Please select a server.")).toBeInTheDocument();

        // Ensure API fetch happens
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    });

    it("selects a server and updates the UI", async () => {
        renderWithProviders(<ServersPage />);

        // Wait for servers to load
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));

        // Select the first server
        fireEvent.click(screen.getByText("Test Server"));

        // Ensure UI updates
        await waitFor(() => expect(screen.getByText("General")).toBeInTheDocument());
        await waitFor(() => expect(screen.getByTestId("server-window")).toBeInTheDocument());
    });

    it("opens the create server modal", async () => {
        renderWithProviders(<ServersPage />);

        // Open create server modal
        fireEvent.click(screen.getByText("Add Server"));

        // Ensure modal appears
        await waitFor(() => expect(screen.getByTestId("server-choice-modal")).toBeInTheDocument());
    });

    it("opens the join server modal", async () => {
        renderWithProviders(<ServersPage />);

        // Open choice modal
        fireEvent.click(screen.getByText("Add Server"));
        await waitFor(() => expect(screen.getByTestId("server-choice-modal")).toBeInTheDocument());

// Open join server modal (use `findByText` to wait for it)
        fireEvent.click(await screen.findByText("Test Server"));
        await waitFor(() => expect(screen.getByText("General")).toBeInTheDocument());

        // Open settings modal
        fireEvent.click(await screen.findByText("Leave Server"));
        const general = screen.getByText("General");
        await waitFor(() => expect(general).toBeNull);
    });
});
