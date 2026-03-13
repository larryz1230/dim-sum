import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Auth mock
vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn()
}));

// React-router mock
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Outlet: () => <div>Protected Content</div>,
    Navigate: ({ to }: any) => <div>Redirected to {to}</div>
  };
});

// The loading state is rendered when useAuth is loading
describe("ProtectedRoute.loading", () => {
    it("shows loading state when auth is loading", () => {
        (useAuth as any).mockReturnValue({
            user: null,
            loading: true
        });

        render(
            <MemoryRouter>
            <ProtectedRoute />
            </MemoryRouter>
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
});

// The protected content is rendered if the user is authenticaed
describe("ProtectedRoute.auth", () => {
    it("renders protected content when user is authenticated", () => {
        (useAuth as any).mockReturnValue({
            user: { id: "1", name: "test" },
            loading: false
        });

        render(
            <MemoryRouter>
            <ProtectedRoute />
            </MemoryRouter>
        );

        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
});

// Navigate to the login page if the user is not authenticated
describe("ProtectedRoute.notauth", () => {
    it("redirects to login when user is not authenticated", () => {
        (useAuth as any).mockReturnValue({
            user: null,
            loading: false
        });

        render(
            <MemoryRouter>
            <ProtectedRoute />
            </MemoryRouter>
        );

        expect(screen.getByText("Redirected to /login")).toBeInTheDocument();
    });
});