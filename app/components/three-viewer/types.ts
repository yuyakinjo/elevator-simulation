import type * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ElevatorStatus } from "./constants";

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

export interface ElevatorModel {
  id: number;
  group: THREE.Group;
  cabin: THREE.Mesh;
  leftDoor: THREE.Mesh;
  rightDoor: THREE.Mesh;
}

export interface ElevatorState {
  status: ElevatorStatus;
  currentFloor: number;
  targetFloor: number;
  floorQueue: number[];
  doorAnimation: {
    isAnimating: boolean;
    openAmount: number;
    targetOpenAmount: number;
  };
}
