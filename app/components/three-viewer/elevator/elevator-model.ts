import * as THREE from "three";
import { FLOOR_HEIGHT } from "../constants";
import type { ElevatorModel } from "../types";

export function createElevatorModel(
  scene: THREE.Scene,
  elevatorId = 0,
  offsetX = 0,
): ElevatorModel {
  // エレベーターのグループ
  const elevatorGroup = new THREE.Group();
  scene.add(elevatorGroup);

  // エレベーターの初期位置を設定（複数台の場合は水平方向にオフセット）
  elevatorGroup.position.set(offsetX, FLOOR_HEIGHT / 2, 0);

  // キャビン（本体部分）
  const elevatorCabinGeometry = new THREE.BoxGeometry(
    1.2,
    FLOOR_HEIGHT * 0.9,
    1.2,
  );
  const elevatorCabinMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000, // 初期は赤色（停止状態）
    roughness: 0.3,
    metalness: 0.5,
  });
  const elevatorCabin = new THREE.Mesh(
    elevatorCabinGeometry,
    elevatorCabinMaterial,
  );
  elevatorGroup.add(elevatorCabin);

  // ドア用の素材
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.2,
    metalness: 0.8,
  });

  // 左扉
  const leftDoorGeometry = new THREE.BoxGeometry(0.6, FLOOR_HEIGHT * 0.8, 0.1);
  const leftDoor = new THREE.Mesh(leftDoorGeometry, doorMaterial);
  leftDoor.position.set(-0.3, 0, 0.65); // 初期位置は閉じている
  elevatorGroup.add(leftDoor);

  // 右扉
  const rightDoorGeometry = new THREE.BoxGeometry(0.6, FLOOR_HEIGHT * 0.8, 0.1);
  const rightDoor = new THREE.Mesh(rightDoorGeometry, doorMaterial);
  rightDoor.position.set(0.3, 0, 0.65); // 初期位置は閉じている
  elevatorGroup.add(rightDoor);

  return {
    id: elevatorId,
    group: elevatorGroup,
    cabin: elevatorCabin,
    leftDoor,
    rightDoor,
  };
}
