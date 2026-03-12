import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./useTheme";

beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "";
});

// Tests

// An error is thrown is useTheme is used outside its provider
describe("useTheme.error", () => {
    it("throws if used outside provider", () => {
        expect(() => renderHook(() => useTheme())).toThrow(
            "useTheme needs ThemeProvider"
        );
    });
});

// If no state is provided, the theme defaults to light mode
describe("useTheme.default", () => {
    it("defaults to light mode when nothing in localStorage", () => {
        const wrapper = ({ children }: any) => (
            <ThemeProvider>
                {children}
            </ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.darkMode).toBe(false);
        expect(document.documentElement.dataset.theme).toBe("light");
    });
});

// Theme uses the theme-dark-mode value in localStorage, and is updated when that value is updated
describe("useTheme.theme", () => {
    it("reads dark mode from localStorage", () => {
        localStorage.setItem("theme-dark-mode", "true");

        const wrapper = ({ children }: any) => (
            <ThemeProvider>
                {children}
            </ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.darkMode).toBe(true);
        expect(document.documentElement.dataset.theme).toBe("dark");
    });

    it("updates dark mode and persists to localStorage + DOM", () => {
        const wrapper = ({ children }: any) => (
            <ThemeProvider>
                {children}
            </ThemeProvider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        act(() => {
        result.current.setDarkMode(true);
        });

        expect(result.current.darkMode).toBe(true);
        expect(localStorage.getItem("theme-dark-mode")).toBe("true");
        expect(document.documentElement.dataset.theme).toBe("dark");
    });
});