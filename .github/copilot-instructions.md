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
├── app/                   # Next.jsのアプリケーションディレクトリ
│   ├── favicon.ico        # サイトのファビコン
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # レイアウトコンポーネント
│   └── page.tsx           # メインページコンポーネント
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

## 今後の開発計画

1. エレベーターの3Dモデルの実装
2. エレベーターの動作ロジックの実装
3. フロア選択とエレベーター呼び出しのUI
4. エレベーター内部と外部の状態表示
5. 複数エレベーターのシミュレーション
6. 統計情報の表示機能