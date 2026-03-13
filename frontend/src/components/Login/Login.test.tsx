import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Login } from "./Login";

// Mock Images
vi.mock("../../imgs/Happy Bun.png", () => ({ default: "happy.png" }));
vi.mock("../../imgs/Sad Bun.png", () => ({ default: "sad.png" }));

// Hoisted Mocks
const { mockHandleLogin, mockHandleSignup, setAuthTokenMock } = vi.hoisted(() => {
  return {
    mockHandleLogin: vi.fn(),
    mockHandleSignup: vi.fn(),
    setAuthTokenMock: vi.fn(),
  };
});

// Mock API
vi.mock("../../services/api", () => ({
  handleLogin: mockHandleLogin,
  handleSignUp: mockHandleSignup,
}));

// Mock Socket Singleton
vi.mock("../../Socket", () => ({
  default: {
    setAuthToken: setAuthTokenMock,
  },
}));

// Checks whether or not the login window closes after successful login
const onClose = vi.fn();

// Reset mocks before every test
beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
});

// Tests

// Login renders with Email and Password fields
describe("Login.render", () => {
  it("renders a login form", () => {
    render(<Login onClose={onClose} />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });
});

// Given a token and with filled email and password fields, login is successful
describe("Login.success", () => {
  it("successfully logs in with token, sets socket, and closes", async () => {
    mockHandleLogin.mockResolvedValueOnce({
        data: { session: { access_token: "fakeToken" } },
        error: null,
    });

    render(<Login onClose={onClose} />);
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "pass123" } });
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
        expect(setAuthTokenMock).toHaveBeenCalledWith("fakeToken");
        expect(onClose).toHaveBeenCalled();
    });
  });
});

// Login is unsuccessful, either by invalid credentials error or no given session token
describe("Login.invalid", () => {
    it("login renders an invalid state when invalid credentials are supplied", async() => {
        mockHandleLogin.mockResolvedValueOnce({
            data: null,
            error: new Error("Invalid credentials"),
        });

        render(<Login onClose={onClose} />);

        fireEvent.click(screen.getByText("Login"));
            await waitFor(() => {
            expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        });
    });

    it ("login renders an invalid state when login succeeds but no token supplied", async() => {
        mockHandleLogin.mockResolvedValueOnce({
            data: { session: {} },
            error: null,
        });

        render(<Login onClose={onClose} />);

        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "user@test.com" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "pass456" } });
        fireEvent.click(screen.getByText("Login"));
        await waitFor(() => {
            expect(screen.getByText("Login succeeded but no session token found.")).toBeInTheDocument();
        });
    });
});

// Handles signup calls
describe("Login.signup", () => {
  it("successful signup calls alert and closes", async () => {
    mockHandleSignup.mockResolvedValueOnce({
      data: {}, 
      error: null 
    });

    render(<Login onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "new@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "pass123" } });
    fireEvent.click(screen.getByText("Signup"));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        "Registration successful! Please check your email to verify your account before logging in."
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("signup fails with normal error", async () => {
    mockHandleSignup.mockResolvedValueOnce({
      data: null, 
      error: new Error("Invalid signup")
    });

    render(<Login onClose={onClose} />);
    fireEvent.click(screen.getByText("Signup"));

    await waitFor(() => {
      expect(screen.getByText("Invalid signup")).toBeInTheDocument();
    });
  });

  it("signup fails with rate limit error", async () => {
    mockHandleSignup.mockResolvedValueOnce({ 
      data: null, 
      error: new Error("429 rate limit") 
    });

    render(<Login onClose={onClose} />);
    fireEvent.click(screen.getByText("Signup"));

    await waitFor(() => {
      expect(screen.getByText(
          "Too many signup attempts. Please wait a few minutes and try again, or use a different email address."
      )).toBeInTheDocument();
    });
  });

  it("signup throws network/fetch error", async () => {
    mockHandleSignup.mockRejectedValueOnce(
      new Error("Network failure")
    );

    render(<Login onClose={onClose} />);
    fireEvent.click(screen.getByText("Signup"));

    await waitFor(() => {
      expect(screen.getByText("Network failure")).toBeInTheDocument();
    });
  });
});