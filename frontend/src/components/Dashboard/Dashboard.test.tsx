import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "./Dashboard";
import { MemoryRouter } from "react-router-dom";

// Mocks
const navigate = vi.fn();

// React-router mock
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => navigate,
        useLocation: () => ({ pathname: "/dashboard", state: {} })
    };
});

// Sound mocks
vi.mock("../../hooks/useSound", () => ({
    useSound: () => ({ soundOn: false })
}));

vi.mock("../../utils/sound", () => ({
    getBgMusic: () => ({ play: vi.fn() }),
    stopBgMusic: vi.fn()
}));

// Expanded option mocks
vi.mock("./ProfileExpanded/ProfileExpanded", () => ({
    default: () => <div>Profile Expanded</div>
}));

vi.mock("./LeaderboardExpanded/LeaderboardExpanded", () => ({
    default: () => <div>Leaderboard Expanded</div>
}));

// Matchmake popup mock
vi.mock("../MatchmakePopup/MatchmakePopup", () => ({
  default: ({ onClose }: any) => (
    <div>
        MatchmakePopup
        <button onClick={onClose}>Close Popup</button>
    </div>
  )
}));

// Settings mock
vi.mock("../Settings/Settings", () => ({
  Settings: ({ onClose, onLoginClick }: any) => (
    <div>
        Settings
        <button onClick={onLoginClick}>Login</button>
        <button onClick={onClose}>Close Settings</button>
    </div>
  )
}));

// Login mock
vi.mock("../Login/Login", () => ({
  Login: ({ onClose }: any) => (
    <div>
        Login
        <button onClick={onClose}>Close Login</button>
    </div>
  )
}));

// Tests

// Dashboard renders the navigation buttons for singleplayer, multiplayer, profile, leaderboard
describe("Dashboard.render", () => {
    it("renders main buttons", () => {
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByText("Singleplayer")).toBeInTheDocument();
        expect(screen.getByText("Multiplayer")).toBeInTheDocument();
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    });
});

// Upon clicking the buttons, navigate to the corresponding page
describe("Dashboard.navigate", () => {
    it("navigates to game when singleplayer clicked", () => {
        render(
            <MemoryRouter>
            <Dashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Singleplayer"));

        expect(navigate).toHaveBeenCalledWith("/game");
    });

    it("navigates home when home button clicked", () => {
        render(
            <MemoryRouter>
            <Dashboard />
            </MemoryRouter>
        );

        const homeButton = screen.getByAltText("Home");
        fireEvent.click(homeButton);

        expect(navigate).toHaveBeenCalledWith("/");
    });
});

// Buttons for profile and leaderboard expand within the dashboard page
describe("Dashboard.expanded", () => {
    it("opens profile panel", () => {
        render(
            <MemoryRouter>
            <Dashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Profile"));

        expect(screen.getByText("Profile Expanded")).toBeInTheDocument();
    });

    it("opens leaderboard panel", () => {
        render(
            <MemoryRouter>
            <Dashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Leaderboard"));

        expect(screen.getByText("Leaderboard Expanded")).toBeInTheDocument();
    });

    // Back button returns to the main view of 4 buttons, including singleplayer
    it("back button closes panel", () => {
        render(
            <MemoryRouter>
            <Dashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Profile"));

        const backButton = screen.getByAltText("Back");
        fireEvent.click(backButton);

        expect(screen.getByText("Singleplayer")).toBeInTheDocument();
    });
});

// Multiplayer button opens a matchmake popup
describe("Dashboard.multiplayer", () => {
    it("opens matchmake popup", () => {
        render(
            <MemoryRouter>
            <Dashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText("Multiplayer"));

        expect(screen.getByText("MatchmakePopup")).toBeInTheDocument();
    });
});

// Setting button opens the settings popup
describe("Dashboard.settings", () => {
    it("opens settings", () => {
        render(
            <MemoryRouter>
            <Dashboard />
            </MemoryRouter>
        );

        const settingsButton = screen.getByAltText("Settings");
        fireEvent.click(settingsButton);

        expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("opens login from settings", () => {
        render(
            <MemoryRouter>
            <Dashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByAltText("Settings"));
        fireEvent.click(screen.getByText("Login"));

        expect(screen.getByText("Login")).toBeInTheDocument();
    });
});