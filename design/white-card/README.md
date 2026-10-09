# Remap 新UI（ホワイトカード版）デザインモック

Design canvas の元ファイルです。公開中のキャンバスは https://claude.ai/artifact/92FVeeSMDLYZDdkYCW9E6h（非公開・オーナーのみ閲覧可）。

全画面が 1 つの 3D キーボードのステージを共有し、ヘッダーを残したまま状態で切り替わります。

| 出力ファイル | 元 | 初期表示 |
|---|---|---|
| Main / Macros / Combos / Layers / Pointing / Lighting `.dc.html` | `frags/Main.frag` | Keys の各サブ、Pointing、Lighting |
| Connect / Firmware `.dc.html` | `frags/Connect.frag` | Connect、Firmware |

## ビルド

```bash
python3 assemble.py        # frags/Main.src + Main.js + parts_*.html → frags/Main.frag
python3 build.py Main Connect   # canvas2/project/*.dc.html を生成（@@VARIANTS ごとに出力）
python3 chk.py Main.dc.html Connect.dc.html   # 未定義の hole・タグ不整合・JS エラーの検査
```

- `shared/helmet.html` が全ページ共通の CSS です。
- `keycats.js`（Remap の KeyCategoryList から抽出したキーコード）と `descja.js`（日本語説明）はビルド時に埋め込まれます。

## 表示確認（Playwright）

`render/` に `canvas2/project/*.dc.html` と Design 型のランタイム（`support.js`、リポジトリには含めていません）を置いて実行します。

```bash
NODE_PATH=$(npm root -g) node pw/studio.js 1280 720   # Keys/Pointing/Lighting の全タブのはみ出し測定
NODE_PATH=$(npm root -g) node pw/cf.js 1280 720       # Connect → 接続 → Firmware → 書き込みの流れ
```

確認済みサイズ：1024×700、1280×720、1366×768、1440×900、1920×1080（ページ・設定ウィンドウともはみ出し 0）。

## 注意

CSS で描いた 3D キーボードは見本です。実装では `src/components/keyboard3d/`（glb モデルによる 3D ビューア）に置き換える前提です。
