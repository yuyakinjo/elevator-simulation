"use client";

import { create } from "zustand";
import { useElevatorStore } from "./elevatorSignalStore";

// Three.js用ストアのステート型
interface ElevatorThreeState {
  floorQueue: number[];
  currentFloor: number;
  targetFloor: number;
  elevatorStatus: string;
}

// Three.js用のストア
interface ElevatorThreeStore extends ElevatorThreeState {
  // アクション
  moveElevator: (floor: number) => void;
  setElevatorAction: (action: string) => void;
  updateCurrentFloor: (floor: number) => void;
  getElevatorQueue: () => number[];
  resetThreeStore: () => void;
}

// エレベーターのアクションに関連する定数
const ActionTiming = {
  DOOR_OPEN_TIME: 2000, // ドアが開き切るまでの時間
  DOOR_CLOSE_TIME: 2000, // ドアが閉まり切るまでの時間
  DOOR_WAIT_TIME: 3000, // ドア開放時間
  FLOOR_CHANGE_DELAY: 500, // フロア変更後の遅延
};

// zustandストアの作成
export const useElevatorThreeStore = create<ElevatorThreeStore>((set, get) => {
  // メインストアの参照を取得（実際の呼び出しはコンポーネント内で行われる）
  const updateElevatorHistory = (
    elevatorId: number,
    fromFloor: number,
    toFloor: number,
    action: "MOVE" | "STOP" | "DOOR_OPEN" | "DOOR_CLOSE",
  ) => {
    useElevatorStore
      .getState()
      .updateElevatorHistory(elevatorId, fromFloor, toFloor, action);
  };

  const updateElevatorCurrentFloor = (elevatorId: number, floor: number) => {
    useElevatorStore.getState().updateElevatorCurrentFloor(elevatorId, floor);
  };

  return {
    // 初期状態
    floorQueue: [],
    currentFloor: 1,
    targetFloor: 1,
    elevatorStatus: "STOPPED",

    // エレベーターの移動を指示する関数
    moveElevator: (floor: number) => {
      const { floorQueue, currentFloor, elevatorStatus } = get();

      // すでにキューに含まれている場合は追加しない
      if (
        floorQueue.includes(floor) ||
        (floor === currentFloor &&
          (elevatorStatus === "STOPPED" || elevatorStatus === "DOORS_OPEN"))
      ) {
        return;
      }

      // 目標フロアをキューに追加
      const newQueue = [...floorQueue, floor];
      set({ floorQueue: newQueue });

      // 状態に応じた処理
      if (elevatorStatus === "STOPPED") {
        // 停止中なら即座に移動開始
        processElevatorMovement(set, get);
      } else if (elevatorStatus === "DOORS_OPEN") {
        // ドアが開いている場合は閉めてから移動
        get().setElevatorAction("CLOSING_DOORS");
      }
    },

    // エレベーターアクションを設定する関数
    setElevatorAction: (action: string) => {
      const { currentFloor } = get();
      set({ elevatorStatus: action });

      // アクションに応じた処理
      switch (action) {
        case "OPENING_DOORS": {
          // ドアが開き切ったら状態を更新
          const timerId = setTimeout(() => {
            const currentState = get();
            if (currentState.elevatorStatus === "OPENING_DOORS") {
              // 履歴を更新
              updateElevatorHistory(
                0,
                currentState.currentFloor,
                currentState.currentFloor,
                "DOOR_OPEN",
              );
              get().setElevatorAction("DOORS_OPEN");
            }
          }, ActionTiming.DOOR_OPEN_TIME);

          // クリーンアップはzustandでは必要ない（コンポーネントがアンマウントしてもストアは残るため）
          break;
        }

        case "CLOSING_DOORS": {
          // ドアが閉まり切ったら状態を更新
          const timerId = setTimeout(() => {
            const currentState = get();
            if (currentState.elevatorStatus === "CLOSING_DOORS") {
              // 履歴を更新
              updateElevatorHistory(
                0,
                currentState.currentFloor,
                currentState.currentFloor,
                "DOOR_CLOSE",
              );

              // 次の移動先がある場合は移動開始
              if (currentState.floorQueue.length > 0) {
                processElevatorMovement(set, get);
              } else {
                get().setElevatorAction("STOPPED");
              }
            }
          }, ActionTiming.DOOR_CLOSE_TIME);
          break;
        }

        case "DOORS_OPEN": {
          // ドア開放時間後に閉め始める
          const timerId = setTimeout(() => {
            const currentState = get();
            if (currentState.elevatorStatus === "DOORS_OPEN") {
              get().setElevatorAction("CLOSING_DOORS");
            }
          }, ActionTiming.DOOR_WAIT_TIME);
          break;
        }

        case "STOPPED": {
          // 停止履歴を更新
          updateElevatorHistory(0, currentFloor, currentFloor, "STOP");

          // 停止状態でキューに要素がある場合は次の移動を開始
          const timerId = setTimeout(() => {
            const currentState = get();
            if (
              currentState.elevatorStatus === "STOPPED" &&
              currentState.floorQueue.length > 0
            ) {
              processElevatorMovement(set, get);
            }
          }, ActionTiming.FLOOR_CHANGE_DELAY);
          break;
        }
      }
    },

    // エレベーターの現在階を更新する関数
    updateCurrentFloor: (floor: number) => {
      const { targetFloor, elevatorStatus } = get();

      set({ currentFloor: floor });

      // Signal Storeと同期
      updateElevatorCurrentFloor(0, floor);

      // 目標階に到着した場合
      if (floor === targetFloor && elevatorStatus === "MOVING") {
        // ドアを開ける
        get().setElevatorAction("OPENING_DOORS");
      }
    },

    // キュー情報を取得する関数
    getElevatorQueue: () => {
      return [...get().floorQueue];
    },

    // ストアをリセットする関数
    resetThreeStore: () => {
      set({
        floorQueue: [],
        currentFloor: 1,
        targetFloor: 1,
        elevatorStatus: "STOPPED",
      });
    },
  };
});

// キュー内の次のフロアへの移動処理（プライベート関数）
function processElevatorMovement(
  set: (
    partial:
      | Partial<ElevatorThreeStore>
      | ((state: ElevatorThreeStore) => Partial<ElevatorThreeStore>),
  ) => void,
  get: () => ElevatorThreeStore,
) {
  const { floorQueue } = get();

  if (floorQueue.length === 0) return;

  // キューの先頭を取得
  const nextFloor = floorQueue[0];
  const newQueue = floorQueue.slice(1); // 最初の要素を削除

  set({
    floorQueue: newQueue,
    targetFloor: nextFloor,
    elevatorStatus: "MOVING",
  });
}
