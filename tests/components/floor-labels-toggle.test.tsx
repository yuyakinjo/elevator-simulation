import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FloorLabelsToggle from "../../app/components/floor-labels-toggle";

// windowオブジェクトのモック
const mockToggleFloorLabels = vi.fn().mockReturnValue(false);
const mockSetFloorLabelsVisibility = vi.fn();

describe("FloorLabelsToggle", () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    vi.clearAllMocks();

    // グローバルwindowオブジェクトのモック
    Object.defineProperty(window, "toggleFloorLabels", {
      value: mockToggleFloorLabels,
      writable: true,
    });

    Object.defineProperty(window, "setFloorLabelsVisibility", {
      value: mockSetFloorLabelsVisibility,
      writable: true,
    });
  });

  it("初期状態ではフロアラベルが表示されている", () => {
    render(<FloorLabelsToggle />);

    // トグルスイッチが表示されていることを確認
    const toggleSwitch = screen.getByRole("checkbox");
    expect(toggleSwitch).toBeInTheDocument();

    // 初期状態では「表示」と表示されていることを確認
    expect(screen.getByText("表示")).toBeInTheDocument();

    // 初期化時にsetFloorLabelsVisibilityが少なくとも1回呼ばれていることを確認（厳密な回数は重要でない）
    expect(mockSetFloorLabelsVisibility).toHaveBeenCalled();
    expect(mockSetFloorLabelsVisibility).toHaveBeenCalledWith(true);
  });

  it("トグルをクリックするとラベルの表示状態が切り替わる", () => {
    render(<FloorLabelsToggle />);

    // トグルスイッチを取得
    const toggleSwitch = screen.getByRole("checkbox");

    // トグルをクリックすると状態が切り替わる
    fireEvent.click(toggleSwitch);

    // toggleFloorLabelsが呼ばれたことを確認
    expect(mockToggleFloorLabels).toHaveBeenCalledTimes(1);

    // 表示状態が「非表示」に変わったことを確認
    expect(screen.getByText("非表示")).toBeInTheDocument();
  });

  it("カスタムクラス名が適用される", () => {
    const customClassName = "custom-class";
    const { container } = render(
      <FloorLabelsToggle className={customClassName} />,
    );

    // 最上位のdiv要素に指定したクラス名が適用されていることを確認
    // container.firstChildはコンポーネントのルート要素を参照
    expect(container.firstChild).toHaveClass(customClassName);
  });
});
