"use client";

import { useState } from "react";
import { useElevatorStore } from "../stores/elevatorSignalStore";
import { useElevatorThreeStore } from "../stores/elevatorThreeStore";

export function FloorSelector() {
  // 30階までのフロア配列を作成（降順）
  const floors = Array.from({ length: 30 }, (_, i) => 30 - i);

  // zustandフックを使用した状態管理
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  // zustandフックを使用（メソッドと状態を分離して取得）
  const { addElevatorRequest, elevatorSystem } = useElevatorStore();
  const { moveElevator } = useElevatorThreeStore();

  // queueInfoを直接状態から取得（getServerSnapshot問題を回避）
  const queueInfo = useElevatorStore((state) => state.queueInfo);

  const handleFloorSelect = (floor: number) => {
    // 選択されたフロアを状態に設定
    setSelectedFloor(floor);

    // エレベーター1号機の現在階を取得
    const elevator1 = elevatorSystem.elevators[0];
    const actualCurrentFloor = elevator1.currentFloor;

    // Three.jsのビジュアル表示を更新
    moveElevator(floor);

    // 実際のエレベーターの現在位置からのリクエストを作成
    addElevatorRequest(actualCurrentFloor, floor);
  };

  // 現在のエレベーター階（zustandで反応的に更新される）
  const currentElevatorFloor = elevatorSystem.elevators[0]?.currentFloor || 1;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
        フロア選択
      </h2>
      <div className="h-96 overflow-y-auto pr-2 pt-3 pb-1">
        <div className="grid grid-cols-3 gap-4">
          {floors.map((floor) => (
            <div key={floor} className="relative">
              {floor === 30 && (
                <span className="absolute -top-3 -right-3 z-10 bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-md border border-amber-600 font-bold">
                  最上階
                </span>
              )}
              <button
                type="button"
                className={`p-3 rounded-full w-full ${
                  selectedFloor === floor
                    ? "bg-blue-600 text-white font-bold shadow-md"
                    : queueInfo.includes(floor)
                      ? "bg-yellow-500 text-white font-bold shadow-md"
                      : floor === 30
                        ? "bg-gradient-to-r from-amber-300 to-yellow-400 text-gray-800 font-bold border-2 border-amber-500"
                        : "bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 border border-gray-300"
                } text-xl transition-all duration-200`}
                onClick={() => handleFloorSelect(floor)}
              >
                {floor}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-lg font-semibold text-gray-800">
          現在のフロア:{" "}
          <span className="text-2xl font-bold text-blue-600 ml-2">
            {currentElevatorFloor}
          </span>
        </p>

        {queueInfo.length > 0 && (
          <p className="text-lg font-semibold text-gray-800 mt-2">
            次向かうフロア:{" "}
            <span className="text-2xl font-bold text-yellow-500 ml-2">
              {queueInfo.join(" → ")}
            </span>
          </p>
        )}

        <p className="text-lg font-semibold text-gray-800 mt-2">
          選択されたフロア:{" "}
          <span className="text-2xl font-bold text-blue-600 ml-2">
            {selectedFloor || "---"}
          </span>
        </p>
      </div>
    </div>
  );
}
