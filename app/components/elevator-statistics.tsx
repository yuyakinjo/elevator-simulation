"use client";

import { useCallback, useEffect, useState } from "react";
import { useSharedElevatorSystem } from "../contexts/ElevatorSystemContext";
import type { MoveHistoryEntry } from "../models/elevator";

// 統計情報の型定義
interface ElevatorStats {
  elevatorId: number;
  totalMoves: number;
  totalFloorsTraveled: number;
  doorOpenCount: number;
  doorCloseCount: number;
  stopCount: number;
  averageFloorsPerMove: number;
}

export default function ElevatorStatistics() {
  const elevatorSystem = useSharedElevatorSystem();
  const [stats, setStats] = useState<ElevatorStats[]>([]);
  const [selectedElevatorId, setSelectedElevatorId] = useState<number | null>(
    null,
  );

  // 履歴からエレベーター統計情報を計算
  const calculateStats = useCallback(
    (history: MoveHistoryEntry[], elevatorId: number): ElevatorStats => {
      let totalMoves = 0;
      let totalFloorsTraveled = 0;
      let doorOpenCount = 0;
      let doorCloseCount = 0;
      let stopCount = 0;

      for (const entry of history) {
        if (entry.action === "MOVE") {
          totalMoves++;
          totalFloorsTraveled += Math.abs(entry.toFloor - entry.fromFloor);
        } else if (entry.action === "DOOR_OPEN") {
          doorOpenCount++;
        } else if (entry.action === "DOOR_CLOSE") {
          doorCloseCount++;
        } else if (entry.action === "STOP") {
          stopCount++;
        }
      }

      return {
        elevatorId,
        totalMoves,
        totalFloorsTraveled,
        doorOpenCount,
        doorCloseCount,
        stopCount,
        averageFloorsPerMove:
          totalMoves > 0 ? totalFloorsTraveled / totalMoves : 0,
      };
    },
    [], // calculateStats doesn't depend on any state or props
  );

  useEffect(() => {
    // エレベーターの履歴を取得
    const allHistory = elevatorSystem.getMoveHistory();

    // 各エレベーターの統計情報を計算
    const newStats = allHistory.map(({ elevatorId, history }) =>
      calculateStats(history, elevatorId),
    );

    setStats(newStats);

    // 初期選択状態を設定
    if (newStats.length > 0 && selectedElevatorId === null) {
      setSelectedElevatorId(newStats[0].elevatorId);
    }
  }, [elevatorSystem, calculateStats, selectedElevatorId]);

  // 選択されたエレベーターの統計情報または全体の統計情報
  const selectedStats =
    selectedElevatorId !== null
      ? stats.find((s) => s.elevatorId === selectedElevatorId)
      : null;

  // すべてのエレベーターの統計を合算した全体統計
  const totalStats = stats.reduce(
    (acc, curr) => ({
      elevatorId: -1, // 全体統計用の特別なID
      totalMoves: acc.totalMoves + curr.totalMoves,
      totalFloorsTraveled: acc.totalFloorsTraveled + curr.totalFloorsTraveled,
      doorOpenCount: acc.doorOpenCount + curr.doorOpenCount,
      doorCloseCount: acc.doorCloseCount + curr.doorCloseCount,
      stopCount: acc.stopCount + curr.stopCount,
      averageFloorsPerMove:
        stats.reduce((sum, s) => sum + s.totalMoves, 0) > 0
          ? stats.reduce((sum, s) => sum + s.totalFloorsTraveled, 0) /
            stats.reduce((sum, s) => sum + s.totalMoves, 0)
          : 0,
    }),
    {
      elevatorId: -1,
      totalMoves: 0,
      totalFloorsTraveled: 0,
      doorOpenCount: 0,
      doorCloseCount: 0,
      stopCount: 0,
      averageFloorsPerMove: 0,
    },
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
        エレベーター統計
      </h2>

      {/* エレベーター選択タブ */}
      <div className="flex mb-4 border-b">
        <button
          key="all"
          type="button"
          className={`px-4 py-2 ${
            selectedElevatorId === null
              ? "bg-blue-500 text-white font-bold"
              : "bg-gray-100 hover:bg-gray-200"
          } rounded-t-md transition-colors mr-2`}
          onClick={() => setSelectedElevatorId(null)}
        >
          全体
        </button>

        {stats.map((stat) => (
          <button
            key={stat.elevatorId}
            type="button"
            className={`px-4 py-2 ${
              selectedElevatorId === stat.elevatorId
                ? "bg-blue-500 text-white font-bold"
                : "bg-gray-100 hover:bg-gray-200"
            } rounded-t-md transition-colors mr-2`}
            onClick={() => setSelectedElevatorId(stat.elevatorId)}
          >
            エレベーター {stat.elevatorId + 1}
          </button>
        ))}
      </div>

      {/* 統計情報表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="総移動回数"
          value={
            selectedElevatorId === null
              ? totalStats.totalMoves
              : selectedStats?.totalMoves || 0
          }
          icon="🔄"
        />
        <StatCard
          title="総移動階数"
          value={
            selectedElevatorId === null
              ? totalStats.totalFloorsTraveled
              : selectedStats?.totalFloorsTraveled || 0
          }
          icon="📏"
        />
        <StatCard
          title="平均移動階数/回"
          value={
            selectedElevatorId === null
              ? Math.round(totalStats.averageFloorsPerMove * 100) / 100
              : Math.round((selectedStats?.averageFloorsPerMove || 0) * 100) /
                100
          }
          icon="📊"
        />
        <StatCard
          title="停止回数"
          value={
            selectedElevatorId === null
              ? totalStats.stopCount
              : selectedStats?.stopCount || 0
          }
          icon="🛑"
        />
        <StatCard
          title="ドア開閉回数"
          value={
            selectedElevatorId === null
              ? totalStats.doorOpenCount
              : selectedStats?.doorOpenCount || 0
          }
          icon="🚪"
          subValue={
            selectedElevatorId === null
              ? totalStats.doorCloseCount
              : selectedStats?.doorCloseCount || 0
          }
          subLabel="閉"
        />
      </div>
    </div>
  );
}

// 統計カード用サブコンポーネント
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  subValue?: number;
  subLabel?: string;
}

function StatCard({ title, value, icon, subValue, subLabel }: StatCardProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <div className="text-2xl font-bold text-blue-600">
            {value}
            {subValue !== undefined && (
              <span className="text-gray-500 text-lg ml-2">
                ({subLabel}: {subValue})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
