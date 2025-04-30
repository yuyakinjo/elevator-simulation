"use client";

import { useState } from "react";
import { useElevatorStore } from "../stores/elevatorSignalStore";

export function ElevatorControls() {
  // zustandストアを使用
  const { running, startElevators, stopElevators } = useElevatorStore();
  // 電源状態のローカルUI状態
  const [elevatorPower, setElevatorPower] = useState(true);

  // 電源切り替え処理
  const handlePowerToggle = () => {
    const newPowerState = !elevatorPower;
    setElevatorPower(newPowerState);

    // エレベーターシステムの状態も変更
    if (newPowerState) {
      startElevators();
    } else {
      stopElevators();
    }
  };

  // 緊急停止処理
  const handleEmergencyStop = () => {
    stopElevators();
    // 電源状態も連動
    setElevatorPower(false);
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
        エレベーター制御
      </h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={elevatorPower}
                onChange={handlePowerToggle}
              />
              <div
                className={`block w-14 h-8 rounded-full ${elevatorPower ? "bg-green-500" : "bg-gray-400"}`}
              />
              <div
                className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${elevatorPower ? "transform translate-x-6" : ""}`}
              />
            </div>
            <div className="ml-3 text-gray-800 font-semibold text-lg">
              電源{" "}
              <span
                className={`${elevatorPower ? "text-green-500" : "text-gray-500"} font-bold`}
              >
                {elevatorPower ? "ON" : "OFF"}
              </span>
            </div>
          </label>
        </div>

        <button
          type="button"
          className="px-4 py-3 bg-red-500 text-white text-lg font-bold rounded-md hover:bg-red-600 disabled:bg-gray-300 transition-colors shadow-sm"
          disabled={!elevatorPower}
          onClick={handleEmergencyStop}
        >
          緊急停止
        </button>
      </div>
    </div>
  );
}
