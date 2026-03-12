import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { renderHook, act } from "@testing-library/react";
import { SoundProvider, useSound } from "./useSound";

beforeEach(() => {
    localStorage.clear();
});

// Tests

// Error is thrown if useSound is used outside of its provider
describe("useSound.error", () => {
    it("throws if used outside provider", () => {
        expect(() => renderHook(() => useSound())).toThrow(
            "useSound needs SoundProvider"
        );
    });
});

// By default, sound is on
describe("useSound.default", () => {
    it("defaults to true if no value in localStorage", () => {
        const wrapper = ({ children }: any) => (
            <SoundProvider>
                {children}
            </SoundProvider>
        );

        const { result } = renderHook(() => useSound(), { wrapper });

        expect(result.current.soundOn).toBe(true);
    });
});

// Sound uses the sound-on value in localStorage, and is updated when that value is updated
describe("useSound.sound", () => {
    it("sound corresponds to state turned off in localStorage", () => {
        localStorage.setItem("sound-on", "false");

        const wrapper = ({ children }: any) => (
            <SoundProvider>
                {children}
            </SoundProvider>
        );

        const { result } = renderHook(() => useSound(), { wrapper });

        expect(result.current.soundOn).toBe(false);
    });

    it("updates sound state and localStorage", () => {
        const wrapper = ({ children }: any) => (
            <SoundProvider>
                {children}
            </SoundProvider>
        );

        const { result } = renderHook(() => useSound(), { wrapper });

        act(() => {
            result.current.setSoundOn(false);
        });

        expect(result.current.soundOn).toBe(false);
        expect(localStorage.getItem("sound-on")).toBe("false");
    });
});