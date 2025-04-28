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
  toggleFloorLabels?: () => boolean; // フロアラベルの表示/非表示を切り替える
  setFloorLabelsVisibility?: (visible: boolean) => void; // フロアラベルの表示/非表示を設定
  toggleElevatorInfo?: () => boolean; // エレベーター情報表示の表示/非表示を切り替える
  setElevatorInfoVisibility?: (visible: boolean) => void; // エレベーター情報表示の表示/非表示を設定
}
