"use client";

import type { ElevatorSystemWindow } from "@/app/utils/three/window-interface";
import { useEffect, useState } from "react";

interface FloorLabelsToggleProps {
  className?: string;
}

export default function FloorLabelsToggle({
  className = "",
}: FloorLabelsToggleProps) {
  const [showFloorLabels, setShowFloorLabels] = useState(true);

  // 初期化時にのみ実行される（依存配列は空）
  useEffect(() => {
    if (typeof window !== "undefined") {
      const elevatorWindow = window as ElevatorSystemWindow;
      if (elevatorWindow.setFloorLabelsVisibility) {
        elevatorWindow.setFloorLabelsVisibility(true); // 初期値を直接使用
      }
    }
  }, []); // 空の依存配列で初期化時のみ実行

  // showFloorLabelsの変更時に実行される
  useEffect(() => {
    if (typeof window !== "undefined") {
      const elevatorWindow = window as ElevatorSystemWindow;
      if (elevatorWindow.setFloorLabelsVisibility) {
        elevatorWindow.setFloorLabelsVisibility(showFloorLabels);
      }
    }
  }, [showFloorLabels]); // showFloorLabelsが変更されたときのみ実行

  const handleFloorLabelsToggle = () => {
    if (typeof window !== "undefined") {
      const elevatorWindow = window as ElevatorSystemWindow;
      if (elevatorWindow.toggleFloorLabels) {
        const isVisible = elevatorWindow.toggleFloorLabels();
        setShowFloorLabels(isVisible);
      }
    }
  };

  return (
    <div className={`${className}`}>
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={showFloorLabels}
            onChange={handleFloorLabelsToggle}
          />
          <div
            className={`block w-14 h-8 rounded-full ${showFloorLabels ? "bg-blue-500" : "bg-gray-400"}`}
          />
          <div
            className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${showFloorLabels ? "transform translate-x-6" : ""}`}
          />
        </div>
        <div className="ml-3 text-gray-800 font-semibold text-lg">
          階層表示{" "}
          <span
            className={`${showFloorLabels ? "text-blue-500" : "text-gray-500"} font-bold`}
          >
            {showFloorLabels ? "表示" : "非表示"}
          </span>
        </div>
      </label>
    </div>
  );
}
