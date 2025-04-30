# Elevator Simulation プロジェクト - Copilot Instructions

## プロジェクト概要

このプロジェクトは、Web上でエレベーターの動作をシミュレーションするアプリケーションです。
Three.jsを活用して3Dグラフィックスでエレベーターの動きを表現し、リアルタイムで操作・監視できる機能を提供します。

## 技術スタック

- **フロントエンド**: React (v19)
- **フレームワーク**: Next.js (v15.3.1)
- **3Dレンダリング**: Three.js (v0.176.0)
- **スタイリング**: TailwindCSS (v4)
- **パッケージマネージャー**: Bun
- **リンター/フォーマッター**: Biome
- **ビルドツール**: Turbopack

## プロジェクト構成

```
elevator-simulation/
├── .github/               # GitHub関連ファイル
app/
├── components/
│   ├── elevator-controls.tsx      - Signalsを使った制御UI
│   ├── elevator-history.tsx       - Signalsを使った履歴表示
│   ├── elevator-simulation.tsx    - メインレイアウトコンポーネント
│   ├── floor-selector.tsx        - Signalsを使ったフロア選択UI
│   └── three-viewer.tsx          - useSyncExternalStoreを使ったThree.js連携
├── contexts/
│   └── ElevatorSystemContext.tsx  - Signalsストアへのアクセス提供
├── models/
│   └── elevator.ts               - エレベーターの基本モデル定義
├── stores/
│   ├── elevatorSignalStore.ts    - Signalsベースの状態管理
│   └── elevatorThreeStore.ts     - Three.js用の外部ストア
├── public/                # 静的アセット
│   ├── file.svg           # アイコン等のSVG画像
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── biome.json             # Biomeの設定ファイル
├── bun.lock               # Bunのロックファイル
├── next-env.d.ts          # Next.jsの型定義
├── next.config.ts         # Next.jsの設定
├── package.json           # プロジェクト依存関係と設定
├── postcss.config.mjs     # PostCSSの設定
├── README.md              # プロジェクトの説明
└── tsconfig.json          # TypeScriptの設定
```

## 開発のヒント

- エレベーターの動きのシミュレーションはThree.jsを使用して実装する予定です
- 状態管理はReactのフック（useState, useReducerなど）を活用します
- UIコンポーネントはTailwindCSSを使用してスタイリングします
- コンポーネントの配置はapp/内のディレクトリ構造に従います
- tsファイルを修正した場合は、リントを実行

## 開発コマンド

- 開発サーバーの起動: `bun run dev`
- ビルド: `bun run build`
- 本番用サーバーの起動: `bun run start`
- リント: `bun run lint`
- テスト: `bun run test`

## コーディングスタイル

- コーディングスタイルは一貫性を持たせる
- anyは使用しない
- できるだけ、as の型アサーションの使用を避ける
- import文は、@からはじまる相対パスを使用
- 変数名はキャメルケースを使用
- 定数は全て大文字のスネークケースを使用
- for文のループ内で条件文を使う場合、array.filterを使用
- useCallback, useMemoは使わないでください
- setInterval, setTimeout、useEffectは使わず、イベント駆動にしてください
- コンポーネントはexport でエクスポートしてください(export defaultは使用しない)

## イベント駆動アーキテクチャの指針

- **useSyncExternalStore**: Three.jsなど外部ライブラリとの状態同期には`useSyncExternalStore`を使用してください
- **Preact Signals**: UIコンポーネント間の状態共有と更新には`@preact/signals-react`を使用してください
- **グローバル関数の排除**: windowオブジェクトにグローバル関数を追加する代わりに、ストアベースの通信を使用してください
- **useEffectの削減**: 副作用はイベント駆動モデルを通じて処理し、useEffectの使用を最小限にとどめてください
- **コンポーネント間通信**: 親子関係のないコンポーネント間の通信はContextやSignalsを使用してください

## 改善ポイント

- **アニメーション最適化**: Three.jsのレンダリングループを最適化し、パフォーマンスを向上させる
- **エラー処理の強化**: 各種操作のエラー状態を適切に管理・表示する機能を追加する
- **テスト追加**: ストアとコンポーネントの単体テストを追加し、品質を確保する
- **未使用コードの削除**: リファクタリング後に不要となったコード（特にuseEffectやsetTimeout）を削除する
- **型安全性の向上**: 型定義をより厳密にし、コンパイル時のエラー検出を強化する

## GitHub Copilotへの指示

- 日本語で返答してください
- コードの説明を行う際は、コメントを追加してください
- コードの編集後に、typescriptエラー・リントエラーがないかチェックし、エラーがあれば追加修正してください

## 今後の開発計画

1. エレベーターの3Dモデルの実装
2. エレベーターの動作ロジックの実装
3. フロア選択とエレベーター呼び出しのUI
4. エレベーター内部と外部の状態表示
5. 複数エレベーターのシミュレーション
6. 統計情報の表示機能
7. ビルディングモデルの詳細化と環境の拡張
8. ユーザーカスタマイズ可能なシミュレーション設定