import * as THREE from "three";
import { ElevatorAction, ElevatorStatus, FLOOR_HEIGHT } from "../constants";
import type { ElevatorModel, ElevatorState } from "../types";

/**
 * エレベーターのアニメーション処理を担当するコントローラークラス
 */
export class ElevatorAnimationController {
  constructor(
    private model: ElevatorModel,
    private state: ElevatorState,
    private setBuildingTransparency: (opacity: number) => void,
    private updateHistory: (
      fromFloor: number,
      toFloor: number,
      action: string,
    ) => void,
    private setElevatorAction: (action: ElevatorStatus) => void,
  ) {}

  /**
   * エレベーターの位置を更新
   */
  public updateElevatorPosition(): void {
    if (
      this.model.group.position.y !== this.state.targetFloor &&
      this.state.status === ElevatorStatus.MOVING
    ) {
      // 移動方向と速度の決定
      const direction =
        this.state.targetFloor > this.model.group.position.y ? 0.05 : -0.05;

      // 移動前の階数を記録
      const previousFloor =
        Math.round(
          (this.model.group.position.y - FLOOR_HEIGHT / 2) / FLOOR_HEIGHT,
        ) + 1;

      // 位置の更新（目標に近づいたら直接設定）
      if (
        Math.abs(this.state.targetFloor - this.model.group.position.y) < 0.05
      ) {
        this.model.group.position.y = this.state.targetFloor;
      } else {
        this.model.group.position.y += direction;
      }

      // 移動後の階数を計算
      const currentFloor =
        Math.round(
          (this.model.group.position.y - FLOOR_HEIGHT / 2) / FLOOR_HEIGHT,
        ) + 1;

      // 階数が変わった場合、履歴を更新
      if (previousFloor !== currentFloor) {
        this.updateHistory(previousFloor, currentFloor, ElevatorAction.MOVE);
        this.state.currentFloor = currentFloor;
      }

      // 移動中はビルを半透明に
      this.setBuildingTransparency(0.25);
    } else if (
      this.model.group.position.y === this.state.targetFloor &&
      this.state.status === ElevatorStatus.MOVING
    ) {
      // 目的階に到着した処理
      const arrivedFloor =
        Math.round(
          (this.model.group.position.y - FLOOR_HEIGHT / 2) / FLOOR_HEIGHT,
        ) + 1;
      this.state.currentFloor = arrivedFloor;
      console.log(
        `エレベーター${this.model.id + 1} ${arrivedFloor}階に到着しました`,
      );

      // 履歴更新
      this.updateHistory(arrivedFloor, arrivedFloor, ElevatorAction.STOP);

      // ドアを開ける
      this.setElevatorAction(ElevatorStatus.OPENING_DOORS);
    }
  }

  /**
   * カメラ位置に基づいてビルの透明度を更新
   * @param camera Three.jsのカメラ
   */
  public updateBuildingTransparency(camera: THREE.Camera): void {
    // エレベーターが移動中は既に半透明に設定されているので、静止中のみ処理
    if (this.state.status !== ElevatorStatus.MOVING) {
      const buildingCenter = new THREE.Vector3(0, FLOOR_HEIGHT * 15, 0);
      const distanceToBuilding = camera.position.distanceTo(buildingCenter);

      const MIN_DISTANCE = 15;
      const MAX_DISTANCE = 30;

      if (distanceToBuilding > MIN_DISTANCE) {
        const transparency = Math.min(
          0.3 +
            ((distanceToBuilding - MIN_DISTANCE) /
              (MAX_DISTANCE - MIN_DISTANCE)) *
              0.6,
          0.9,
        );

        // 視点が遠い場合はビルを半透明に
        if (distanceToBuilding > MAX_DISTANCE) {
          this.setBuildingTransparency(0.2);
        } else {
          this.setBuildingTransparency(1 - transparency);
        }
      } else {
        // 近い場合は完全不透明
        this.setBuildingTransparency(1.0);
      }
    }
  }

  /**
   * フロアの高さを計算
   * @param floor フロア番号
   * @returns フロアの高さ（Y座標）
   */
  public calculateFloorHeight(floor: number): number {
    return (floor - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
  }
}
