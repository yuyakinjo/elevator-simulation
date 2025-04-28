import type * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface SceneSetup {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
}

export interface CameraSetup {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
}

export interface BuildingModel {
  group: THREE.Group;
  setBuildingTransparency: (opacity: number) => void;
}

// エレベーターモデルの定義
export interface ElevatorModel {
  id: number; // エレベーターID
  group: THREE.Group; // エレベーター全体のグループ
  cabin: THREE.Mesh; // エレベーターキャビン
  leftDoor: THREE.Mesh; // 左ドア
  rightDoor: THREE.Mesh; // 右ドア
}

// エレベーターの状態
export interface ElevatorState {
  status: string; // 現在のステータス
  currentFloor: number; // 現在のフロア
  targetFloor: number; // 目標フロアの位置（高さ）
  floorQueue: number[]; // 移動予定のフロア順序
  doorAnimation: {
    isAnimating: boolean; // ドアのアニメーション中かどうか
    openAmount: number; // ドアの開き具合（0-1）
    targetOpenAmount: number; // 目標開き具合
  };
}

// エレベーターの進行方向
export type ElevatorDirection = "up" | "down" | "none";
