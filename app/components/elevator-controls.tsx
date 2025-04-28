"use client";

import { useState } from "react";

export default function ElevatorControls() {
  const [elevatorPower, setElevatorPower] = useState(true);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">エレベーター制御</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={elevatorPower}
                onChange={() => setElevatorPower(!elevatorPower)}
              />
              <div
                className={`block w-14 h-8 rounded-full ${elevatorPower ? "bg-green-400" : "bg-gray-400"}`}
              />
              <div
                className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${elevatorPower ? "transform translate-x-6" : ""}`}
              />
            </div>
            <div className="ml-3 text-gray-700 font-medium">
              電源 {elevatorPower ? "ON" : "OFF"}
            </div>
          </label>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          disabled={!elevatorPower}
        >
          緊急停止
        </button>
      </div>
    </div>
  );
}
