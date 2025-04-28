"use client";

import { useEffect, useState } from "react";
import { useElevatorSystem } from "../hooks/useElevatorSystem";
import type { MoveHistoryEntry } from "../models/elevator";

// 日時をフォーマットする関数
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
};

// アクションの日本語対応
const translateAction = (action: string): string => {
  switch (action) {
    case "MOVE":
      return "移動";
    case "STOP":
      return "停止";
    case "DOOR_OPEN":
      return "ドア開";
    case "DOOR_CLOSE":
      return "ドア閉";
    default:
      return action;
  }
};

export default function ElevatorHistory() {
  const elevatorSystem = useElevatorSystem();
  const [history, setHistory] = useState<
    Array<{ elevatorId: number; history: MoveHistoryEntry[] }>
  >([]);
  const [selectedElevatorId, setSelectedElevatorId] = useState<number | null>(
    null,
  );

  // 履歴を更新
  useEffect(() => {
    const allHistory = elevatorSystem.getMoveHistory();
    setHistory(allHistory);
  }, [elevatorSystem.updateCount]);

  // 初期選択状態を一度だけ設定
  useEffect(() => {
    if (history.length > 0 && selectedElevatorId === null) {
      setSelectedElevatorId(history[0].elevatorId);
    }
  }, [history]);

  // 表示するエレベーターの履歴をフィルタリング
  const filteredHistory =
    history.find((item) => item.elevatorId === selectedElevatorId)?.history ||
    [];

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
        エレベーター履歴
      </h2>

      {/* エレベーター選択タブ */}
      <div className="flex mb-4 border-b">
        {history.map((item) => (
          <button
            key={item.elevatorId}
            type="button"
            className={`px-4 py-2 ${
              selectedElevatorId === item.elevatorId
                ? "bg-blue-500 text-white font-bold"
                : "bg-gray-100 hover:bg-gray-200"
            } rounded-t-md transition-colors mr-2`}
            onClick={() => setSelectedElevatorId(item.elevatorId)}
          >
            エレベーター {item.elevatorId + 1}
          </button>
        ))}
      </div>

      {/* 履歴リスト */}
      <div className="overflow-y-auto max-h-64">
        {filteredHistory.length === 0 ? (
          <p className="text-gray-500 italic">履歴はありません</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">時刻</th>
                <th className="py-2 px-4 text-left">アクション</th>
                <th className="py-2 px-4 text-left">フロア</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory
                .slice()
                .reverse()
                .map((entry, index) => (
                  <tr
                    key={entry.timestamp}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="py-2 px-4 text-sm">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          entry.action === "MOVE"
                            ? "bg-blue-100 text-blue-800"
                            : entry.action === "STOP"
                              ? "bg-red-100 text-red-800"
                              : entry.action === "DOOR_OPEN"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {translateAction(entry.action)}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {entry.action === "MOVE"
                        ? `${entry.fromFloor} → ${entry.toFloor}`
                        : entry.fromFloor}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          総イベント数: {filteredHistory.length}
        </div>
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
          onClick={() => {
            elevatorSystem.resetSystem();
          }}
        >
          履歴クリア
        </button>
      </div>
    </div>
  );
}
