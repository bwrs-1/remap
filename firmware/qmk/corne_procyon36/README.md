# Corne Procyon36（Dilemma_3X6）への組み込み

> **ビルド済みファームウェア**: Matrix の「ファームウェアを書き込む」→
> 「Matrix 対応ファームウェアを使う」で、このパッチを当ててビルドした `.uf2` をそのまま書き込めます
> （`public/firmware/corne_procyon36_matrix.uf2`）。
>
> ビルド環境: [george-norton/qmk_firmware](https://github.com/george-norton/qmk_firmware) `multitouch_experiment`
> （コミット `7744c90`）+ arm-none-eabi-gcc 13.2.1。公式 QMK には `digitizer` ドライバがないためビルドできません。

`bwrs-1/qmk_firmware_corne_procyon`（ブランチ `corne_procyon_dev`、コミット `4e12844`）の
`keyboards/corne_procyon36` に Matrix のタッチパッド／マウスレイヤー設定を組み込むパッチです。

## 変更内容（`0001-matrix-pointing.patch`）

| ファイル                           | 変更                                                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `matrix_pointing.c` / `.h`（追加） | Matrix からの設定の読み書き・EEPROM 保存・反映                                                                                    |
| `rules.mk`                         | `SRC += matrix_pointing.c`                                                                                                        |
| `config.h`                         | `DYNAMIC_KEYMAP_LAYER_COUNT 5`、`EECONFIG_USER_DATA_SIZE 32`、`AUTO_MOUSE_DELAY 0`、初期値（対象レイヤー 4 = `_MOUSE`、加速オフ） |
| `digitizer_user.c`                 | CPI を保存値から返す（初期値 1600 は従来どおり）。既存の平滑化の後に Matrix の変換を適用                                          |
| `keymaps/default/keymap.c`         | 起動時に設定を読み込み（従来の `set_auto_mouse_layer(_MOUSE)` を置き換え）、`process_record_user` を追加                          |

### 既存の不具合の修正も含みます

キーマップには `_MOUSE`（レイヤー 4）まで 5 レイヤーありますが、VIA の動的キーマップは既定で 4 レイヤーです。
QMK はこの場合レイヤー 4 のキーをすべて `KC_NO` として扱うため、オートマウスでレイヤー 4 が有効になると
**全キーが効かなくなり、`_MOUSE` のクリックキーも使えません**（QMK `quantum/dynamic_keymap.c` の
`keycode_at_keymap_location()` で確認）。`DYNAMIC_KEYMAP_LAYER_COUNT 5` でこれを解消します。

## 適用・ビルド・書き込み

```bash
# あなたの qmk_firmware_corne_procyon リポジトリで
git checkout corne_procyon_dev
git am /path/to/0001-matrix-pointing.patch   # または: git apply 0001-matrix-pointing.patch

# いつもビルドしている QMK（digitizer ドライバ入りのフォーク）にキーボードフォルダを配置して
qmk compile -kb corne_procyon36 -km default
# RP2040 なので .uf2 ができます。ダブルタップリセットで RPI-RP2 ドライブを出し、.uf2 をコピー
```

**左右両方**に書き込んでください（分割の両側で同じファームウェアを使う構成のため）。

### ブラウザから書き込む場合

Matrix（https://matrix-bw6.pages.dev/）の「ファームウェアを書き込む」で `.uf2` を選び、
キーボードのリセットボタンを素早く 2 回押して書き込みモードにしてから「書き込み開始」を押します。
このパッチを書き込んだ後は、2 回押しの代わりに「書き込みモードに切り替える」ボタンが使えます。

## 書き込み前の注意

1. **キーマップのバックアップ**: レイヤー数の変更で VIA/Matrix に保存されたキーマップが
   ファームウェアの初期値（`keymap.c`）に戻る可能性があります。Matrix のキーマップ画面右側の
   メニューからエクスポートしておいてください。
2. **ビルドに使う QMK**: `POINTING_DEVICE_DRIVER = digitizer` は公式 QMK（master）にはなく、
   フォーク版 QMK が必要です。同梱の GitHub Actions（`.github/workflows/build.yml`）は公式 QMK で
   ビルドしようとしており、リポジトリ内の `build_output.log` でも失敗しています。普段ビルドしている環境をお使いください。
   また RP2040 の成果物は `.uf2` のため、ワークフローの `*.hex` の指定では成果物が見つかりません。

## ビルドエラーが出たら

| エラー                                                              | 対処                                                                                                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `set_auto_mouse_timeout` / `set_auto_mouse_debounce` が見つからない | `config.h` に `#define MATRIX_POINTING_LEGACY_AUTO_MOUSE`（古い QMK 用。解除時間・デバウンスは画面から変更できなくなります） |
| `eeconfig_read_user_datablock` の引数の数が違う                     | 通常は自動判定します。出た場合はエラー全文を送ってください                                                                   |
| `via_custom_value_command_kb` / `is_mouse_record_user` の重複定義   | フォーク側で既に定義されています。エラー全文を送ってください                                                                 |

## 確認済みの範囲

- 公式 QMK master（2026-10-02）と API 名・シグネチャを照合
- ホスト環境でのコンパイル（新旧 2 種類の EEPROM API × 機能の有無）と動作テスト（AddressSanitizer 付き）
- **未確認**: フォーク版 QMK でのビルド、実機での動作

## このキーボードで反映される設定

速度（CPI）、加速、回転、X/Y 反転、スクロール速度・反転・横スクロール、オートマウスの有効/対象レイヤー/
解除時間/デバウンス/起動移動量/キー入力後の待機/即解除/修飾キー中の維持。

タップ・2 本指・センサー感度など maXTouch のジェスチャー系の設定は、フォーク側の digitizer ドライバで
処理されているため、**保存・表示のみ**で動作には反映されません。
