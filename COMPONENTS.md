# エレベーターシミュレーションコンポーネント一覧

このドキュメントでは、エレベーターシミュレーションプロジェクトで使用されている主要なコンポーネントについて説明します。

## 目次

1. [ElevatorSimulation](#elevatorsimulation) - メインシミュレーションコンポーネント
2. [ElevatorControls](#elevatorcontrols) - エレベーター制御用コンポーネント
3. [ElevatorHistory](#elevatorhistory) - エレベーター履歴表示用コンポーネント
4. [FloorSelector](#floorselector) - フロア選択用コンポーネント
5. [ElevatorInfoToggle](#elevatorinfotoggle) - エレベーター情報表示切替用コンポーネント
6. [FloorLabelsToggle](#floorlabelstoggle) - フロアラベル表示切替用コンポーネント
7. [ThreeViewer](#threeviewer) - 3D表示用コンポーネント

## ElevatorSimulation

**ファイル**: `app/components/elevator-simulation.tsx`

### 概要

アプリケーションのメインコンテナコンポーネントで、3Dビューワーとコントロールパネルを配置します。レスポンシブデザインを採用しており、画面サイズに応じてレイアウトが調整されます。

### 構成要素

- `ThreeViewer`: 左側の3Dビュー表示部分
- 右側のコントロールパネル:
  - `ElevatorControls`: エレベーターの電源や表示設定
  - `FloorSelector`: エレベーターの行き先フロア選択
  - `ElevatorHistory`: エレベーターの動作履歴表示

### 使用例

```jsx
// app/page.tsx
import ElevatorSimulation from "./components/elevator-simulation";

export default function HomePage() {
  return (
    <main>
      <ElevatorSimulation />
    </main>
  );
}
```

## ElevatorControls

**ファイル**: `app/components/elevator-controls.tsx`

### 概要

エレベーターシステムの電源制御、フロアラベルの表示・非表示、エレベーター情報の表示・非表示、緊急停止ボタンなど、エレベーターの基本操作インターフェースを提供します。

### 状態管理

- `elevatorPower`: エレベーターシステムの電源状態 (ON/OFF)

### 主要機能

- `handlePowerToggle()`: 電源ON/OFFを切り替え
- `handleEmergencyStop()`: エレベーターの緊急停止を行う

### Props

なし

### 使用例

```jsx
<ElevatorControls />
```

## ElevatorHistory

**ファイル**: `app/components/elevator-history.tsx`

### 概要

エレベーターの動作履歴を表示するコンポーネントです。エレベーターの移動、停止、ドアの開閉などのアクションをテーブル形式で表示します。複数台のエレベーターがある場合はタブで切り替えて表示できます。

### 状態管理

- `history`: エレベーターごとの移動履歴配列
- `selectedElevatorId`: 選択中のエレベーターID
- `updateCount`: 履歴更新カウンター

### 主要機能

- `formatTimestamp()`: タイムスタンプの表示形式を整える
- `translateAction()`: アクションの種類を日本語に翻訳

### 使用例

```jsx
<ElevatorHistory />
```

## FloorSelector

**ファイル**: `app/components/floor-selector.tsx`

### 概要

エレベーターの目的階を選択するためのインターフェースを提供します。フロアボタンをクリックして、エレベーターが移動する階を指定できます。

### 状態管理

- `selectedFloor`: 選択されたフロア番号
- `currentElevatorFloor`: エレベーターの現在位置
- `nextFloors`: エレベーターの移動予定フロアリスト

### 主要機能

- `handleFloorSelect(floor)`: フロア選択時にエレベーターに移動命令を出す

### 使用例

```jsx
<FloorSelector />
```

## ElevatorInfoToggle

**ファイル**: `app/components/elevator-info-toggle.tsx`

### 概要

エレベーターの現在階数と移動方向を表示するための情報パネルの表示/非表示を切り替えるコンポーネントです。

### Props

- `className`: オプションのスタイリング用クラス名

### 状態管理

- `showElevatorInfo`: エレベーター情報の表示状態

### 主要機能

- `handleElevatorInfoToggle()`: 情報表示の表示/非表示を切り替え

### 使用例

```jsx
<ElevatorInfoToggle />
// または
<ElevatorInfoToggle className="my-custom-class" />
```

## FloorLabelsToggle

**ファイル**: `app/components/floor-labels-toggle.tsx`

### 概要

ビル内の各フロアのラベル表示/非表示を切り替えるためのコンポーネントです。

### Props

- `className`: オプションのスタイリング用クラス名

### 状態管理

- `showFloorLabels`: フロアラベルの表示状態

### 主要機能

- `handleFloorLabelsToggle()`: フロアラベルの表示/非表示を切り替え

### 使用例

```jsx
<FloorLabelsToggle />
// または
<FloorLabelsToggle className="my-custom-class" />
```

## ThreeViewer

**ファイル**: `app/components/three-viewer/three-viewer.tsx`

### 概要

Three.jsを使用して、エレベーターシミュレーションの3Dビューを描画するコンポーネントです。ビル、エレベーター、フロアラベルなどの3Dモデルの作成と管理を行います。

### 主要機能

- ビルディングモデルの作成と表示
- エレベーターモデルの作成と表示
- フロアラベルの表示
- エレベーターのアニメーション制御
- カメラコントロールの設定
- グローバルAPIの提供（window経由で他のコンポーネントから3D要素を制御）

### グローバルAPI

- `moveElevator(elevatorId, floor)`: 指定されたエレベーターを特定のフロアに移動
- `setElevatorAction(elevatorId, action)`: エレベーターの状態を設定
- `getElevatorQueue(elevatorId)`: エレベーターの移動キューを取得
- `toggleFloorLabels()`: フロアラベルの表示/非表示を切り替え
- `setFloorLabelsVisibility(visible)`: フロアラベルの表示状態を設定
- `toggleElevatorInfo()`: エレベーター情報表示の表示/非表示を切り替え
- `setElevatorInfoVisibility(visible)`: エレベーター情報表示の表示状態を設定

### 使用例

```jsx
<ThreeViewer />
```

## コンポーネント間の連携

本プロジェクトでは、以下の方法でコンポーネント間の連携を実現しています：

1. **コンテキストAPI**: `ElevatorSystemContext`を使用してエレベーターの状態を共有
2. **グローバルWindowオブジェクト**: ThreeViewerで提供されるAPIを他のコンポーネントから呼び出し

これにより、UIコンポーネントからの操作が3Dビュー上でのエレベーターの動きに反映され、一貫性のあるユーザー体験を提供しています。