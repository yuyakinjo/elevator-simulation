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

    // 簡単なビルディングとエレベーターの表示（後で詳細実装）
    const buildingGeometry = new THREE.BoxGeometry(8, 15, 8);
    const buildingMaterial = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    scene.add(building);

    // エレベーターの3Dモデルを作成
    const elevatorGeometry = new THREE.BoxGeometry(2, 3, 2);
    const elevatorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const elevator = new THREE.Mesh(elevatorGeometry, elevatorMaterial);
    elevator.position.y = -6; // 初期位置を設定
    scene.add(elevator);

    // エレベーターの動作ロジック
    let targetFloor = -6; // 初期フロア
    const moveElevator = (floor: number) => {
      targetFloor = floor;
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
