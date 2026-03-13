import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { Settings } from "./Settings";

// Mocks
const navigateMock = vi.fn();
const signOutMock = vi.fn();

let darkMode = false;
let soundOn = false;

const onClose = vi.fn();
const setDarkMode = vi.fn((v) => (darkMode = v));
const setSoundOn = vi.fn((v) => (soundOn = v));

// React-router mock
vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock
}));

// Api mock
vi.mock("../../services/api", () => ({
    handleSignOut: () => signOutMock()
}));

// Theme hook mock
vi.mock("../../hooks/useTheme", () => ({
    useTheme: () => ({
        darkMode,
        setDarkMode
    })
}));

// Sound hook mock
vi.mock("../../hooks/useSound", () => ({
    useSound: () => ({
        soundOn,
        setSoundOn
    })
}));

// 
beforeEach(() => {
    vi.clearAllMocks();
    darkMode = false;
    soundOn = false;
});

// Tests

// Renders UI for settings popup with the option buttons
describe("Settings.render", () => {
    it("renders settings UI", () => {
        render(<Settings onClose={onClose} />);

        expect(screen.getByText("SETTINGS")).toBeInTheDocument();
        expect(screen.getByText("Light")).toBeInTheDocument();
        expect(screen.getByText("Dark")).toBeInTheDocument();
        expect(screen.getByText("Sound On")).toBeInTheDocument();
        expect(screen.getByText("Sound Off")).toBeInTheDocument();
    });
});

// Dark Mode calls on setDarkMode(false) with the Dark button and setDarkMode(true) with the Light button
describe("Settings.darkmode", () => {
    it("toggles dark mode", () => {
        render(<Settings onClose={onClose} />);

        fireEvent.click(screen.getByText("Dark"));

        expect(setDarkMode).toHaveBeenCalledWith(true);
    });

    it("toggles light mode", () => {
        darkMode = true;

        render(<Settings onClose={onClose} />);

        fireEvent.click(screen.getByText("Light"));

        expect(setDarkMode).toHaveBeenCalledWith(false);
    });
});

// Sound On calls setSoundOn(true) and Sound Off calls setSoundOn(False)
describe("Settings.sound", () => {
    it("toggles sound on", () => {
        render(<Settings onClose={onClose} />);

        fireEvent.click(screen.getByText("Sound On"));

        expect(setSoundOn).toHaveBeenCalledWith(true);
    });

    it("toggles sound off", () => {
        soundOn = true;

        render(<Settings onClose={onClose} />);

        fireEvent.click(screen.getByText("Sound Off"));

        expect(setSoundOn).toHaveBeenCalledWith(false);
    });
});

// Tne rules button opens up the rules screen while the close button closes it
describe("Settings.rules", () => {
    it("opens rules screen", () => {
        render(<Settings onClose={onClose} />);

        fireEvent.click(screen.getByRole("button", { name: "Rules" }));
        expect(
            screen.getByText(/Find Numbers that Match the Target Sum/i)
        ).toBeInTheDocument();
    });

    it("closes rules screen via close button", () => {
        render(<Settings onClose={onClose} />);

        fireEvent.click(screen.getByText("Rules"));
        fireEvent.click(screen.getByText("Close"));

        expect(
            screen.queryByText(/Find Numbers that Match the Target Sum/i)
        ).not.toBeInTheDocument();
    });
});

// Clicking the overlay around the settings box closes it
describe("Settings.close", () => {
    it("closes when overlay is clicked", () => {
        const { container } = render(<Settings onClose={onClose} />);

        const overlay = container.querySelector(".settings-overlay")!;

        fireEvent.click(overlay);

        expect(onClose).toHaveBeenCalled();
    });
});

// The signout button always navigates to login
describe("Settings.signout", () => {
    it("signs out and navigates to login", async () => {
        signOutMock.mockResolvedValueOnce(undefined);

        render(<Settings onClose={onClose} />);

        fireEvent.click(screen.getByText("Sign Out"));

        await waitFor(() => {
            expect(signOutMock).toHaveBeenCalled();
            expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
        });
    });

    it("still navigates to login if signout fails", async () => {
        signOutMock.mockRejectedValueOnce(new Error("fail"));

        render(<Settings onClose={onClose} />);

        fireEvent.click(screen.getByText("Sign Out"));

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
        });
    });
});