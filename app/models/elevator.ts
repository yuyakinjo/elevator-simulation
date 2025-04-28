// エレベーターの移動方向を表す列挙型
export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  IDLE = "IDLE",
}

// エレベーターのステータスを表す列挙型
export enum ElevatorStatus {
  MOVING = "MOVING",
  STOPPED = "STOPPED",
  OPENING_DOORS = "OPENING_DOORS",
  DOORS_OPEN = "DOORS_OPEN",
  CLOSING_DOORS = "CLOSING_DOORS",
}

// エレベーターの設定
export const ELEVATOR_CONFIG = {
  FLOORS: 10, // フロアの数
  ELEVATOR_COUNT: 2, // エレベーターの台数
  FLOOR_HEIGHT: 4, // 各フロアの高さ（メートル）
  ELEVATOR_SPEED: 1, // エレベーターの速度（フロア/秒）
  DOOR_OPERATION_TIME: 2000, // ドアの開閉時間（ミリ秒）
  WAITING_TIME: 3000, // 乗客の乗り降り待機時間（ミリ秒）
};

// エレベーターのリクエストを表すインターフェース
export interface ElevatorRequest {
  fromFloor: number;
  toFloor: number;
  id: string;
  assignedElevatorId?: number;
  timestamp: number;
}

// 移動履歴のエントリーを定義するインターフェース
export interface MoveHistoryEntry {
  timestamp: number;
  fromFloor: number;
  toFloor: number;
  action: "MOVE" | "STOP" | "DOOR_OPEN" | "DOOR_CLOSE";
}

// エレベーターを表すクラス
export class Elevator {
  id: number;
  currentFloor: number;
  targetFloors: number[];
  direction: Direction;
  status: ElevatorStatus;
  doorTimer: number | null;
  moveHistory: MoveHistoryEntry[]; // 移動履歴の配列

  constructor(id: number, initialFloor = 1) {
    this.id = id;
    this.currentFloor = initialFloor;
    this.targetFloors = [];
    this.direction = Direction.IDLE;
    this.status = ElevatorStatus.STOPPED;
    this.doorTimer = null;
    this.moveHistory = []; // 初期化時に空の配列を設定

    // 初期状態を履歴に記録
    this.addHistoryEntry(initialFloor, initialFloor, "STOP");
  }

  // エレベーターに目的階を追加する
  addTargetFloor(floor: number): void {
    if (!this.targetFloors.includes(floor) && floor !== this.currentFloor) {
      this.targetFloors.push(floor);
      this.updateDirection();
    }
  }

  // 現在の方向を更新する
  updateDirection(): void {
    if (this.targetFloors.length === 0) {
      this.direction = Direction.IDLE;
      return;
    }

    // 動いている方向に合わせて次の目的地を決定
    if (this.direction === Direction.UP) {
      // 上方向に移動中の場合、現在の階より上の目的地があるか確認
      const hasHigherTargets = this.targetFloors.some(
        (floor) => floor > this.currentFloor,
      );
      if (hasHigherTargets) {
        this.direction = Direction.UP;
      } else {
        this.direction = Direction.DOWN;
      }
    } else if (this.direction === Direction.DOWN) {
      // 下方向に移動中の場合、現在の階より下の目的地があるか確認
      const hasLowerTargets = this.targetFloors.some(
        (floor) => floor < this.currentFloor,
      );
      if (hasLowerTargets) {
        this.direction = Direction.DOWN;
      } else {
        this.direction = Direction.UP;
      }
    } else {
      // 停止中の場合、次の目的地の方向を決定
      const nextTarget = this.targetFloors[0];
      if (nextTarget > this.currentFloor) {
        this.direction = Direction.UP;
      } else if (nextTarget < this.currentFloor) {
        this.direction = Direction.DOWN;
      }
    }
  }

  // 移動履歴にエントリーを追加するヘルパーメソッド
  private addHistoryEntry(
    fromFloor: number,
    toFloor: number,
    action: MoveHistoryEntry["action"],
  ): void {
    this.moveHistory.push({
      timestamp: Date.now(),
      fromFloor,
      toFloor,
      action,
    });
  }

  // エレベーターを次の階に移動させる
  moveToNextFloor(): void {
    if (
      this.targetFloors.length === 0 ||
      this.status !== ElevatorStatus.MOVING
    ) {
      return;
    }

    const previousFloor = this.currentFloor;

    // 現在の方向に基づいて移動
    if (this.direction === Direction.UP) {
      this.currentFloor++;
    } else if (this.direction === Direction.DOWN) {
      this.currentFloor--;
    }

    // 移動履歴を追加
    this.addHistoryEntry(previousFloor, this.currentFloor, "MOVE");

    // 目的階に到着したかどうかを確認
    this.checkArrival();
  }

  // 目的階に到着したかどうかを確認
  checkArrival(): void {
    if (this.targetFloors.includes(this.currentFloor)) {
      // 目的階に到着したら、その階を目的階リストから削除
      this.targetFloors = this.targetFloors.filter(
        (floor) => floor !== this.currentFloor,
      );
      // ドアを開ける
      this.openDoors();
    }
  }

  // ドアを開ける
  openDoors(): void {
    this.status = ElevatorStatus.OPENING_DOORS;

    // ドアを開く操作を履歴に追加
    this.addHistoryEntry(this.currentFloor, this.currentFloor, "DOOR_OPEN");

    this.doorTimer = window.setTimeout(() => {
      this.status = ElevatorStatus.DOORS_OPEN;
      // 一定時間後にドアを閉める
      this.doorTimer = window.setTimeout(() => {
        this.closeDoors();
      }, ELEVATOR_CONFIG.WAITING_TIME);
    }, ELEVATOR_CONFIG.DOOR_OPERATION_TIME);
  }

  // ドアを閉める
  closeDoors(): void {
    this.status = ElevatorStatus.CLOSING_DOORS;

    // ドアを閉じる操作を履歴に追加
    this.addHistoryEntry(this.currentFloor, this.currentFloor, "DOOR_CLOSE");

    this.doorTimer = window.setTimeout(() => {
      this.status =
        this.targetFloors.length > 0
          ? ElevatorStatus.MOVING
          : ElevatorStatus.STOPPED;

      // エレベーターが停止する場合は履歴に記録
      if (this.status === ElevatorStatus.STOPPED) {
        this.addHistoryEntry(this.currentFloor, this.currentFloor, "STOP");
      }

      this.updateDirection();
      this.doorTimer = null;
    }, ELEVATOR_CONFIG.DOOR_OPERATION_TIME);
  }

  // エレベーターの状態をクリアする（主にテスト用）
  reset(initialFloor = 1): void {
    this.currentFloor = initialFloor;
    this.targetFloors = [];
    this.direction = Direction.IDLE;
    this.status = ElevatorStatus.STOPPED;
    this.moveHistory = []; // 履歴もクリア
    if (this.doorTimer) {
      clearTimeout(this.doorTimer);
      this.doorTimer = null;
    }
  }

  // 移動履歴を取得するメソッド
  getMoveHistory(): MoveHistoryEntry[] {
    return this.moveHistory;
  }
}

// エレベーター管理システム
export class ElevatorSystem {
  elevators: Elevator[];
  pendingRequests: ElevatorRequest[];

  constructor() {
    this.elevators = Array.from(
      { length: ELEVATOR_CONFIG.ELEVATOR_COUNT },
      (_, i) => new Elevator(i),
    );
    this.pendingRequests = [];
  }

  // リクエストを追加する
  addRequest(fromFloor: number, toFloor: number): string {
    const request: ElevatorRequest = {
      fromFloor,
      toFloor,
      id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };

    // 最適なエレベーターを見つける
    const elevator = this.findOptimalElevator(request);

    if (elevator) {
      request.assignedElevatorId = elevator.id;

      // エレベーターが現在地と異なる階にいる場合のみターゲットに追加
      if (elevator.currentFloor !== fromFloor) {
        elevator.addTargetFloor(fromFloor); // 最初に乗客がいる階へ
      }

      this.pendingRequests.push(request);

      // リクエストを記録したら即座に状態を更新
      if (
        elevator.status === ElevatorStatus.STOPPED &&
        elevator.targetFloors.length > 0
      ) {
        elevator.status = ElevatorStatus.MOVING;
        elevator.updateDirection();
      }

      // シミュレーション更新
      this.update();
    } else {
      // すべてのエレベーターがビジー状態の場合、リクエストをキューに追加
      this.pendingRequests.push(request);
    }

    return request.id;
  }

  // 最適なエレベーターを見つける
  findOptimalElevator(request: ElevatorRequest): Elevator | null {
    let bestElevator: Elevator | null = null;
    let shortestDistance = Number.POSITIVE_INFINITY;

    for (const elevator of this.elevators) {
      // エレベーターが動いていない、または要求と同じ方向に移動中
      const isIdle = elevator.direction === Direction.IDLE;
      const isGoingUp =
        elevator.direction === Direction.UP &&
        request.fromFloor > elevator.currentFloor;
      const isGoingDown =
        elevator.direction === Direction.DOWN &&
        request.fromFloor < elevator.currentFloor;

      if (isIdle || isGoingUp || isGoingDown) {
        const distance = Math.abs(elevator.currentFloor - request.fromFloor);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          bestElevator = elevator;
        }
      }
    }

    // 最適なエレベーターが見つからない場合は、単純に最も近いエレベーターを選択
    if (!bestElevator) {
      for (const elevator of this.elevators) {
        const distance = Math.abs(elevator.currentFloor - request.fromFloor);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          bestElevator = elevator;
        }
      }
    }

    return bestElevator;
  }

  // リクエストが完了したかどうかを確認
  checkRequestCompletion(elevatorId: number): void {
    const completedRequests = this.pendingRequests.filter(
      (request) =>
        request.assignedElevatorId === elevatorId &&
        request.fromFloor === this.elevators[elevatorId].currentFloor &&
        this.elevators[elevatorId].status === ElevatorStatus.DOORS_OPEN,
    );

    for (const request of completedRequests) {
      // 乗客が乗ったので、目的階をエレベーターに追加
      this.elevators[elevatorId].addTargetFloor(request.toFloor);

      // リクエストを保留リストから削除
      this.pendingRequests = this.pendingRequests.filter(
        (r) => r.id !== request.id,
      );
    }
  }

  // システムを更新する（1ステップ）
  update(): void {
    // 各エレベーターの状態を更新
    for (const elevator of this.elevators) {
      if (elevator.status === ElevatorStatus.MOVING) {
        elevator.moveToNextFloor();
      }

      // リクエスト完了の確認
      this.checkRequestCompletion(elevator.id);
    }

    // 保留中のリクエストを処理（エレベーターが割り当てられていないもの）
    const unassignedRequests = this.pendingRequests.filter(
      (request) => request.assignedElevatorId === undefined,
    );
    for (const request of unassignedRequests) {
      const elevator = this.findOptimalElevator(request);
      if (elevator) {
        request.assignedElevatorId = elevator.id;
        elevator.addTargetFloor(request.fromFloor);
      }
    }
  }

  // すべてのエレベーターの履歴を取得
  getAllElevatorsHistory(): {
    elevatorId: number;
    history: MoveHistoryEntry[];
  }[] {
    return this.elevators.map((elevator) => ({
      elevatorId: elevator.id,
      history: elevator.getMoveHistory(),
    }));
  }

  // システムをリセットする
  reset(): void {
    for (const elevator of this.elevators) {
      elevator.reset(1); // 各エレベーターをリセット（1階に戻す）
    }
    this.pendingRequests = []; // 保留中のリクエストをクリア
  }

  // エレベーターを起動する
  startElevators(): void {
    for (const elevator of this.elevators) {
      if (
        elevator.status === ElevatorStatus.STOPPED &&
        elevator.targetFloors.length > 0
      ) {
        elevator.status = ElevatorStatus.MOVING;
        elevator.updateDirection();
      }
    }
  }
}
