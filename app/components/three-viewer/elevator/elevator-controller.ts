import type { ElevatorSystemWindow } from "@/app/utils/three/window-interface";
import * as THREE from "three";
import { ElevatorAction, ElevatorStatus, FLOOR_HEIGHT } from "../constants";
import type { ElevatorDirection, ElevatorModel, ElevatorState } from "../types";
import { ElevatorInfoDisplay } from "./elevator-info-display";

export class ElevatorController {
  private state: ElevatorState;
  private infoDisplay: ElevatorInfoDisplay | null = null;

  constructor(
    private model: ElevatorModel,
    private setBuildingTransparency: (opacity: number) => void,
    private scene?: THREE.Scene,
  ) {
    this.state = {
      status: ElevatorStatus.STOPPED,
      currentFloor: 1,
      targetFloor: this.calculateFloorHeight(1),
      floorQueue: [],
      doorAnimation: {
        isAnimating: false,
        openAmount: 0, // 0: 閉じている、1: 開いている
        targetOpenAmount: 0,
      },
    };

    // メソッドのバインド
    this.moveElevator = this.moveElevator.bind(this);
    this.setElevatorAction = this.setElevatorAction.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);
    this.getElevatorQueue = this.getElevatorQueue.bind(this);

    // シーンが提供されている場合、エレベーター情報表示を初期化
    if (scene) {
      this.infoDisplay = new ElevatorInfoDisplay({ scene }, model.id);
    }
  }

  // 各フロアの高さを計算する関数
  private calculateFloorHeight(floor: number): number {
    return (floor - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
  }

  // エレベーター移動処理
  private processElevatorMovement(): void {
    if (this.state.floorQueue.length === 0) return;

    const nextFloor = this.state.floorQueue[0];
    this.state.targetFloor = this.calculateFloorHeight(nextFloor);

    this.setElevatorAction(ElevatorStatus.MOVING);

    // キューから処理した階を削除
    this.state.floorQueue.shift();

    console.log(
      `エレベーター${this.model.id + 1} 移動開始: ${nextFloor}階へ, 残りキュー: [${this.state.floorQueue.join(", ")}]`,
    );
  }

  // キュー処理
  private checkAndProcessQueue(): void {
    if (this.state.floorQueue.length > 0) {
      this.processElevatorMovement();
    }
  }

  // 履歴更新
  private updateHistory(
    fromFloor: number,
    toFloor: number,
    action: string,
  ): void {
    const elevatorWindow = window as ElevatorSystemWindow;
    if (elevatorWindow.updateElevatorSystemHistory) {
      elevatorWindow.updateElevatorSystemHistory(
        this.model.id, // エレベーターID
        fromFloor,
        toFloor,
        action,
      );
    }
  }

  // 現在のエレベーター方向を計算
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

  // エレベーター情報表示を設定
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

  // エレベーター情報表示の表示/非表示を設定
  public setInfoDisplayVisibility(visible: boolean): void {
    if (this.infoDisplay) {
      this.infoDisplay.setVisibility(visible);
    }
  }

  // エレベーター情報表示の表示/非表示を切り替え
  public toggleInfoDisplayVisibility(): boolean {
    if (this.infoDisplay) {
      return this.infoDisplay.toggleVisibility();
    }
    return false;
  }

  // 外部公開API: エレベーター移動指示
  public moveElevator(floor: number): void {
    // 現在のエレベーター位置から階数を計算
    const currentElevatorY = this.model.group.position.y;
    this.state.currentFloor =
      Math.round((currentElevatorY - FLOOR_HEIGHT / 2) / FLOOR_HEIGHT) + 1;

    console.log(
      `エレベーター${this.model.id + 1} 現在の階: ${this.state.currentFloor}, 目的階: ${floor}, 状態: ${this.state.status}`,
    );

    // 現在の階と同じ場合は何もしない
    if (
      floor === this.state.currentFloor &&
      (this.state.status === ElevatorStatus.STOPPED ||
        this.state.status === ElevatorStatus.DOORS_OPEN)
    ) {
      console.log(
        `エレベーター${this.model.id + 1} 現在の階と同じなので何もしない`,
      );
      return;
    }

    // すでにキューに含まれている場合は追加しない
    if (this.state.floorQueue.includes(floor)) {
      console.log(
        `エレベーター${this.model.id + 1} ${floor}階はすでにキューに含まれています`,
      );
      return;
    }

    // 目標フロアをキューに追加
    this.state.floorQueue.push(floor);
    console.log(
      `エレベーター${this.model.id + 1} ${floor}階をキューに追加, 現在のキュー: [${this.state.floorQueue.join(", ")}]`,
    );

    // エレベーターの現在の状態に応じた処理
    if (this.state.status === ElevatorStatus.STOPPED) {
      this.processElevatorMovement(); // 停止中なら即座に移動開始
    } else if (this.state.status === ElevatorStatus.DOORS_OPEN) {
      this.setElevatorAction(ElevatorStatus.CLOSING_DOORS); // ドアが開いている場合は閉めてから移動
    }
    // その他の状態（移動中、ドア開閉中）では次の処理を待つ
  }

  // 外部公開API: エレベーター状態設定
  public setElevatorAction(action: ElevatorStatus): void {
    const previousStatus = this.state.status;
    this.state.status = action;

    console.log(
      `エレベーター${this.model.id + 1} 状態変更: ${previousStatus} -> ${action}`,
    );

    switch (action) {
      case ElevatorStatus.OPENING_DOORS:
        this.state.doorAnimation.isAnimating = true;
        this.state.doorAnimation.targetOpenAmount = 1;
        break;

      case ElevatorStatus.CLOSING_DOORS:
        this.state.doorAnimation.isAnimating = true;
        this.state.doorAnimation.targetOpenAmount = 0;
        // ドアが閉まり終わったらキューをチェック
        setTimeout(() => {
          if (this.state.status === ElevatorStatus.CLOSING_DOORS) {
            console.log(`エレベーター${this.model.id + 1} ドアが閉まりました`);
            this.checkAndProcessQueue();
          }
        }, 2000);
        break;

      case ElevatorStatus.DOORS_OPEN:
        this.state.doorAnimation.openAmount = 1;
        this.state.doorAnimation.isAnimating = false;

        // 一定時間後にドアを閉める
        setTimeout(() => {
          if (this.state.status === ElevatorStatus.DOORS_OPEN) {
            console.log(`エレベーター${this.model.id + 1} ドアを閉めます`);
            this.setElevatorAction(ElevatorStatus.CLOSING_DOORS);
          }
        }, 3000);
        break;

      case ElevatorStatus.STOPPED:
        // 停止状態にはエレベーターをライトグレー色に（赤から変更）
        if (this.model.cabin.material instanceof THREE.MeshStandardMaterial) {
          this.model.cabin.material.color.set(0xd3d3d3);
        }

        // 停止したらキューをチェックして次の目的地があれば移動
        setTimeout(() => {
          if (
            this.state.status === ElevatorStatus.STOPPED &&
            this.state.floorQueue.length > 0
          ) {
            console.log(
              `エレベーター${this.model.id + 1} 停止状態でキューに要素があるため移動開始`,
            );
            this.processElevatorMovement();
          }
        }, 500);
        break;

      case ElevatorStatus.MOVING:
        // 移動中は緑色
        if (this.model.cabin.material instanceof THREE.MeshStandardMaterial) {
          this.model.cabin.material.color.set(0x00ff00);
        }
        break;
    }
  }

  // 外部公開API: キュー取得
  public getElevatorQueue(): number[] {
    return [...this.state.floorQueue]; // 配列のコピーを返す
  }

  // アニメーションの更新（毎フレーム呼び出し）
  public updateAnimation(camera: THREE.Camera): void {
    // エレベーター位置の更新
    this.updateElevatorPosition();

    // ドアのアニメーション
    this.updateDoorAnimation();

    // 透明度の更新
    this.updateBuildingTransparency(camera);

    // エレベーター情報表示の更新
    this.updateInfoDisplay();
  }

  // エレベーター情報表示の更新
  private updateInfoDisplay(): void {
    if (this.infoDisplay) {
      // 現在の階と方向を更新
      this.infoDisplay.updateInfo(
        this.state.currentFloor,
        this.calculateDirection(),
      );

      // 位置を更新（エレベーターの上に配置）
      const currentPosition = this.model.group.position.y;
      this.infoDisplay.updatePosition(this.state.currentFloor, 0.8);
    }
  }

  private updateElevatorPosition(): void {
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

  private updateDoorAnimation(): void {
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
                this.processElevatorMovement();
              } else {
                this.setElevatorAction(ElevatorStatus.STOPPED);
              }
            }
          }, 100);
        }
      }
    }

    // ドア位置の更新
    this.model.leftDoor.position.x =
      -0.3 - this.state.doorAnimation.openAmount * 0.5;
    this.model.rightDoor.position.x =
      0.3 + this.state.doorAnimation.openAmount * 0.5;
  }

  private updateBuildingTransparency(camera: THREE.Camera): void {
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
}
