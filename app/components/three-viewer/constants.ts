// 建物の定数
export const FLOOR_COUNT = 30;
export const FLOOR_HEIGHT = 1.2;
export const BUILDING_HEIGHT = FLOOR_COUNT * FLOOR_HEIGHT;
export const BUILDING_WIDTH = 8;
export const BUILDING_DEPTH = 8;

// カメラ距離閾値
export const MIN_CAMERA_DISTANCE = 15;
export const MAX_CAMERA_DISTANCE = 30;

// エレベーター状態
export enum ElevatorStatus {
  STOPPED = "STOPPED",
  MOVING = "MOVING",
  OPENING_DOORS = "OPENING_DOORS",
  DOORS_OPEN = "DOORS_OPEN",
  CLOSING_DOORS = "CLOSING_DOORS",
}

// エレベーター動作アクション
export enum ElevatorAction {
  MOVE = "MOVE",
  STOP = "STOPPED",
  DOOR_OPEN = "DOOR_OPEN",
  DOOR_CLOSE = "DOOR_CLOSE",
}

// エレベーター設定
export const ELEVATOR_COUNT = 1; // 将来的に増やすことを想定
