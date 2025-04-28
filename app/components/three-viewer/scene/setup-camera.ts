import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BUILDING_HEIGHT } from "../constants";
import type { CameraSetup } from "../types";

export function setupCamera(mountElement: HTMLDivElement): CameraSetup {
  const camera = new THREE.PerspectiveCamera(
    60,
    mountElement.clientWidth / mountElement.clientHeight,
    0.1,
    1000,
  );

  // カメラ位置をビル全体が見えるように調整
  camera.position.set(20, BUILDING_HEIGHT / 2, 25);
  // カメラをビルの中央に向ける
  camera.lookAt(0, BUILDING_HEIGHT / 2, 0);

  // コントロールの追加
  const controls = new OrbitControls(camera, mountElement);
  controls.enableDamping = true;
  controls.target.set(0, BUILDING_HEIGHT / 2, 0);
  controls.update();

  return { camera, controls };
}
