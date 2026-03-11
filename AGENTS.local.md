# Tategaki Editor - Development Guidelines

## プロジェクト概要

VS Code拡張機能として実装された日本語縦書きWYSIWYGエディタ。テキストファイルを縦書きスタイルで編集できる機能を提供。

## プロジェクト構成

```
tategaki-editor/
├── src/                     # VS Code拡張機能のメインコード
│   ├── extension.ts         # 拡張機能のエントリーポイント
│   ├── tategakiViewProvider.ts # Webviewプロバイダー
│   └── test/               # テストファイル
├── webview-src/            # Webview用フロントエンドコード
│   ├── components/         # Preactコンポーネント
│   │   ├── TategakiEditor.tsx        # メインエディタコンポーネント
│   │   ├── VerticalTextContainer.tsx # 縦書きテキストコンテナ
│   │   └── SaveIndicator.tsx         # 保存状態表示
│   ├── main.tsx            # Webviewエントリーポイント
│   └── styles.css          # CSS定義
├── webview-dist/           # ビルド済みWebviewファイル
├── out/                    # コンパイル済みTypeScript
└── package.json            # 拡張機能設定とメニュー定義
```

## 開発ルール

### コーディング規約

1. **TypeScript使用必須** - 全てのコードはTypeScriptで記述
2. **コメント禁止** - ユーザーが明示的に要求しない限りコメントを追加しない

### 機能実装の原則
1. **最小限の実装** - 明示的に指示された機能のみを実装する
1. **推測による機能追加禁止** -
「あったら便利」と思われる機能も指示なしに追加しない
1. **一般的な慣習より指示を優先** -
一般的なエディタの標準機能でも、指示にない場合は実装しない
1. **事前確認** - 指示が曖昧な場合は、機能を追加する前に確認を求める

### アーキテクチャ原則

1. **シンプルな同期モデル**
   - エディタはファイル開時とリロード時のみファイルを読み込む
   - リアルタイム同期は行わない
   - 保存は明示的にユーザーが実行

2. **縦中横機能**
   - モード切替ではなく選択ベース
   - 文字列選択 + Ctrl+Shift+T で縦中横変換
   - `[テキスト]` 記法で保存される

### UI/UX設計

1. **パネルアクション**
   - 本アイコン（$(book)）: WYSIWYGエディタを開く
   - 保存アイコン（$(save)）: 内容を保存
   - リロードアイコン（$(refresh)）: ファイル内容でリロード

2. **キーボードショートカット**
   - Ctrl+S: 保存
   - Ctrl+Shift+T: 選択テキストを縦中横変換

### CSS設計

1. **縦書きレイアウト**
   - `writing-mode: vertical-rl`
   - `text-orientation: upright`

2. **縦中横スタイル**
   - `text-combine-upright: all`
   - クロスブラウザ対応のため複数プロパティを併用

## 開発ワークフロー

### ビルドコマンド

```bash
npm run compile           # TypeScriptコンパイル
npm run build:webview     # Webviewビルド
npm run watch            # 両方を監視モードで実行
npm run lint             # ESLintチェック
npm run test             # テスト実行
```

### 必須ビルド手順

コード変更後は以下を必ず実行：

1. `npm run build:webview` - Webview関連変更時
2. `npm run compile` - 拡張機能関連変更時

### VS Code アイコン使用

VS Code組み込みアイコン（Codicons）のみ使用可能：
- `$(book)` - エディタ開く
- `$(save)` - 保存
- `$(refresh)` - リロード

全て著作権問題なしで使用可能。

## 技術仕様

### 対応ファイル形式

- .txtファイルのみ対象
- UTF-8エンコーディング

### ブラウザ要件

- VS Code内蔵Webview（Electron/Chromium）での動作

### 依存関係

- **実行時**: VS Code API
- **開発時**: TypeScript, Vite, ESLint

## テスト方針

1. **単体テスト** - jestをVS codeのテストランナーから実行
2. **手動テスト** - F5デバッグ起動での動作確認

## 注意事項

1. **セキュリティ** - 機密情報をログやコメントに含めない
2. **パフォーマンス** - 大きなファイルでも快適に動作させる
3. **互換性** - VS Code 1.74.0以降で動作保証

## 今後の拡張予定

- [ ] 複数ファイル形式対応（.md, .txtxなど）
- [ ] カスタムCSSテーマ
- [ ] 印刷プレビュー機能
- [ ] ルビ（振り仮名）サポート