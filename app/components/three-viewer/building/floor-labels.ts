import * as THREE from "three";
import type { Font } from "three/examples/jsm/loaders/FontLoader.js";
import {
  BUILDING_DEPTH,
  BUILDING_WIDTH,
  FLOOR_COUNT,
  FLOOR_HEIGHT,
} from "../constants";

// フロアラベルの設定
interface FloorLabelsOptions {
  scene: THREE.Scene;
  font?: Font; // テキスト用のフォント
}

// フロアラベルを管理するクラス
export class FloorLabels {
  private labels: THREE.Mesh[] = [];
  private group: THREE.Group;
  private visible = true;

  constructor(options: FloorLabelsOptions) {
    const { scene } = options;

    // ラベルをグループ化するためのコンテナ
    this.group = new THREE.Group();
    this.group.name = "floor-labels";
    scene.add(this.group);

    // フロアラベルを作成
    this.createLabels();
  }

  // フロアラベルを作成
  private createLabels(): void {
    // フロア数だけラベルを作成
    for (let i = 0; i < FLOOR_COUNT; i++) {
      const floorNumber = i + 1; // 1から始まるフロア番号
      const yPosition = i * FLOOR_HEIGHT + FLOOR_HEIGHT / 2; // フロアの中央の高さ

      // フロア番号を表すキャンバスを作成
      const labelCanvas = this.createLabelCanvas(floorNumber);

      // テクスチャにキャンバスを使用
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      labelTexture.needsUpdate = true;

      // ラベル用の平面ジオメトリ
      const geometry = new THREE.PlaneGeometry(0.8, 0.4);
      const material = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });

      // メッシュ作成
      const label = new THREE.Mesh(geometry, material);

      // ビルの横に配置
      label.position.set(
        BUILDING_WIDTH / 2 + 0.6, // ビルの右側に少し間隔を開けて配置
        yPosition,
        BUILDING_DEPTH / 2,
      );

      // グループに追加
      this.group.add(label);
      this.labels.push(label);
    }
  }

  // ラベルテキストを描画するキャンバスを作成
  private createLabelCanvas(floorNumber: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;

    const context = canvas.getContext("2d");
    if (context) {
      // キャンバスをクリア
      context.fillStyle = "rgba(255, 255, 255, 0.8)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // テキストスタイル設定
      context.fillStyle = "#000000";
      context.font = "bold 40px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";

      // フロア番号を描画
      context.fillText(`${floorNumber}F`, canvas.width / 2, canvas.height / 2);
    }

    return canvas;
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
    for (const label of this.labels) {
      const geometry = label.geometry;
      const material = label.material as THREE.MeshBasicMaterial;

      if (material.map) {
        material.map.dispose();
      }

      material.dispose();
      geometry.dispose();
    }

    this.labels = [];
  }
}
