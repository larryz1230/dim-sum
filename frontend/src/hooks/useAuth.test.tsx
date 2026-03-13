import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./useAuth";
import { __mocks__ } from "../services/supabaseClient";

// Supabase mock
vi.mock("../services/supabaseClient", () => {
    const getSessionMock = vi.fn();
    const signOutMock = vi.fn();
    const onAuthStateChangeMock = vi.fn();
    const singleMock = vi.fn();

    const supabase = {
        auth: {
            getSession: getSessionMock,
            signOut: signOutMock,
            onAuthStateChange: onAuthStateChangeMock,
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: singleMock,
                }),
            }),
        }),
    };

    return {
        supabase,
        __mocks__: {
            getSessionMock,
            signOutMock,
            onAuthStateChangeMock,
            singleMock,
        },
    };
});

const {
    getSessionMock,
    signOutMock,
    onAuthStateChangeMock,
    singleMock,
} = __mocks__;

beforeEach(() => {
    vi.clearAllMocks();

    getSessionMock.mockResolvedValue({
        data: {
            session: {
                user: {
                    id: "user-1",
                    email: "test@test.com",
                },
            },
        },
    });

    singleMock.mockResolvedValue({
        data: {
            rating: 1200,
            username: "tester",
            matches_played: 10,
            wins: 6,
            losses: 3,
            ties: 1,
        },
        error: null,
    });

    onAuthStateChangeMock.mockReturnValue({
        data: {
            subscription: {
                unsubscribe: vi.fn(),
            },
        },
    });
});

// Tests

// An error is thrown if useAuth is called outside its protector
describe("useAuth.error", () => {
    it("throws if used outside AuthProvider", () => {
        expect(() => renderHook(() => useAuth())).toThrow(
        "useAuth must be used within AuthProvider"
        );
    });
});

// Auth correctly loads user data from supabase
describe("useAuth.data", () => {
    it("loads session and profile data", async () => {
        const wrapper = ({ children }: any) => (
            <AuthProvider>
                {children}
            </AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.user?.id).toBe("user-1");
        });

        expect(result.current.username).toBe("tester");
        expect(result.current.rating).toBe(1200);
        expect(result.current.matchesPlayed).toBe(10);
    });
});

// Auth refreshes profile by fetching data after some time 
describe("useAuth.refresh", () => {
    it("refreshProfile refetches data", async () => {
        const wrapper = ({ children }: any) => (
            <AuthProvider>
                {children}
            </AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => result.current.user !== null);

        await result.current.refreshProfile();

        expect(singleMock).toHaveBeenCalled();
    });
});

// Upon signout, current user data is reset to be null
describe("useAuth.clear", () => {
    it("clears profile on logout event", async () => {
        let callback: any;

        onAuthStateChangeMock.mockImplementation((cb: any) => {
            callback = cb;
            return {
                data: { subscription: { unsubscribe: vi.fn() } },
            };
        });

        const wrapper = ({ children }: any) => (
            <AuthProvider>
                {children}
            </AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => result.current.user !== null);

        callback("SIGNED_OUT", null);

        await waitFor(() => {
            expect(result.current.user).toBe(null);
        });
    });
});