import * as THREE from "three";
import {
  BUILDING_DEPTH,
  BUILDING_HEIGHT,
  BUILDING_WIDTH,
  FLOOR_COUNT,
  FLOOR_HEIGHT,
} from "../constants";
import type { BuildingModel } from "../types";

export function createBuildingModel(scene: THREE.Scene): BuildingModel {
  // 建物パーツのグループ化
  const buildingGroup = new THREE.Group();
  scene.add(buildingGroup);

  // 本体（外壁）
  createMainBuilding(buildingGroup);

  // バルコニーと手すり
  createBalconiesAndRailings(buildingGroup);

  // グレーの縦ライン（外観アクセント）
  createAccentLines(buildingGroup);

  // 透明度設定関数
  const setBuildingTransparency = (opacity: number): void => {
    buildingGroup.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        // マテリアル名に基づいて透明度を調整
        if (child.material.name === "glass") {
          // ガラス部分は元々透明なので元の透明度を維持しつつ調整
          child.material.opacity = Math.min(0.35, opacity + 0.1);
        } else if (child.material.name === "window") {
          // 窓も元々半透明なので調整
          child.material.opacity = Math.min(0.7, opacity + 0.2);
        } else {
          // その他の部分は指定された透明度を適用
          child.material.opacity = opacity;
        }

        // 透明度が1未満のときは透明設定を有効に
        child.material.transparent = opacity < 0.99;
      }
    });
  };

  return { group: buildingGroup, setBuildingTransparency };
}

function createMainBuilding(buildingGroup: THREE.Group): void {
  const buildingGeometry = new THREE.BoxGeometry(
    BUILDING_WIDTH,
    BUILDING_HEIGHT,
    BUILDING_DEPTH,
  );
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.7,
    metalness: 0.1,
    transparent: true,
    opacity: 1.0,
    name: "building",
  });
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
  building.position.y = BUILDING_HEIGHT / 2;
  buildingGroup.add(building);
}

function createBalconiesAndRailings(buildingGroup: THREE.Group): void {
  for (let i = 0; i < FLOOR_COUNT; i++) {
    // バルコニー床
    const balconyGeometry = new THREE.BoxGeometry(
      BUILDING_WIDTH + 0.6,
      0.12,
      BUILDING_DEPTH + 0.6,
    );
    const balconyMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      roughness: 0.8,
      transparent: true,
      opacity: 1.0,
      name: "balcony",
    });
    const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
    balcony.position.y = i * FLOOR_HEIGHT + 0.06;
    buildingGroup.add(balcony);

    // 手すり（ガラス風）
    createGlassRailings(buildingGroup, i);

    // 窓（各階に複数配置）
    createWindows(buildingGroup, i);
  }
}

function createGlassRailings(buildingGroup: THREE.Group, floor: number): void {
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x99ccff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0.5,
    name: "glass",
  });

  // 前面と背面のガラス手すり
  const glassGeometry = new THREE.BoxGeometry(BUILDING_WIDTH + 0.4, 0.3, 0.08);

  // 前面
  const glassFront = new THREE.Mesh(glassGeometry, glassMaterial);
  glassFront.position.set(
    0,
    floor * FLOOR_HEIGHT + 0.22,
    (BUILDING_DEPTH + 0.34) / 2,
  );
  buildingGroup.add(glassFront);

  // 背面
  const glassBack = new THREE.Mesh(glassGeometry, glassMaterial);
  glassBack.position.set(
    0,
    floor * FLOOR_HEIGHT + 0.22,
    -(BUILDING_DEPTH + 0.34) / 2,
  );
  buildingGroup.add(glassBack);

  // 左右のガラス手すり
  const glassSideGeometry = new THREE.BoxGeometry(
    0.08,
    0.3,
    BUILDING_DEPTH + 0.4,
  );

  // 右
  const glassRight = new THREE.Mesh(glassSideGeometry, glassMaterial);
  glassRight.position.set(
    (BUILDING_WIDTH + 0.34) / 2,
    floor * FLOOR_HEIGHT + 0.22,
    0,
  );
  buildingGroup.add(glassRight);

  // 左
  const glassLeft = new THREE.Mesh(glassSideGeometry, glassMaterial);
  glassLeft.position.set(
    -(BUILDING_WIDTH + 0.34) / 2,
    floor * FLOOR_HEIGHT + 0.22,
    0,
  );
  buildingGroup.add(glassLeft);
}

function createWindows(buildingGroup: THREE.Group, floor: number): void {
  const windowGeometry = new THREE.BoxGeometry(0.9, 0.7, 0.05);
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x87bde6,
    roughness: 0.2,
    metalness: 0.6,
    transparent: true,
    opacity: 0.7,
    name: "window",
  });

  for (let w = -2; w <= 2; w++) {
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    windowMesh.position.set(
      w * 1.6,
      floor * FLOOR_HEIGHT + 0.6,
      BUILDING_DEPTH / 2 + 0.03,
    );
    buildingGroup.add(windowMesh);
  }
}

function createAccentLines(buildingGroup: THREE.Group): void {
  const accentGeometry = new THREE.BoxGeometry(0.18, BUILDING_HEIGHT, 0.18);
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.5,
  });

  for (let a = -3; a <= 3; a += 2) {
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.set(
      a * 1.1,
      BUILDING_HEIGHT / 2,
      BUILDING_DEPTH / 2 + 0.12,
    );
    buildingGroup.add(accent);
  }
}
