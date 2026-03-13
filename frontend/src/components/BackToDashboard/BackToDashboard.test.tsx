import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import BackToDashboard from "./BackToDashboard";

// Mock
const navigate = vi.fn();

// React-router mock
vi.mock("react-router-dom", () => ({
    useNavigate: () => navigate
}));

// The back to dashboard button successfully renders
describe("BackToDashboard.render", () => {
    it("renders the button", () => {
        render(<BackToDashboard />);

        expect(
            screen.getByRole("button", { name: /back to dashboard/i })
        ).toBeInTheDocument();
    });
});

// Upon clicking back to dashboard, navigate to the dashboard page
describe("BackToDashboard.navigate", () => {
    it("navigates to dashboard when clicked", () => {
        render(<BackToDashboard />);

        const button = screen.getByRole("button", {
            name: /back to dashboard/i
        });

        fireEvent.click(button);

        expect(navigate).toHaveBeenCalledWith("/dashboard");
    });
});