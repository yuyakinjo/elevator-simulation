"use client";

import { useState } from "react";

export default function FloorSelector() {
  const floors = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor);
    (window as any).moveElevator(floor * 3 - 6); // フロアに応じたエレベーターのY座標を計算
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">フロア選択</h2>
      <div className="grid grid-cols-2 gap-2">
        {floors.map((floor) => (
          <button
            key={floor}
            type="button"
            className={`p-4 rounded-full ${
              selectedFloor === floor
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => handleFloorSelect(floor)}
          >
            {floor}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <p>現在のフロア: {selectedFloor || "---"}</p>
      </div>
    </div>
  );
}
