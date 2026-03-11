import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import { Timer } from "./Timer.jsx";

const SECOND = 1000;
const BOARD_WIDTH = 200;

// Restore timers after time runs out
afterEach(() => {
    vi.useRealTimers();
});

// Tests
describe("Timer.render", () => {
    it("renders given a time", () => {
        render(
            <Timer 
                boardWidth={BOARD_WIDTH} 
                time={60} 
                setTime={() => {}} 
                initialTime={120} 
            />
        );

        expect(screen.getByText("60")).toBeInTheDocument();
    });
});

describe("Timer.countdown", () => {
    it("counts down while unpaused", () => {
        vi.useFakeTimers();
        const setTime = vi.fn();
        render(
            <Timer 
                boardWidth={BOARD_WIDTH} 
                time={60} 
                setTime={setTime} 
            />
        );

        vi.advanceTimersByTime(SECOND);
        expect(setTime).toHaveBeenCalledTimes(1);
        expect(setTime).toHaveBeenCalledWith(expect.any(Function));
    });
});

describe("Timer.pause", () => {
    it("does not count down when paused", () => {
        vi.useFakeTimers();
        const setTime = vi.fn();
        render(
            <Timer 
                boardWidth={BOARD_WIDTH} 
                time={60} 
                setTime={setTime} 
                isPaused 
                initialTime={120} 
            />
        );

        vi.advanceTimersByTime(2 * SECOND);
        expect(setTime).not.toHaveBeenCalled();
    });
});

describe("Timer.timeup", () => {
    it("calls onTimeUp when time reaches zero", () => {
        const onTimeUp = vi.fn();
        render(
            <Timer 
                boardWidth={BOARD_WIDTH} 
                time={0} 
                setTime={() => {}} 
                onTimeUp={onTimeUp} 
            />
        );

        expect(onTimeUp).toHaveBeenCalled();
    });
});

describe("Timer.display", () => {
    it("the bar width corresponds to the remaining time", () => {
        render(
            <Timer 
                boardWidth={BOARD_WIDTH} 
                time={30} 
                setTime={() => {}} 
                initialTime={120} 
            />
        );

        const fill = document.querySelector(".timer-bar__fill") as HTMLElement;
        expect(fill.style.width).toBe("25%");
    });
});