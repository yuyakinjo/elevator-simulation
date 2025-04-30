"use client";

import { create } from "zustand";
import {
  ELEVATOR_CONFIG,
  type Elevator,
  type ElevatorRequest,
  ElevatorSystem,
  type MoveHistoryEntry,
} from "../models/elevator";

// エレベーターストアのステート型定義
interface ElevatorStore {
  // 状態
  elevatorSystem: ElevatorSystem;
  running: boolean;
  updateCounter: number;
  simulationTimeMs: number;
  queueInfo: number[]; // キャッシュされたキュー情報
  elevatorHistory: {
    // キャッシュされたエレベーター履歴情報
    elevatorId: number;
    history: MoveHistoryEntry[];
  }[];

  // アクション
  resetElevatorSystem: () => void;
  startElevators: () => void;
  stopElevators: () => void;
  addElevatorRequest: (fromFloor: number, toFloor: number) => string;
  manualUpdateSystem: () => void;
  getSystemInfo: () => {
    elevators: Elevator[];
    pendingRequests: ElevatorRequest[];
    floors: number;
    running: boolean;
  };
  getAllElevatorsHistory: () => {
    elevatorId: number;
    history: MoveHistoryEntry[];
  }[];
  updateElevatorHistory: (
    elevatorId: number,
    fromFloor: number,
    toFloor: number,
    action: "MOVE" | "STOP" | "DOOR_OPEN" | "DOOR_CLOSE",
  ) => void;
  updateElevatorCurrentFloor: (elevatorId: number, floor: number) => void;
  getQueueInfo: () => number[]; // メソッドは残しておく（互換性のため）
  updateQueueInfo: () => void; // キュー情報を更新するメソッド
  updateElevatorHistoryCache: () => void; // エレベーター履歴を更新するメソッド
  removeFloorFromQueue: (floor: number) => void; // 特定のフロアをキューから削除するメソッド
}

// シミュレーションループ用の変数
let simulationAnimationId: number | null = null;

// zustandストアの作成
export const useElevatorStore = create<ElevatorStore>((set, get) => ({
  // 初期状態
  elevatorSystem: new ElevatorSystem(),
  running: false,
  updateCounter: 0,
  simulationTimeMs: Date.now(),
  queueInfo: [], // 初期状態は空の配列
  elevatorHistory: [], // 初期状態は空の配列

  // アクション
  resetElevatorSystem: () => {
    const newSystem = new ElevatorSystem();
    set({
      elevatorSystem: newSystem,
      running: false,
      updateCounter: 0,
      queueInfo: [], // キュー情報をリセット
      elevatorHistory: [], // 履歴情報もリセット
    });

    // アニメーションループを停止
    if (simulationAnimationId !== null) {
      cancelAnimationFrame(simulationAnimationId);
      simulationAnimationId = null;
    }
  },

  // 以下、既存のメソッド
  startElevators: () => {
    const { running, elevatorSystem } = get();

    if (!running) {
      set({ running: true });
      elevatorSystem.startElevators();

      // シミュレーションの更新を開始
      startSimulationLoop(set, get);
    }
  },

  stopElevators: () => {
    set({ running: false });

    // アニメーションループを停止
    if (simulationAnimationId !== null) {
      cancelAnimationFrame(simulationAnimationId);
      simulationAnimationId = null;
    }
  },

  addElevatorRequest: (fromFloor: number, toFloor: number): string => {
    const { elevatorSystem, startElevators } = get();

    const requestId = elevatorSystem.addRequest(fromFloor, toFloor);

    // リクエスト追加後、自動的に起動
    startElevators();

    // キュー情報を更新
    get().updateQueueInfo();

    // 履歴情報も更新
    get().updateElevatorHistoryCache();

    // 状態変更を通知
    set((state) => ({ updateCounter: state.updateCounter + 1 }));

    return requestId;
  },

  manualUpdateSystem: () => {
    const { elevatorSystem } = get();

    elevatorSystem.update();

    // キュー情報を更新
    get().updateQueueInfo();

    // 履歴情報も更新
    get().updateElevatorHistoryCache();

    set((state) => ({ updateCounter: state.updateCounter + 1 }));
  },

  getSystemInfo: () => {
    const { elevatorSystem, running } = get();

    return {
      elevators: elevatorSystem.elevators,
      pendingRequests: elevatorSystem.pendingRequests,
      floors: ELEVATOR_CONFIG.FLOORS,
      running,
    };
  },

  // 履歴を取得する関数（キャッシュを返す）
  getAllElevatorsHistory: () => {
    return get().elevatorHistory;
  },

  updateElevatorHistory: (
    elevatorId: number,
    fromFloor: number,
    toFloor: number,
    action: "MOVE" | "STOP" | "DOOR_OPEN" | "DOOR_CLOSE",
  ) => {
    const { elevatorSystem } = get();

    elevatorSystem.updateDirectHistory(elevatorId, fromFloor, toFloor, action);

    // ドアを開く場合は、そのフロアをキューから削除し、システム内のリクエストも削除
    if (action === "DOOR_OPEN") {
      // UIキャッシュから削除
      get().removeFloorFromQueue(toFloor);

      // システム内の実際のリクエストからも削除（根本的な解決策）
      elevatorSystem.removeRequestsForFloor(toFloor);
    }

    // 履歴キャッシュを更新
    get().updateElevatorHistoryCache();

    set((state) => ({ updateCounter: state.updateCounter + 1 }));
  },

  updateElevatorCurrentFloor: (elevatorId: number, floor: number) => {
    const { elevatorSystem } = get();

    if (elevatorSystem.elevators[elevatorId]) {
      elevatorSystem.elevators[elevatorId].currentFloor = floor;
      set((state) => ({ updateCounter: state.updateCounter + 1 }));
    }
  },

  // キャッシュを使用する getQueueInfo（既存のコードとの互換性のため）
  getQueueInfo: () => {
    return get().queueInfo;
  },

  // キュー情報を更新するメソッド
  updateQueueInfo: () => {
    const { elevatorSystem } = get();
    const newQueueInfo = elevatorSystem.pendingRequests.map(
      (req) => req.toFloor,
    );
    set({ queueInfo: newQueueInfo });
  },

  // 履歴情報を更新するメソッド
  updateElevatorHistoryCache: () => {
    const { elevatorSystem } = get();
    const newHistory = elevatorSystem.getAllElevatorsHistory();
    set({ elevatorHistory: newHistory });
  },

  // 特定のフロアをキューから削除するメソッド
  removeFloorFromQueue: (floor: number) => {
    set((state) => ({
      queueInfo: state.queueInfo.filter((f) => f !== floor),
    }));
  },
}));

// シミュレーションループ実行のための関数
function startSimulationLoop(
  set: (
    partial:
      | Partial<ElevatorStore>
      | ((state: ElevatorStore) => Partial<ElevatorStore>),
  ) => void,
  get: () => ElevatorStore,
) {
  // 以前のアニメーションループをクリア
  if (simulationAnimationId !== null) {
    cancelAnimationFrame(simulationAnimationId);
  }

  // イベント駆動のためにrequestAnimationFrameを使う
  let lastUpdateTime = Date.now();
  const UPDATE_INTERVAL = 1000; // 1秒ごとに更新

  const updateLoop = () => {
    const { running, elevatorSystem } = get();

    // running状態が変わった場合はループを終了
    if (!running) return;

    const currentTime = Date.now();
    // 十分な時間が経過したら更新
    if (currentTime - lastUpdateTime >= UPDATE_INTERVAL) {
      elevatorSystem.update();

      // キャッシュ情報も更新
      get().updateQueueInfo();
      get().updateElevatorHistoryCache();

      set((state) => ({
        updateCounter: state.updateCounter + 1,
        simulationTimeMs: currentTime,
      }));
      lastUpdateTime = currentTime;
    }

    // 次のフレームで再度実行
    simulationAnimationId = requestAnimationFrame(updateLoop);
  };

  // アニメーションループを開始
  simulationAnimationId = requestAnimationFrame(updateLoop);
}
