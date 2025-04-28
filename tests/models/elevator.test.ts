import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Direction,
  ELEVATOR_CONFIG,
  Elevator,
  ElevatorStatus,
  ElevatorSystem,
} from "../../app/models/elevator";

// windowのsetTimeoutとclearTimeoutをモック化
vi.useFakeTimers();

describe("Elevator", () => {
  let elevator: Elevator;

  beforeEach(() => {
    elevator = new Elevator(0, 1); // ID=0, 初期フロア=1
  });

  it("正しく初期化される", () => {
    expect(elevator.id).toBe(0);
    expect(elevator.currentFloor).toBe(1);
    expect(elevator.targetFloors).toEqual([]);
    expect(elevator.direction).toBe(Direction.IDLE);
    expect(elevator.status).toBe(ElevatorStatus.STOPPED);
    expect(elevator.doorTimer).toBeNull();

    // 初期化時に停止履歴が記録されることを確認
    const history = elevator.getMoveHistory();
    expect(history.length).toBe(1);
    expect(history[0].action).toBe("STOP");
    expect(history[0].fromFloor).toBe(1);
    expect(history[0].toFloor).toBe(1);
  });

  it("目的階を追加できる", () => {
    elevator.addTargetFloor(5);
    expect(elevator.targetFloors).toContain(5);
    expect(elevator.direction).toBe(Direction.UP);
  });

  it("現在階と同じ階は目的階に追加されない", () => {
    elevator.currentFloor = 3;
    elevator.addTargetFloor(3);
    expect(elevator.targetFloors).not.toContain(3);
  });

  it("既に目的階リストにある階は重複して追加されない", () => {
    elevator.addTargetFloor(5);
    elevator.addTargetFloor(5);
    expect(elevator.targetFloors.length).toBe(1);
  });

  it("上方向に移動できる", () => {
    elevator.addTargetFloor(5);
    elevator.status = ElevatorStatus.MOVING;
    elevator.moveToNextFloor();
    expect(elevator.currentFloor).toBe(2);
    expect(elevator.direction).toBe(Direction.UP);
  });

  it("下方向に移動できる", () => {
    elevator.currentFloor = 5;
    elevator.addTargetFloor(3);
    elevator.status = ElevatorStatus.MOVING;
    elevator.moveToNextFloor();
    expect(elevator.currentFloor).toBe(4);
    expect(elevator.direction).toBe(Direction.DOWN);
  });

  it("目的階に到着するとドアが開く", () => {
    elevator.addTargetFloor(3);
    elevator.status = ElevatorStatus.MOVING;

    // 目的階まで移動
    elevator.moveToNextFloor(); // 1 -> 2
    expect(elevator.currentFloor).toBe(2);
    expect(elevator.status).toBe(ElevatorStatus.MOVING);

    elevator.moveToNextFloor(); // 2 -> 3
    expect(elevator.currentFloor).toBe(3);
    expect(elevator.status).toBe(ElevatorStatus.OPENING_DOORS);
    expect(elevator.targetFloors).not.toContain(3);
  });

  it("ドアの開閉シーケンスが正しく行われる", () => {
    elevator.openDoors();
    expect(elevator.status).toBe(ElevatorStatus.OPENING_DOORS);

    // ドアが開くのを待つ
    vi.advanceTimersByTime(ELEVATOR_CONFIG.DOOR_OPERATION_TIME);
    expect(elevator.status).toBe(ElevatorStatus.DOORS_OPEN);

    // 待機時間後にドアが閉まり始める
    vi.advanceTimersByTime(ELEVATOR_CONFIG.WAITING_TIME);
    expect(elevator.status).toBe(ElevatorStatus.CLOSING_DOORS);

    // ドアが完全に閉まる
    vi.advanceTimersByTime(ELEVATOR_CONFIG.DOOR_OPERATION_TIME);
    expect(elevator.status).toBe(ElevatorStatus.STOPPED);
  });

  it("リセットすると初期状態に戻る", () => {
    elevator.addTargetFloor(5);
    elevator.status = ElevatorStatus.MOVING;
    elevator.moveToNextFloor();

    elevator.reset();
    expect(elevator.currentFloor).toBe(1);
    expect(elevator.targetFloors).toEqual([]);
    expect(elevator.direction).toBe(Direction.IDLE);
    expect(elevator.status).toBe(ElevatorStatus.STOPPED);
    expect(elevator.getMoveHistory().length).toBe(0);
  });
});

describe("ElevatorSystem", () => {
  let elevatorSystem: ElevatorSystem;

  beforeEach(() => {
    elevatorSystem = new ElevatorSystem();
  });

  it("正しく初期化される", () => {
    expect(elevatorSystem.elevators.length).toBe(
      ELEVATOR_CONFIG.ELEVATOR_COUNT,
    );
    expect(elevatorSystem.pendingRequests).toEqual([]);

    // 各エレベーターも正しく初期化されている
    for (let i = 0; i < ELEVATOR_CONFIG.ELEVATOR_COUNT; i++) {
      expect(elevatorSystem.elevators[i].id).toBe(i);
      expect(elevatorSystem.elevators[i].currentFloor).toBe(1);
    }
  });

  it("リクエストを追加できる", () => {
    const requestId = elevatorSystem.addRequest(3, 5);
    expect(requestId).toBeDefined();
    expect(elevatorSystem.pendingRequests.length).toBe(1);

    // 割り当てられたエレベーターの目的階が更新されている
    const assignedElevatorId =
      elevatorSystem.pendingRequests[0].assignedElevatorId!;
    const assignedElevator = elevatorSystem.elevators[assignedElevatorId];
    expect(assignedElevator.targetFloors).toContain(3);
  });

  it("最適なエレベーターを選択する", () => {
    // エレベーターを設定
    elevatorSystem.elevators[0].currentFloor = 1;
    elevatorSystem.elevators[1].currentFloor = 8;

    // リクエスト作成 (フロア3からフロア5へ)
    const request = {
      fromFloor: 3,
      toFloor: 5,
      id: "test-request",
      timestamp: Date.now(),
    };

    // 最も近いエレベーターが選択される
    const bestElevator = elevatorSystem.findOptimalElevator(request);
    expect(bestElevator!.id).toBe(0); // エレベーター0が選択される（距離: |1-3|=2 < |8-3|=5）
  });

  it("システム全体をリセットできる", () => {
    // リクエスト追加
    elevatorSystem.addRequest(3, 5);

    // システムのリセット
    elevatorSystem.reset();
    expect(elevatorSystem.pendingRequests).toEqual([]);

    // 全てのエレベーターもリセットされている
    for (const elevator of elevatorSystem.elevators) {
      expect(elevator.currentFloor).toBe(1);
      expect(elevator.targetFloors).toEqual([]);
    }
  });

  it("全てのエレベーターの履歴を取得できる", () => {
    // 各エレベーターに履歴を追加
    elevatorSystem.updateDirectHistory(0, 1, 2, "MOVE");
    elevatorSystem.updateDirectHistory(1, 1, 3, "MOVE");

    const allHistories = elevatorSystem.getAllElevatorsHistory();
    expect(allHistories.length).toBe(ELEVATOR_CONFIG.ELEVATOR_COUNT);

    // 各エレベーターの履歴が正しく含まれている
    const elevator0History = allHistories.find(
      (h) => h.elevatorId === 0,
    )!.history;
    const elevator1History = allHistories.find(
      (h) => h.elevatorId === 1,
    )!.history;

    // 初期化時の "STOP" 履歴 + 追加した "MOVE" 履歴
    expect(elevator0History.length).toBe(2);
    expect(elevator1History.length).toBe(2);

    // 最新の履歴が正しい
    expect(elevator0History[1].fromFloor).toBe(1);
    expect(elevator0History[1].toFloor).toBe(2);
    expect(elevator0History[1].action).toBe("MOVE");

    expect(elevator1History[1].fromFloor).toBe(1);
    expect(elevator1History[1].toFloor).toBe(3);
    expect(elevator1History[1].action).toBe("MOVE");
  });
});
