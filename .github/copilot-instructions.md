# Elevator Simulation プロジェクト - Copilot Instructions

## プロジェクト概要

このプロジェクトは、Web上でエレベーターの動作をシミュレーションするアプリケーションです。
Three.jsを活用して3Dグラフィックスでエレベーターの動きを表現し、リアルタイムで操作・監視できる機能を提供します。

## 技術スタック

- **フロントエンド**: React
- **フレームワーク**: Next.js
- **3Dレンダリング**: Three.js
- **状態管理**: Zustand
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
│   ├── elevator-controls.tsx      - Zustandを使った制御UI
│   ├── elevator-history.tsx       - Zustandを使った履歴表示
│   ├── elevator-simulation.tsx    - メインレイアウトコンポーネント
│   ├── floor-selector.tsx        - Zustandを使ったフロア選択UI
│   └── three-viewer.tsx          - useEffectとZustandを使用したThree.js連携
├── contexts/
│   └── ElevatorSystemContext.tsx  - Zustandストアのエクスポート
├── models/
│   └── elevator.ts               - エレベーターの基本モデル定義
├── stores/
│   ├── elevatorSignalStore.ts    - Zustandベースの状態管理
│   └── elevatorThreeStore.ts     - Three.js用のZustandストア
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

- エレベーターの動きのシミュレーションはThree.jsを使用して実装します
- 状態管理はZustandを使用し、イベント駆動型のアーキテクチャを実現します
- UIコンポーネントはTailwindCSSを使用してスタイリングします
- コンポーネントの配置はapp/内のディレクトリ構造に従って行います

## 開発コマンド

- 開発サーバーの起動: `bun run dev`
- ビルド: `bun run build`
- 本番用サーバーの起動: `bun run start`
- リント: `bun run lint`
- テスト: `bun run test`

## コーディングスタイル

- コーディングスタイルは一貫性を持たせる
- anyは使用しない
- as の型アサーションの使用を避ける
- import文は、@からはじまる相対パスを使用
- 変数名はキャメルケースを使用
- 定数は全て大文字のスネークケースを使用
- for文のループ内で条件文を使う場合、array.filterを使用
- useCallback, useMemoは使わないでください
- setInterval, setTimeout、useEffectは使わず、イベント駆動にしてください
- コンポーネントはexport でエクスポートしてください(export defaultは使用しない)
- 固定値はenumを使用

## イベント駆動アーキテクチャの指針

- **Zustandストア**: 状態管理にはZustandを使用し、単一方向のデータフローを実現します
- **グローバル関数の排除**: windowオブジェクトにグローバル関数を追加する代わりに、ストアベースの通信を使用してください
- **useEffectの削減**: 副作用はイベント駆動モデルを通じて処理し、useEffectの使用を最小限にとどめてください
- **コンポーネント間通信**: Zustandのセレクタを使用して、コンポーネント間の状態管理と通信を行います
- **アニメーションループ**: requestAnimationFrameを使用して、Three.jsのアニメーションループを実装します

## 改善ポイント

- **アニメーション最適化**: Three.jsのレンダリングループを最適化し、パフォーマンスを向上させる
- **エラー処理の強化**: 各種操作のエラー状態を適切に管理・表示する機能を追加する
- **テスト追加**: ストアとコンポーネントの単体テストを追加し、品質を確保する
- **未使用コードの削除**: リファクタリング後に不要となったコード（特にuseEffectやsetTimeout）を削除する
- **型安全性の向上**: 型定義をより厳密にし、コンパイル時のエラー検出を強化する
- **SSR対応の改善**: Next.jsのサーバーサイドレンダリング対応を強化し、初期表示時のパフォーマンスを向上させる

## GitHub Copilotへの指示

- 日本語で返答してください
- コードの説明を行う際は、コメントを追加してください
- コードの編集後に、typescriptエラー・リントエラーがないかチェックし、エラーがあれば追加修正してください