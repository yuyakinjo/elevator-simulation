import type { ElevatorSystemWindow } from "@/app/utils/three/window-interface";
import * as THREE from "three";
import { ElevatorStatus, FLOOR_HEIGHT } from "../constants";
import type { ElevatorModel, ElevatorState } from "../types";
import { ElevatorAnimationController } from "./elevator-animation-controller";
import { ElevatorDoorController } from "./elevator-door-controller";
import { ElevatorInfoController } from "./elevator-info-controller";

export class ElevatorController {
  private state: ElevatorState;
  private animationController: ElevatorAnimationController;
  private doorController: ElevatorDoorController;
  private infoController: ElevatorInfoController;

  constructor(
    private model: ElevatorModel,
    private setBuildingTransparency: (opacity: number) => void,
    private scene?: THREE.Scene,
  ) {
    // 各フロアの高さを計算する補助関数
    const calculateFloorHeight = (floor: number): number => {
      return (floor - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
    };

    this.state = {
      status: ElevatorStatus.STOPPED,
      currentFloor: 1,
      targetFloor: calculateFloorHeight(1), // 直接数値を設定
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
    this.updateHistory = this.updateHistory.bind(this);
    this.checkAndProcessQueue = this.checkAndProcessQueue.bind(this);
    this.calculateFloorHeight = this.calculateFloorHeight.bind(this);

    // サブコントローラーの初期化
    this.animationController = new ElevatorAnimationController(
      this.model,
      this.state,
      this.setBuildingTransparency,
      this.updateHistory,
      this.setElevatorAction,
    );

    this.doorController = new ElevatorDoorController(
      this.model,
      this.state,
      this.updateHistory,
      this.setElevatorAction,
      this.checkAndProcessQueue,
    );

    this.infoController = new ElevatorInfoController(
      this.model,
      this.state,
      scene,
    );
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

  // エレベーター情報表示の表示/非表示を設定
  public setInfoDisplayVisibility(visible: boolean): void {
    this.infoController.setInfoDisplayVisibility(visible);
  }

  // エレベーター情報表示の表示/非表示を切り替え
  public toggleInfoDisplayVisibility(): boolean {
    return this.infoController.toggleInfoDisplayVisibility();
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

    // ドアコントローラーにドア関連の状態を通知
    this.doorController.handleDoorAction(action);

    switch (action) {
      case ElevatorStatus.CLOSING_DOORS:
        // ドアが閉まり終わったらキューをチェック
        setTimeout(() => {
          if (this.state.status === ElevatorStatus.CLOSING_DOORS) {
            console.log(`エレベーター${this.model.id + 1} ドアが閉まりました`);
            this.checkAndProcessQueue();
          }
        }, 2000);
        break;

      case ElevatorStatus.DOORS_OPEN:
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
    this.animationController.updateElevatorPosition();

    // ドアのアニメーション
    this.doorController.updateDoorAnimation();

    // 透明度の更新
    this.animationController.updateBuildingTransparency(camera);

    // エレベーター情報表示の更新
    this.infoController.updateInfoDisplay();
  }
}
