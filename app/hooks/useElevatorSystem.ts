"use client";

import { useEffect, useRef, useState } from "react";
import { ELEVATOR_CONFIG, ElevatorSystem } from "../models/elevator";

// エレベーターシミュレーションのカスタムフック
export function useElevatorSystem() {
  const [system, setSystem] = useState<ElevatorSystem>(new ElevatorSystem());
  const [running, setRunning] = useState<boolean>(false);
  const [updateCount, setUpdateCount] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

  // グローバル参照用にシステムを設定
  useEffect(() => {
    // グローバルにエレベーターシステムの参照を保存
    (window as any).__ELEVATOR_SYSTEM__ = {
      updateHistory: (
        elevatorId: number,
        fromFloor: number,
        toFloor: number,
        action: string,
      ) => {
        // アクションタイプを内部形式に変換
        let internalAction = "MOVE";
        if (action === "OPENING_DOORS") internalAction = "DOOR_OPEN";
        else if (action === "CLOSING_DOORS") internalAction = "DOOR_CLOSE";
        else if (action === "STOPPED") internalAction = "STOP";

        // システムの履歴を直接更新
        system.updateDirectHistory(
          elevatorId,
          fromFloor,
          toFloor,
          internalAction,
        );

        // 表示を更新するために状態カウンタをインクリメント
        setUpdateCount((prev) => prev + 1);
      },
    };

    return () => {
      // クリーンアップ時に参照を削除
      delete (window as any).__ELEVATOR_SYSTEM__;
    };
  }, [system]);

  // シミュレーションの開始
  const startSimulation = () => {
    if (!running) {
      setRunning(true);
      system.startElevators();
    }
  };

  // シミュレーションの停止
  const stopSimulation = () => {
    setRunning(false);
  };

  // エレベーターリクエストの追加
  const addRequest = (fromFloor: number, toFloor: number) => {
    const requestId = system.addRequest(fromFloor, toFloor);
    startSimulation(); // リクエストが追加されたら自動的にシミュレーションを開始

    // 履歴が即座に更新されるように明示的に更新カウンタをインクリメント
    setUpdateCount((prev) => prev + 1);

    return requestId;
  };

  // リセット処理
  const resetSystem = () => {
    stopSimulation();
    setSystem(new ElevatorSystem());
    setUpdateCount(0);
  };

  // システム情報を取得
  const getSystemInfo = () => {
    return {
      elevators: system.elevators,
      pendingRequests: system.pendingRequests,
      floors: ELEVATOR_CONFIG.FLOORS,
      running,
    };
  };

  // キュー情報を取得する関数
  const getQueueInfo = () => {
    // Three.jsとの連携用にグローバルで定義されているキュー情報を取得
    const windowWithQueue = window as typeof window & {
      getElevatorQueue?: () => number[];
    };

    if (typeof windowWithQueue.getElevatorQueue === "function") {
      return windowWithQueue.getElevatorQueue();
    }

    // フォールバック: システムからペンディングリクエストを取得
    return system.pendingRequests.map((req) => req.toFloor);
  };

  // マニュアル更新（主にアニメーション用）
  const manualUpdate = () => {
    system.update();
    setUpdateCount((prev) => prev + 1);
  };

  // シミュレーション実行中はインターバルでシステムを更新
  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        system.update();
        setUpdateCount((prev) => prev + 1);
      }, 1000); // 毎秒更新
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, system]);

  // 履歴情報を取得
  const getMoveHistory = () => {
    return system.getAllElevatorsHistory();
  };

  return {
    addRequest,
    startSimulation,
    stopSimulation,
    resetSystem,
    getSystemInfo,
    getQueueInfo,
    manualUpdate,
    getMoveHistory, // 移動履歴取得関数を追加
    updateCount,
    running,
  };
}
