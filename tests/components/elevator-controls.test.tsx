import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ElevatorControls from "../../app/components/elevator-controls";

// ElevatorSystemContextのモック
vi.mock("../../app/contexts/ElevatorSystemContext", () => ({
  useSharedElevatorSystem: () => ({
    startSimulation: vi.fn(),
    stopSimulation: vi.fn(),
  }),
}));

// コンポーネントのモック
vi.mock("../../app/components/elevator-info-toggle", () => ({
  default: () => (
    <div data-testid="elevator-info-toggle">ElevatorInfoToggle</div>
  ),
}));

vi.mock("../../app/components/floor-labels-toggle", () => ({
  default: () => <div data-testid="floor-labels-toggle">FloorLabelsToggle</div>,
}));

describe("ElevatorControls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態では電源がONになっている", () => {
    render(<ElevatorControls />);

    // 電源ボタンが表示されていることを確認
    const powerToggle = screen.getByRole("checkbox");
    expect(powerToggle).toBeInTheDocument();

    // 初期状態では「ON」と表示されていることを確認
    expect(screen.getByText("ON")).toBeInTheDocument();
  });

  it("電源ボタンをクリックするとON/OFFが切り替わる", () => {
    render(<ElevatorControls />);

    // 電源ボタンを取得
    const powerToggle = screen.getByRole("checkbox");

    // 電源ボタンをクリックするとOFFになる
    fireEvent.click(powerToggle);
    expect(screen.getByText("OFF")).toBeInTheDocument();

    // もう一度クリックするとONに戻る
    fireEvent.click(powerToggle);
    expect(screen.getByText("ON")).toBeInTheDocument();
  });

  it("緊急停止ボタンが表示されている", () => {
    render(<ElevatorControls />);

    // 緊急停止ボタンが表示されていることを確認
    const stopButton = screen.getByText("緊急停止");
    expect(stopButton).toBeInTheDocument();
  });

  it("電源がOFFのとき緊急停止ボタンは無効化されている", () => {
    render(<ElevatorControls />);

    // 電源ボタンを取得してOFFにする
    const powerToggle = screen.getByRole("checkbox");
    fireEvent.click(powerToggle);

    // 緊急停止ボタンが無効になっていることを確認
    const stopButton = screen.getByText("緊急停止");
    expect(stopButton).toBeDisabled();
  });

  it("フロアラベル切り替えコンポーネントがレンダリングされている", () => {
    render(<ElevatorControls />);

    const floorLabelsToggle = screen.getByTestId("floor-labels-toggle");
    expect(floorLabelsToggle).toBeInTheDocument();
  });

  it("エレベーター情報表示切り替えコンポーネントがレンダリングされている", () => {
    render(<ElevatorControls />);

    const elevatorInfoToggle = screen.getByTestId("elevator-info-toggle");
    expect(elevatorInfoToggle).toBeInTheDocument();
  });
});
