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

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    mountRef.current.appendChild(renderer.domElement);

    // コントロールの追加
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 建物の定数を定義
    const FLOOR_COUNT = 10; // フロア数
    const FLOOR_HEIGHT = 1.5; // フロアあたりの高さ
    const BUILDING_HEIGHT = FLOOR_COUNT * FLOOR_HEIGHT; // 建物の総高さ
    const BUILDING_WIDTH = 8;
    const BUILDING_DEPTH = 8;

    // 簡単なビルディングとエレベーターの表示
    const buildingGeometry = new THREE.BoxGeometry(
      BUILDING_WIDTH,
      BUILDING_HEIGHT,
      BUILDING_DEPTH,
    );
    const buildingMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

    // 建物の底面が地面に接するように配置
    building.position.y = BUILDING_HEIGHT / 2;
    scene.add(building);

    // エレベーターの3Dモデルを作成
    const elevatorGeometry = new THREE.BoxGeometry(2, FLOOR_HEIGHT * 0.9, 2);
    const elevatorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const elevator = new THREE.Mesh(elevatorGeometry, elevatorMaterial);

    // 1階を初期位置として設定（建物の底から少し上）
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

      // エレベーターの位置を更新
      if (elevator.position.y !== targetFloor) {
        const direction = targetFloor > elevator.position.y ? 0.1 : -0.1;
        elevator.position.y =
          Math.abs(targetFloor - elevator.position.y) < 0.1
            ? targetFloor
            : elevator.position.y + direction;
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
