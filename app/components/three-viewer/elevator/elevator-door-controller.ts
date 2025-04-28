import { ElevatorAction, ElevatorStatus } from "../constants";
import type { ElevatorModel, ElevatorState } from "../types";

/**
 * エレベーターのドア制御を担当するコントローラークラス
 */
export class ElevatorDoorController {
  constructor(
    private model: ElevatorModel,
    private state: ElevatorState,
    private updateHistory: (fromFloor: number, toFloor: number, action: string) => void,
    private setElevatorAction: (action: ElevatorStatus) => void,
    private checkAndProcessQueue: () => void,
  ) {}

  /**
   * ドアのアニメーションを更新
   */
  public updateDoorAnimation(): void {
    if (!this.state.doorAnimation.isAnimating) return;

    if (
      this.state.doorAnimation.targetOpenAmount >
      this.state.doorAnimation.openAmount
    ) {
      // ドアを開く
      this.state.doorAnimation.openAmount += 0.02;

      if (
        this.state.doorAnimation.openAmount >=
        this.state.doorAnimation.targetOpenAmount
      ) {
        this.state.doorAnimation.openAmount =
          this.state.doorAnimation.targetOpenAmount;
        this.state.doorAnimation.isAnimating = false;

        // ドアが完全に開いたらステータス更新
        if (this.state.status === ElevatorStatus.OPENING_DOORS) {
          console.log(`エレベーター${this.model.id + 1} ドアが開ききりました`);

          // 履歴更新
          this.updateHistory(
            this.state.currentFloor,
            this.state.currentFloor,
            ElevatorAction.DOOR_OPEN,
          );

          // ドアを開いた状態に設定
          setTimeout(() => {
            if (this.state.status === ElevatorStatus.OPENING_DOORS) {
              this.setElevatorAction(ElevatorStatus.DOORS_OPEN);
            }
          }, 100);
        }
      }
    } else if (
      this.state.doorAnimation.targetOpenAmount <
      this.state.doorAnimation.openAmount
    ) {
      // ドアを閉じる
      this.state.doorAnimation.openAmount -= 0.02;

      if (
        this.state.doorAnimation.openAmount <=
        this.state.doorAnimation.targetOpenAmount
      ) {
        this.state.doorAnimation.openAmount =
          this.state.doorAnimation.targetOpenAmount;
        this.state.doorAnimation.isAnimating = false;

        // ドアが完全に閉まった場合の処理
        if (this.state.status === ElevatorStatus.CLOSING_DOORS) {
          console.log(`エレベーター${this.model.id + 1} ドアが閉まりました`);

          // 履歴更新
          this.updateHistory(
            this.state.currentFloor,
            this.state.currentFloor,
            ElevatorAction.DOOR_CLOSE,
          );

          // 次のステータスを設定
          setTimeout(() => {
            if (this.state.status === ElevatorStatus.CLOSING_DOORS) {
              if (this.state.floorQueue.length > 0) {
                console.log(
                  `エレベーター${this.model.id + 1} 次の目的地へ移動します`,
                );
                this.checkAndProcessQueue();
              } else {
                this.setElevatorAction(ElevatorStatus.STOPPED);
              }
            }
          }, 100);
        }
      }
    }

    // ドア位置の更新
    this.updateDoorPositions();
  }

  /**
   * ドアの位置を更新
   */
  public updateDoorPositions(): void {
    this.model.leftDoor.position.x =
      -0.3 - this.state.doorAnimation.openAmount * 0.5;
    this.model.rightDoor.position.x =
      0.3 + this.state.doorAnimation.openAmount * 0.5;
  }

  /**
   * ドアの開閉状態を設定
   * @param action エレベーターのアクション
   * @returns 
   */
  public handleDoorAction(action: ElevatorStatus): void {
    switch (action) {
      case ElevatorStatus.OPENING_DOORS:
        this.state.doorAnimation.isAnimating = true;
        this.state.doorAnimation.targetOpenAmount = 1;
        break;

      case ElevatorStatus.CLOSING_DOORS:
        this.state.doorAnimation.isAnimating = true;
        this.state.doorAnimation.targetOpenAmount = 0;
        break;

      case ElevatorStatus.DOORS_OPEN:
        this.state.doorAnimation.openAmount = 1;
        this.state.doorAnimation.isAnimating = false;
        break;
    }
  }
}