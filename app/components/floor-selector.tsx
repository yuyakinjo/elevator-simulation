"use client";

import { useEffect, useState } from "react";
import { useSharedElevatorSystem } from "../contexts/ElevatorSystemContext";

export default function FloorSelector() {
  // 30階までのフロア配列を作成（降順）
  const floors = Array.from({ length: 30 }, (_, i) => 30 - i);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const elevatorSystem = useSharedElevatorSystem();
  // エレベーターの現在のフロア（1号機を使用）を追跡
  const [currentElevatorFloor, setCurrentElevatorFloor] = useState<number>(1);
  // 次に向かうフロアのリストを追跡
  const [nextFloors, setNextFloors] = useState<number[]>([]);

  // エレベーターシステムの状態が更新されたら、現在のフロアとキューを取得
  useEffect(() => {
    const systemInfo = elevatorSystem.getSystemInfo();
    if (systemInfo.elevators && systemInfo.elevators.length > 0) {
      setCurrentElevatorFloor(systemInfo.elevators[0].currentFloor);

      // リクエストキューを取得して次に向かうフロアを設定
      const queue = elevatorSystem.getQueueInfo
        ? elevatorSystem.getQueueInfo()
        : systemInfo.pendingRequests.map((req) => req.toFloor);
      setNextFloors(queue);
    }
  }, [elevatorSystem, elevatorSystem.updateCount]);

  const handleFloorSelect = (floor: number) => {
    // 選択されたフロアを状態に設定
    setSelectedFloor(floor);

    // エレベーターシステムの最新情報を取得
    const systemInfo = elevatorSystem.getSystemInfo();
    // エレベーター1号機の現在階を取得（システムから最新の情報を取得）
    const elevator1 = systemInfo.elevators[0];
    const actualCurrentFloor = elevator1.currentFloor;

    // Three.jsのビジュアル表示を更新（エレベーターIDとフロア番号を渡す）
    // 0は最初のエレベーターのID（0から始まる）
    const elevatorWindow = window as typeof window & {
      moveElevator?: (elevatorId: number, floor: number) => void;
    };
    if (elevatorWindow.moveElevator) {
      elevatorWindow.moveElevator(0, floor);
    } else {
      console.error("moveElevator function is not available on window object");
    }

    // 実際のエレベーターの現在位置からのリクエストを作成
    elevatorSystem.addRequest(actualCurrentFloor, floor);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
        フロア選択
      </h2>
      <div className="h-96 overflow-y-auto pr-2">
        <div className="grid grid-cols-3 gap-2">
          {floors.map((floor) => (
            <button
              key={floor}
              type="button"
              className={`p-3 rounded-full ${
                selectedFloor === floor
                  ? "bg-blue-600 text-white font-bold shadow-md"
                  : nextFloors.includes(floor)
                    ? "bg-yellow-500 text-white font-bold shadow-md"
                    : "bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 border border-gray-300"
              } text-xl transition-all duration-200`}
              onClick={() => handleFloorSelect(floor)}
            >
              {floor}
            </button>
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

        {nextFloors.length > 0 && (
          <p className="text-lg font-semibold text-gray-800 mt-2">
            次向かうフロア:{" "}
            <span className="text-2xl font-bold text-yellow-500 ml-2">
              {nextFloors.join(" → ")}
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
