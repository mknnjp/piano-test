# piano-test

「悲愴ソナタ 第2楽章」の楽譜を使った、音名クイズ／音の位置一覧／音符よみ練習の 3 ページからなる静的サイトです。

もともとは 1 枚の HTML に CSS と JavaScript を書き込んだ構成でしたが、現在は **Vite + TypeScript** で管理し、ロジック・画面処理・スタイルを `src/` 以下に分割しています。

## 収録ページ

| ページ | ファイル | 内容 |
| --- | --- | --- |
| 音名クイズ | `index.html` | 五線譜に出る単音の音名を答える（変イ長調・♭×4、同音異名は不正解） |
| 音の位置一覧 | `note-map.html` | ト音記号・ヘ音記号の音の位置一覧 |
| 音符よみ練習 | `piano_test2.html` | 調号・黒鍵・採点付きの練習 |

## 前提

- [Node.js](https://nodejs.org/) と [pnpm](https://pnpm.io/) が使えること
- パッケージは `package.json` の `packageManager`（`pnpm@12.21.0`）で固定しています

## セットアップ（依存関係の解決）

```bash
pnpm install
```

`pnpm-workspace.yaml` で、ビルドに必要な `esbuild` のビルドを許可し、Vitest 関連パッケージの反映待ち時間を除外しています。これにより `pnpm install` が期待どおり通ります。

## 開発・ビルド・テスト

```bash
pnpm dev        # 開発サーバーを起動
pnpm build      # dist/ に配布用ファイルを生成
pnpm preview    # ビルド結果をローカルで確認
pnpm test       # Vitest でテスト実行
pnpm typecheck  # TypeScript の型チェック
```

`vite.config.ts` で `base: './'` を指定しているため、生成された `dist/` は静的サーバーでそのまま配信できます。

## ディレクトリ構成

```
src/
  lib/        計算・判定などのロジック（notes / pitch / staff / quiz-logic など）
  *.ts        画面処理（quiz.ts / note-map.ts / piano-test.ts）
  styles/     ページごとの CSS（common / quiz / note-map / piano-test）
tests/        Vitest によるロジックのテスト
```
