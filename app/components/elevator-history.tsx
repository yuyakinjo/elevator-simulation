"use client";

import { useEffect, useState } from "react";
import { useSharedElevatorSystem } from "../contexts/ElevatorSystemContext";
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
  const elevatorSystem = useSharedElevatorSystem();
  const [history, setHistory] = useState<
    Array<{ elevatorId: number; history: MoveHistoryEntry[] }>
  >([]);
  const [selectedElevatorId, setSelectedElevatorId] = useState<number | null>(
    null,
  );

  // 更新カウンタを監視して履歴を更新
  const updateCount = elevatorSystem.updateCount;

  // 履歴を更新 - updateCountが変わるたびに再取得
  useEffect(() => {
    const allHistory = elevatorSystem.getMoveHistory();
    setHistory(allHistory);
  }, [elevatorSystem, updateCount]);

  // 初期選択状態を一度だけ設定
  useEffect(() => {
    if (history.length > 0 && selectedElevatorId === null) {
      setSelectedElevatorId(history[0].elevatorId);
    }
  }, [history, selectedElevatorId]);

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
      <div className="overflow-y-auto max-h-64 w-full">
        {filteredHistory.length === 0 ? (
          <p className="text-gray-500 italic">履歴はありません</p>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="py-3 px-4 text-left font-bold text-base text-gray-800 w-1/4">
                  時刻
                </th>
                <th className="py-3 px-4 text-left font-bold text-base text-gray-800 w-1/3">
                  アクション
                </th>
                <th className="py-3 px-4 text-left font-bold text-base text-gray-800 w-1/3">
                  フロア
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory
                .slice()
                .reverse()
                .map((entry, index) => (
                  <tr
                    key={`${entry.timestamp}-${index}`}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors border-b border-gray-200`}
                  >
                    <td className="py-2 px-4 font-medium text-gray-900 whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-sm font-medium ${
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
                    <td className="py-2 px-4 font-medium text-gray-900">
                      {entry.action === "MOVE" ? (
                        <span>
                          {entry.fromFloor}{" "}
                          <span className="text-blue-600 font-bold">→</span>{" "}
                          {entry.toFloor}
                        </span>
                      ) : (
                        entry.fromFloor
                      )}
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
