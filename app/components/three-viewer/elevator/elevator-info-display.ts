import * as THREE from "three";
import { BUILDING_WIDTH, FLOOR_HEIGHT } from "../constants";
import type { ElevatorDirection } from "../types";

// エレベーター情報表示の設定
interface ElevatorInfoDisplayOptions {
  scene: THREE.Scene;
}

// エレベーター情報表示を管理するクラス
export class ElevatorInfoDisplay {
  private floorDisplay: THREE.Mesh;
  private arrowDisplay: THREE.Mesh;
  private group: THREE.Group;
  private visible = true;
  private currentFloor = 1;
  private direction: ElevatorDirection = "none";

  constructor(
    private options: ElevatorInfoDisplayOptions,
    private elevatorId = 0,
  ) {
    const { scene } = options;

    // 情報表示をグループ化するためのコンテナ
    this.group = new THREE.Group();
    this.group.name = `elevator-info-${elevatorId}`;
    scene.add(this.group);

    // フロア情報表示を作成
    this.floorDisplay = this.createFloorDisplay();
    this.group.add(this.floorDisplay);

    // 矢印表示を作成
    this.arrowDisplay = this.createArrowDisplay();
    this.group.add(this.arrowDisplay);

    // 初期位置の設定
    this.updatePosition(1); // 初期階は1階
  }

  // フロア表示メッシュを作成
  private createFloorDisplay(): THREE.Mesh {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;

    const context = canvas.getContext("2d");
    if (context) {
      // キャンバスをクリア
      context.fillStyle = "rgba(0, 0, 0, 0.7)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // テキストスタイル設定
      context.fillStyle = "#ffffff";
      context.font = "bold 40px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";

      // フロア番号を描画
      context.fillText(
        `${this.currentFloor}F`,
        canvas.width / 2,
        canvas.height / 2,
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const geometry = new THREE.PlaneGeometry(0.8, 0.4);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0.6, 0); // エレベーターの上に配置

    return mesh;
  }

  // 矢印表示メッシュを作成
  private createArrowDisplay(): THREE.Mesh {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext("2d");
    if (context) {
      // キャンバスをクリア
      context.fillStyle = "rgba(0, 0, 0, 0)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // 矢印を描画しない（初期状態）
      this.drawArrow(context, "none");
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const geometry = new THREE.PlaneGeometry(0.6, 0.6);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 1.1, 0); // フロア表示の上に配置

    return mesh;
  }

  // 矢印を描画
  private drawArrow(
    context: CanvasRenderingContext2D,
    direction: ElevatorDirection,
  ): void {
    // キャンバスをクリア
    context.clearRect(0, 0, 128, 128);

    // 矢印の色を設定
    context.fillStyle = "#ffffff";
    context.strokeStyle = "#ffffff";
    context.lineWidth = 6;

    // 矢印の向きに応じて描画
    const centerX = 64;
    const centerY = 64;

    if (direction === "up") {
      // 上向き矢印
      context.beginPath();
      context.moveTo(centerX, 30);
      context.lineTo(centerX, 98);
      context.stroke();

      context.beginPath();
      context.moveTo(centerX, 30);
      context.lineTo(centerX - 20, 50);
      context.lineTo(centerX + 20, 50);
      context.closePath();
      context.fill();
    } else if (direction === "down") {
      // 下向き矢印
      context.beginPath();
      context.moveTo(centerX, 30);
      context.lineTo(centerX, 98);
      context.stroke();

      context.beginPath();
      context.moveTo(centerX, 98);
      context.lineTo(centerX - 20, 78);
      context.lineTo(centerX + 20, 78);
      context.closePath();
      context.fill();
    }
    // "none"の場合は何も描画しない
  }

  // 表示内容を更新
  public updateInfo(floor: number, direction: ElevatorDirection): void {
    this.currentFloor = floor;
    this.direction = direction;

    // フロア表示を更新
    const floorTexture = this.floorDisplay.material as THREE.MeshBasicMaterial;
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 128;
    floorCanvas.height = 64;

    const floorContext = floorCanvas.getContext("2d");
    if (floorContext) {
      floorContext.fillStyle = "rgba(0, 0, 0, 0.7)";
      floorContext.fillRect(0, 0, floorCanvas.width, floorCanvas.height);

      floorContext.fillStyle = "#ffffff";
      floorContext.font = "bold 40px Arial";
      floorContext.textAlign = "center";
      floorContext.textBaseline = "middle";

      floorContext.fillText(
        `${floor}F`,
        floorCanvas.width / 2,
        floorCanvas.height / 2,
      );
    }

    if (floorTexture.map) {
      floorTexture.map.dispose();
    }

    const newFloorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.map = newFloorTexture;
    floorTexture.needsUpdate = true;

    // 矢印表示を更新
    const arrowTexture = this.arrowDisplay.material as THREE.MeshBasicMaterial;
    const arrowCanvas = document.createElement("canvas");
    arrowCanvas.width = 128;
    arrowCanvas.height = 128;

    const arrowContext = arrowCanvas.getContext("2d");
    if (arrowContext) {
      arrowContext.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
      this.drawArrow(arrowContext, direction);
    }

    if (arrowTexture.map) {
      arrowTexture.map.dispose();
    }

    const newArrowTexture = new THREE.CanvasTexture(arrowCanvas);
    arrowTexture.map = newArrowTexture;
    arrowTexture.needsUpdate = true;
  }

  // エレベーターの位置に合わせて表示位置を更新
  public updatePosition(floor: number, yOffset = 0): void {
    const y = (floor - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + yOffset;
    this.group.position.set(0, y, BUILDING_WIDTH / 2 + 0.1); // ビルの壁から少し前に配置
  }

  // 表示/非表示を切り替え
  public setVisibility(visible: boolean): void {
    this.visible = visible;
    this.group.visible = visible;
  }

  // 現在の表示状態を取得
  public isVisible(): boolean {
    return this.visible;
  }

  // 表示/非表示を反転
  public toggleVisibility(): boolean {
    this.visible = !this.visible;
    this.group.visible = this.visible;
    return this.visible;
  }

  // リソース解放
  public dispose(): void {
    const floorMaterial = this.floorDisplay.material as THREE.MeshBasicMaterial;
    const arrowMaterial = this.arrowDisplay.material as THREE.MeshBasicMaterial;

    if (floorMaterial.map) {
      floorMaterial.map.dispose();
    }

    if (arrowMaterial.map) {
      arrowMaterial.map.dispose();
    }

    floorMaterial.dispose();
    arrowMaterial.dispose();
    this.floorDisplay.geometry.dispose();
    this.arrowDisplay.geometry.dispose();
  }
}
