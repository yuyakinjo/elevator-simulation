"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export default function ThreeViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Three.js の初期化
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 建物の定数を先に定義
    const FLOOR_COUNT = 30; // フロア数を高層マンション風に増加
    const FLOOR_HEIGHT = 1.2; // フロアあたりの高さ
    const BUILDING_HEIGHT = FLOOR_COUNT * FLOOR_HEIGHT; // 建物の総高さ
    const BUILDING_WIDTH = 8;
    const BUILDING_DEPTH = 8;

    // ライト追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // 柔らかい全体光
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // 太陽光風
    directionalLight.position.set(10, 40, 20);
    scene.add(directionalLight);

    const camera = new THREE.PerspectiveCamera(
      60, // 視野角を少し狭くして遠近感を調整
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    
    // カメラ位置をビル全体が見えるように調整
    camera.position.set(20, BUILDING_HEIGHT / 2, 25);
    // カメラをシーンの中心（ビルの中央）に向ける
    camera.lookAt(0, BUILDING_HEIGHT / 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    mountRef.current.appendChild(renderer.domElement);

    // コントロールの追加
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 建物パーツのグループ化（透明度を一括制御するため）
    const buildingParts = new THREE.Group();
    scene.add(buildingParts);

    // 本体（外壁）
    const buildingGeometry = new THREE.BoxGeometry(
      BUILDING_WIDTH,
      BUILDING_HEIGHT,
      BUILDING_DEPTH,
    );
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5, // 白系
      roughness: 0.7,
      metalness: 0.1,
      transparent: true, // 透明化可能に設定
      opacity: 1.0, // 初期値は不透明
      name: "building", // マテリアル名を追加
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = BUILDING_HEIGHT / 2;
    buildingParts.add(building); // グループに追加

    // バルコニーと手すり
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
        name: "balcony", // マテリアル名を追加
      });
      const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
      balcony.position.y = i * FLOOR_HEIGHT + 0.06;
      buildingParts.add(balcony);

      // 手すり（ガラス風）
      const glassGeometry = new THREE.BoxGeometry(
        BUILDING_WIDTH + 0.4,
        0.3,
        0.08,
      );
      const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x99ccff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.5,
        name: "glass", // マテリアル名を追加
      });
      // 前面
      const glassFront = new THREE.Mesh(glassGeometry, glassMaterial);
      glassFront.position.set(
        0,
        i * FLOOR_HEIGHT + 0.22,
        (BUILDING_DEPTH + 0.34) / 2,
      );
      buildingParts.add(glassFront); // グループに追加
      
      // 背面
      const glassBack = new THREE.Mesh(glassGeometry, glassMaterial);
      glassBack.position.set(
        0,
        i * FLOOR_HEIGHT + 0.22,
        -(BUILDING_DEPTH + 0.34) / 2,
      );
      buildingParts.add(glassBack); // グループに追加
      
      // 左右
      const glassSideGeometry = new THREE.BoxGeometry(
        0.08,
        0.3,
        BUILDING_DEPTH + 0.4,
      );
      // 右
      const glassRight = new THREE.Mesh(glassSideGeometry, glassMaterial);
      glassRight.position.set(
        (BUILDING_WIDTH + 0.34) / 2,
        i * FLOOR_HEIGHT + 0.22,
        0,
      );
      buildingParts.add(glassRight); // グループに追加
      
      // 左
      const glassLeft = new THREE.Mesh(glassSideGeometry, glassMaterial);
      glassLeft.position.set(
        -(BUILDING_WIDTH + 0.34) / 2,
        i * FLOOR_HEIGHT + 0.22,
        0,
      );
      buildingParts.add(glassLeft); // グループに追加

      // 窓（各階に複数配置）
      const windowGeometry = new THREE.BoxGeometry(0.9, 0.7, 0.05);
      const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x87bde6,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.7,
        name: "window", // マテリアル名を追加
      });
      for (let w = -2; w <= 2; w++) {
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(
          w * 1.6,
          i * FLOOR_HEIGHT + 0.6,
          BUILDING_DEPTH / 2 + 0.03,
        );
        buildingParts.add(windowMesh); // グループに追加
      }
    }

    // グレーの縦ライン（外観アクセント）
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
      buildingParts.add(accent); // グループに追加
    }

    // エレベーターの3Dモデル（中央に表示、外観の邪魔にならないよう小さめ）
    const elevatorGeometry = new THREE.BoxGeometry(
      1.2,
      FLOOR_HEIGHT * 0.9,
      1.2,
    );
    const elevatorMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
    });
    const elevator = new THREE.Mesh(elevatorGeometry, elevatorMaterial);
    elevator.position.y = FLOOR_HEIGHT / 2;
    scene.add(elevator);

    // 各フロアの高さを計算する関数
    const calculateFloorHeight = (floor: number): number => {
      // フロアは1から始まるので、計算時に調整（例：1階は建物の最下層）
      return (floor - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
    };

    // エレベーターの動作ロジック
    let targetFloor = calculateFloorHeight(1); // 初期フロアは1階
    const moveElevator = (floor: number) => {
      // フロア番号（1～10）から実際の高さを計算
      targetFloor = calculateFloorHeight(floor);
    };

    // アニメーションループ内でエレベーターを動かす
    const animate = () => {
      requestAnimationFrame(animate);

      // エレベーターの位置を更新 - 移動速度を遅くして透明状態の持続時間を長く
      if (elevator.position.y !== targetFloor) {
        const direction = targetFloor > elevator.position.y ? 0.05 : -0.05; // 速度を半分に
        elevator.position.y =
          Math.abs(targetFloor - elevator.position.y) < 0.05
            ? targetFloor
            : elevator.position.y + direction;

        // ビルをより透明にする（0.5→0.25に変更）
        buildingParts.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // ガラス部分は元々透明なので、それほど透明にしない
            if (child.material.opacity < 0.5) {
              child.material.opacity = Math.min(child.material.opacity, 0.2);
            } else {
              child.material.opacity = 0.25; // より透明に
            }
          }
        });
      } else {
        // エレベーターが目的階に到着したら元の透明度に戻す
        buildingParts.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // ガラス部分
            if (child.material.name === "glass") {
              child.material.opacity = 0.35;
            } 
            // 窓
            else if (child.material.name === "window") {
              child.material.opacity = 0.7;
            } 
            // その他の部分
            else {
              child.material.opacity = 1.0;
            }
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // グローバル関数としてエクスポート（後でUIと連携）
    (
      window as typeof window & { moveElevator: (floor: number) => void }
    ).moveElevator = moveElevator;

    // リサイズ対応
    const handleResize = () => {
      if (!mountRef.current) return;

      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
    };
    window.addEventListener("resize", handleResize);

    // クリーンアップ
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
