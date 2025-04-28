import "@testing-library/jest-dom";
import { vi } from "vitest";

// windowオブジェクトのモックメソッドをグローバルに設定
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// エレベーターシステムのグローバルAPIをモック
Object.defineProperty(window, "moveElevator", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, "setElevatorAction", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, "getElevatorQueue", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, "toggleFloorLabels", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, "setFloorLabelsVisibility", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, "toggleElevatorInfo", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, "setElevatorInfoVisibility", {
  value: vi.fn(),
  writable: true,
});

// ResizeObserverのモック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// IntersectionObserverのモック
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
