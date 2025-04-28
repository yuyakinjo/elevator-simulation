import { useEffect, useRef, useState } from "react";
import { ELEVATOR_CONFIG, ElevatorSystem } from "../models/elevator";

// エレベーターシミュレーションのカスタムフック
export function useElevatorSystem() {
  const [system, setSystem] = useState<ElevatorSystem>(new ElevatorSystem());
  const [running, setRunning] = useState<boolean>(false);
  const [updateCount, setUpdateCount] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

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

  return {
    addRequest,
    startSimulation,
    stopSimulation,
    resetSystem,
    getSystemInfo,
    manualUpdate,
    updateCount,
    running,
  };
}
