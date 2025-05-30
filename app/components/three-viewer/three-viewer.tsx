"use client";

import type { ElevatorSystemWindow } from "@/app/utils/three/window-interface";
import { useEffect, useRef } from "react";
import { createBuildingModel } from "./building/building-model";
import { FloorLabels } from "./building/floor-labels";
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

    // フロアラベル作成
    const floorLabels = new FloorLabels({ scene });

    // エレベーターの生成と管理（複数台に対応）
    const elevatorControllers: ElevatorController[] = [];

    for (let i = 0; i < ELEVATOR_COUNT; i++) {
      // 複数台の場合は水平方向にオフセット（現在は1台）
      const offsetX = (i - (ELEVATOR_COUNT - 1) / 2) * 3;

      // エレベーターモデル作成
      const elevator = createElevatorModel(scene, i, offsetX);

      // コントローラー作成（シーンを渡してエレベーター情報表示を初期化）
      const controller = new ElevatorController(
        elevator,
        building.setBuildingTransparency,
        scene,
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

    // フロアラベル表示/非表示切り替えAPI
    elevatorWindow.toggleFloorLabels = () => {
      return floorLabels.toggleVisibility();
    };

    elevatorWindow.setFloorLabelsVisibility = (visible: boolean) => {
      floorLabels.setVisibility(visible);
    };

    // エレベーター情報表示の表示/非表示切り替えAPI
    elevatorWindow.toggleElevatorInfo = () => {
      // 全てのエレベーターで同じ表示状態を維持
      const result = elevatorControllers[0].toggleInfoDisplayVisibility();

      // 他のエレベーターも同じ状態に更新
      for (let i = 1; i < elevatorControllers.length; i++) {
        elevatorControllers[i].setInfoDisplayVisibility(result);
      }

      return result;
    };

    elevatorWindow.setElevatorInfoVisibility = (visible: boolean) => {
      // 全てのエレベーターの表示状態を設定
      for (const controller of elevatorControllers) {
        controller.setInfoDisplayVisibility(visible);
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
      floorLabels.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
