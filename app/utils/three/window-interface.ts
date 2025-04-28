export interface ElevatorSystemWindow extends Window {
  moveElevator?: (elevatorId: number, floor: number) => void;
  setElevatorAction?: (elevatorId: number, action: string) => void;
  getElevatorQueue?: (elevatorId: number) => number[];
  updateElevatorSystemHistory?: (
    elevatorId: number,
    fromFloor: number,
    toFloor: number,
    action: string,
  ) => void;
  __ELEVATOR_SYSTEM__?: {
    updateHistory: (
      elevatorId: number,
      fromFloor: number,
      toFloor: number,
      action: string,
    ) => void;
  };
}
