"use client";

import { useEffect, useState } from "react";
import type { ElevatorSystemWindow } from "@/app/utils/three/window-interface";

interface ElevatorInfoToggleProps {
  className?: string;
}

export default function ElevatorInfoToggle({ className = "" }: ElevatorInfoToggleProps) {
  const [showElevatorInfo, setShowElevatorInfo] = useState(true);

  // 初期化時にエレベーター情報表示状態を設定（クライアントサイドでのみ実行）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const elevatorWindow = window as ElevatorSystemWindow;
      if (elevatorWindow.setElevatorInfoVisibility) {
        elevatorWindow.setElevatorInfoVisibility(true); // 初期値を直接使用
      }
    }
  }, []); // 空の依存配列で初期化時のみ実行

  // showElevatorInfoの変更時に実行される
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const elevatorWindow = window as ElevatorSystemWindow;
      if (elevatorWindow.setElevatorInfoVisibility) {
        elevatorWindow.setElevatorInfoVisibility(showElevatorInfo);
      }
    }
  }, [showElevatorInfo]); // showElevatorInfoが変更されたときのみ実行

  const handleElevatorInfoToggle = () => {
    if (typeof window !== 'undefined') {
      const elevatorWindow = window as ElevatorSystemWindow;
      if (elevatorWindow.toggleElevatorInfo) {
        const isVisible = elevatorWindow.toggleElevatorInfo();
        setShowElevatorInfo(isVisible);
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
            checked={showElevatorInfo}
            onChange={handleElevatorInfoToggle}
          />
          <div
            className={`block w-14 h-8 rounded-full ${showElevatorInfo ? "bg-purple-500" : "bg-gray-400"}`}
          />
          <div
            className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${showElevatorInfo ? "transform translate-x-6" : ""}`}
          />
        </div>
        <div className="ml-3 text-gray-800 font-semibold text-lg">
          階層・方向表示{" "}
          <span
            className={`${showElevatorInfo ? "text-purple-500" : "text-gray-500"} font-bold`}
          >
            {showElevatorInfo ? "表示" : "非表示"}
          </span>
        </div>
      </label>
    </div>
  );
}