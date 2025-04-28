import type * as THREE from "three";
import { ElevatorStatus } from "../constants";
import type { ElevatorDirection, ElevatorModel, ElevatorState } from "../types";
import { ElevatorInfoDisplay } from "./elevator-info-display";

/**
 * エレベーターの情報表示を担当するコントローラークラス
 */
export class ElevatorInfoController {
  private infoDisplay: ElevatorInfoDisplay | null = null;

  constructor(
    private model: ElevatorModel,
    private state: ElevatorState,
    scene?: THREE.Scene,
  ) {
    // シーンが提供されている場合、エレベーター情報表示を初期化
    if (scene) {
      this.infoDisplay = new ElevatorInfoDisplay({ scene }, model.id);
      // 初期状態を設定
      this.infoDisplay.updateInfo(this.state.currentFloor, "none");
      this.infoDisplay.updatePosition(this.state.currentFloor, 0.8); // 少し上に配置
      console.log(`エレベーター${this.model.id + 1} 情報表示を初期化しました`);
    }
  }

  /**
   * 情報表示を更新
   */
  public updateInfoDisplay(): void {
    if (this.infoDisplay) {
      // 現在の階と方向を更新
      const direction = this.calculateDirection();

      // コンソールにデバッグ情報を出力（矢印の方向確認用）
      console.log(
        `エレベーター${this.model.id + 1} 現在階: ${this.state.currentFloor}, 方向: ${direction}, 状態: ${this.state.status}`,
      );

      this.infoDisplay.updateInfo(this.state.currentFloor, direction);

      // 位置を更新（エレベーターの上に配置）
      this.infoDisplay.updatePosition(this.state.currentFloor, 0.8);
    }
  }

  /**
   * 現在のエレベーター方向を計算
   * @returns エレベーターの方向
   */
  private calculateDirection(): ElevatorDirection {
    if (this.state.status !== ElevatorStatus.MOVING) {
      return "none";
    }

    const currentPosition = this.model.group.position.y;
    const targetPosition = this.state.targetFloor;

    if (targetPosition > currentPosition) {
      return "up";
    }
    if (targetPosition < currentPosition) {
      return "down";
    }

    return "none";
  }

  /**
   * エレベーター情報表示を設定
   * @param infoDisplay 設定する情報表示オブジェクト
   */
  public setInfoDisplay(infoDisplay: ElevatorInfoDisplay | null): void {
    this.infoDisplay = infoDisplay;

    // 初期状態を設定
    if (this.infoDisplay) {
      this.infoDisplay.updateInfo(
        this.state.currentFloor,
        this.calculateDirection(),
      );
      this.infoDisplay.updatePosition(this.state.currentFloor, 0.8); // 少し上に配置
    }
  }

  /**
   * エレベーター情報表示の表示/非表示を設定
   * @param visible 表示するかどうか
   */
  public setInfoDisplayVisibility(visible: boolean): void {
    if (this.infoDisplay) {
      this.infoDisplay.setVisibility(visible);
    }
  }

  /**
   * エレベーター情報表示の表示/非表示を切り替え
   * @returns 表示状態
   */
  public toggleInfoDisplayVisibility(): boolean {
    if (this.infoDisplay) {
      return this.infoDisplay.toggleVisibility();
    }
    return false;
  }

  /**
   * 情報表示オブジェクトを取得
   * @returns 情報表示オブジェクト
   */
  public getInfoDisplay(): ElevatorInfoDisplay | null {
    return this.infoDisplay;
  }
}
