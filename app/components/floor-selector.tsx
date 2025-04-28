"use client";

import { useState } from "react";

export default function FloorSelector() {
  const floors = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor);
    (
      window as typeof window & { moveElevator: (floor: number) => void }
    ).moveElevator(floor * 3 - 6); // フロアに応じたエレベーターのY座標を計算
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
        フロア選択
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {floors.map((floor) => (
          <button
            key={floor}
            type="button"
            className={`p-5 rounded-full ${
              selectedFloor === floor
                ? "bg-blue-600 text-white font-bold shadow-md"
                : "bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 border border-gray-300"
            } text-2xl transition-all duration-200`}
            onClick={() => handleFloorSelect(floor)}
          >
            {floor}
          </button>
        ))}
      </div>
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-lg font-semibold text-gray-800">
          現在のフロア:{" "}
          <span className="text-2xl font-bold text-blue-600 ml-2">
            {selectedFloor || "---"}
          </span>
        </p>
      </div>
    </div>
  );
}
