import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ElevatorInfoToggle from "../../app/components/elevator-info-toggle";

// windowオブジェクトのモック
const mockToggleElevatorInfo = vi.fn().mockReturnValue(false);
const mockSetElevatorInfoVisibility = vi.fn();

describe("ElevatorInfoToggle", () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    vi.clearAllMocks();

    // グローバルwindowオブジェクトのモック
    Object.defineProperty(window, "toggleElevatorInfo", {
      value: mockToggleElevatorInfo,
      writable: true,
    });

    Object.defineProperty(window, "setElevatorInfoVisibility", {
      value: mockSetElevatorInfoVisibility,
      writable: true,
    });
  });

  it("初期状態ではエレベーター情報が表示されている", () => {
    render(<ElevatorInfoToggle />);

    // トグルスイッチが表示されていることを確認
    const toggleSwitch = screen.getByRole("checkbox");
    expect(toggleSwitch).toBeInTheDocument();

    // 初期状態では「表示」と表示されていることを確認
    expect(screen.getByText("表示")).toBeInTheDocument();

    // 初期化時にsetElevatorInfoVisibilityが少なくとも1回呼ばれていることを確認（厳密な回数は重要でない）
    expect(mockSetElevatorInfoVisibility).toHaveBeenCalled();
    expect(mockSetElevatorInfoVisibility).toHaveBeenCalledWith(true);
  });

  it("トグルをクリックするとエレベーター情報の表示状態が切り替わる", () => {
    render(<ElevatorInfoToggle />);

    // トグルスイッチを取得
    const toggleSwitch = screen.getByRole("checkbox");

    // トグルをクリックすると状態が切り替わる
    fireEvent.click(toggleSwitch);

    // toggleElevatorInfoが呼ばれたことを確認
    expect(mockToggleElevatorInfo).toHaveBeenCalledTimes(1);

    // 表示状態が「非表示」に変わったことを確認
    expect(screen.getByText("非表示")).toBeInTheDocument();
  });

  it("カスタムクラス名が適用される", () => {
    const customClassName = "custom-class";
    const { container } = render(
      <ElevatorInfoToggle className={customClassName} />,
    );

    // 最上位のdiv要素に指定したクラス名が適用されていることを確認
    // container.firstChildはコンポーネントのルート要素を参照
    expect(container.firstChild).toHaveClass(customClassName);
  });
});
