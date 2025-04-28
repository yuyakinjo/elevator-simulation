"use client";

import type { ElevatorSystemWindow } from "@/app/utils/three/window-interface";
import { useEffect, useRef } from "react";
import { createBuildingModel } from "./building/building-model";
import { ELEVATOR_COUNT, type ElevatorStatus } from "./constants";
import { ElevatorController } from "./elevator/elevator-controller";
import { createElevatorModel } from "./elevator/elevator-model";
import { setupCamera } from "./scene/setup-camera";
import { setupLights } from "./scene/setup-lights";
import { setupScene } from "./scene/setup-scene";

export function ThreeViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // シーン初期化
    const { scene, renderer } = setupScene(mountRef.current);

    // カメラ設定
    const { camera, controls } = setupCamera(mountRef.current);

    // ライト追加
    setupLights(scene);

    // 建物モデル作成
    const building = createBuildingModel(scene);

    // エレベーターの生成と管理（複数台に対応）
    const elevatorControllers: ElevatorController[] = [];

    for (let i = 0; i < ELEVATOR_COUNT; i++) {
      // 複数台の場合は水平方向にオフセット（現在は1台）
      const offsetX = (i - (ELEVATOR_COUNT - 1) / 2) * 3;

      // エレベーターモデル作成
      const elevator = createElevatorModel(scene, i, offsetX);

      // コントローラー作成
      const controller = new ElevatorController(
        elevator,
        building.setBuildingTransparency,
      );
      elevatorControllers.push(controller);
    }

    // グローバルAPI登録
    const elevatorWindow = window as ElevatorSystemWindow;

    // 特定エレベーターへの指示を行うAPI
    elevatorWindow.moveElevator = (elevatorId: number, floor: number) => {
      if (elevatorId >= 0 && elevatorId < elevatorControllers.length) {
        elevatorControllers[elevatorId].moveElevator(floor);
      }
    };

    elevatorWindow.setElevatorAction = (elevatorId: number, action: string) => {
      if (elevatorId >= 0 && elevatorId < elevatorControllers.length) {
        elevatorControllers[elevatorId].setElevatorAction(
          action as ElevatorStatus,
        );
      }
    };

    elevatorWindow.getElevatorQueue = (elevatorId: number) => {
      if (elevatorId >= 0 && elevatorId < elevatorControllers.length) {
        return elevatorControllers[elevatorId].getElevatorQueue();
      }
      return [];
    };

    // 履歴更新API（既存システムとの互換性を維持）
    elevatorWindow.updateElevatorSystemHistory = (
      elevatorId: number,
      fromFloor: number,
      toFloor: number,
      action: string,
    ) => {
      const globalSystem = elevatorWindow.__ELEVATOR_SYSTEM__;
      if (globalSystem && typeof globalSystem.updateHistory === "function") {
        globalSystem.updateHistory(elevatorId, fromFloor, toFloor, action);
      }
    };

    // アニメーションループ
    const animate = () => {
      requestAnimationFrame(animate);

      // 各エレベーターのアニメーションを更新
      for (const controller of elevatorControllers) {
        controller.updateAnimation(camera);
      }

      // コントロール更新とレンダリング
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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
