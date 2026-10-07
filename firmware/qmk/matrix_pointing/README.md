# Matrix pointing — QMK 側の実装

Matrix エディタの「タッチパッド」「マウスレイヤー」「タイミング・ジェスチャー」画面から設定を読み書き・保存するための
QMK モジュールです。VIA のカスタム値（チャンネル 0）でエディタとやり取りし、設定は
EEPROM のユーザー用データブロックに保存します。プロトコルの詳細は
[`keyboards/matrix-split42/README.md`](../../../keyboards/matrix-split42/README.md) を参照してください。

> 確認済みの範囲: QMK `master`（2026-10-02 時点）の API 名・シグネチャと照合し、
> ホスト環境でのコンパイル確認と動作テスト（VIA 応答、保存、座標変換、オートマウス判定、
> 設定のバージョン 1→2 移行、タップ/ホールド判定、スワイプ）を実施済み。
> マルチタッチ版 QMK フォークでの Corne Procyon36 向けビルドも確認済み。**実機での動作は未確認**です。

## 組み込み手順（キーマップに追加する場合）

1. `matrix_pointing.c` と `matrix_pointing.h` をキーマップのフォルダにコピーします。
2. `rules.mk` に追加:

   ```make
   VIA_ENABLE = yes
   POINTING_DEVICE_ENABLE = yes
   SRC += matrix_pointing.c
   ```

3. `config.h` に追加:

   ```c
   #define EECONFIG_USER_DATA_SIZE 64        // 設定の保存領域（MATRIX_POINTING_EEPROM_SIZE 以上）
   #define POINTING_DEVICE_AUTO_MOUSE_ENABLE  // オートマウスレイヤー
   #define AUTO_MOUSE_DELAY 0                 // 「キー入力後の待機」はエディタの設定値で制御するため 0 に

   // タップ/ホールドキー（LT・MT）の判定時間とモードを画面から変更（任意）
   #define TAPPING_TERM_PER_KEY
   #define PERMISSIVE_HOLD_PER_KEY
   #define HOLD_ON_OTHER_KEY_PRESS_PER_KEY

   // Cirque タッチパッドで次の設定も画面から切り替えたい場合（任意）
   // #define POINTING_DEVICE_GESTURES_CURSOR_GLIDE_ENABLE  // 慣性（グライド）
   // #define CIRQUE_PINNACLE_TAP_ENABLE                    // タップでクリック（absolute モード時のみ有効）
   // #define CIRQUE_PINNACLE_CIRCULAR_SCROLL_ENABLE        // サークルスクロール
   ```

4. `keymap.c` に追加（既に同名の関数がある場合は、その中から呼び出してください）:

   ```c
   #include "matrix_pointing.h"

   void keyboard_post_init_user(void) {
       matrix_pointing_init();
   }

   report_mouse_t pointing_device_task_user(report_mouse_t mouse_report) {
       return matrix_pointing_task(mouse_report);
   }

   bool process_record_user(uint16_t keycode, keyrecord_t *record) {
       matrix_pointing_process_record(keycode, record);
       return true;
   }
   ```

5. ビルドして書き込み、Matrix で「タッチパッド」を開きます。対応済みなら
   「未対応」の案内が出ず、現在の設定値が表示されます。

### 既存のフックと衝突する場合

- キーボード側（`keyboard.c`）が既に `via_custom_value_command_kb()` を定義している:
  `#define MATRIX_POINTING_NO_VIA_HOOK` を付けたうえで、既存の関数内でチャンネル 0 の処理を
  このモジュールに委ねる必要があります（現状は関数を公開していないため、その場合はご相談ください）。
- キーマップが既に `is_mouse_record_user()` を定義している:
  `#define MATRIX_POINTING_NO_MOUSE_RECORD` を付け、既存の関数から
  `matrix_pointing_is_mouse_record(keycode, record)` を呼び出してください。
- EEPROM のユーザー領域を他でも使っている: `MATRIX_POINTING_EEPROM_OFFSET` で開始位置をずらし、
  `EECONFIG_USER_DATA_SIZE` を合計サイズ以上にしてください。

### 3 本指スワイプ（マルチタッチ版 QMK フォーク）

フォークの `digitizer_mouse_fallback.c` は `DIGITIZER_SWIPE_*_KC` を `tap_code()` に渡します。
次のように定義すると、画面で選んだキー（修飾キー付きの基本キーコード）が送られます。

```c
#define MATRIX_POINTING_SWIPE_KC(dir) ({ extern uint8_t matrix_pointing_swipe(uint8_t); matrix_pointing_swipe(dir); })
#define DIGITIZER_SWIPE_LEFT_KC MATRIX_POINTING_SWIPE_KC(0)
#define DIGITIZER_SWIPE_RIGHT_KC MATRIX_POINTING_SWIPE_KC(1)
#define DIGITIZER_SWIPE_UP_KC MATRIX_POINTING_SWIPE_KC(2)
#define DIGITIZER_SWIPE_DOWN_KC MATRIX_POINTING_SWIPE_KC(3)
```

### 設定の保存形式のバージョン

保存形式はバージョン 2 です（バージョン 1 にタイミングとスワイプを追加）。バージョン 1 で
保存された設定は起動時にそのまま引き継ぎ、追加分は初期値で補います。なお
`EECONFIG_USER_DATA_SIZE` を変えると QMK がユーザー領域を初期化するため、その場合は初期値に戻ります。

## ブラウザからのファームウェア書き込み

このモジュールを組み込むと、Matrix の「ファームウェアを書き込む」で
「書き込みモードに切り替える」が使えるようになります（値 `0x7F` で `reset_keyboard()` を呼び、
RP2040 では BOOTSEL で再起動）。再起動は応答を返した約 100ms 後、`matrix_pointing_task()` の中で行います。

## 各設定の反映状況

| 設定                                                                              | 反映方法                                   | 備考                                                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| 速度（CPI）                                                                       | `pointing_device_set_cpi()`                | Dilemma 標準の DPI 変更キーを押すと、そちらの値で上書きされます（再起動で本設定に戻ります）             |
| 加速                                                                              | 本モジュールで移動量を補正                 | 速い移動ほど最大 3 倍                                                                                   |
| 慣性（グライド）                                                                  | `cirque_pinnacle_enable_cursor_glide()`    | `POINTING_DEVICE_GESTURES_CURSOR_GLIDE_ENABLE` が必要                                                   |
| 回転・X/Y 反転                                                                    | 本モジュールで座標を変換                   | 回転の向きは QMK の `POINTING_DEVICE_ROTATION_*` と同じ                                                 |
| タップでクリック                                                                  | `cirque_pinnacle_enable_tap()`             | `CIRQUE_PINNACLE_TAP_ENABLE` と absolute モードが必要                                                   |
| サークルスクロール                                                                | `cirque_pinnacle_enable_circular_scroll()` | `CIRQUE_PINNACLE_CIRCULAR_SCROLL_ENABLE` が必要                                                         |
| スクロール速度・反転・横スクロール                                                | 本モジュールでスクロール量を変換           | 速度は分周比 8 が元の速さ（4 で 2 倍、16 で半分）                                                       |
| オートマウス 有効/対象レイヤー/解除時間/デバウンス                                | QMK の `set_auto_mouse_*()`                |                                                                                                         |
| 起動する移動量・キー入力後の待機                                                  | `auto_mouse_activation()` を上書き         |                                                                                                         |
| マウス用以外のキーで即解除・修飾キー中は維持                                      | `is_mouse_record_user()` で判定            |                                                                                                         |
| 2 本指タップ・タップ＆ドラッグ・タップ判定時間・2 本指/端スクロール・センサー感度 | **保存のみ**                               | QMK の Cirque ドライバに実行時に変更する API がないため、値は保存・表示されますが動作には反映されません |
| 長押し判定時間・ホールド判定モード                                                | `get_tapping_term()` などを定義            | `TAPPING_TERM_PER_KEY` / `PERMISSIVE_HOLD_PER_KEY` / `HOLD_ON_OTHER_KEY_PRESS_PER_KEY` が必要           |
| 3 本指スワイプのキー                                                              | `matrix_pointing_swipe()`                  | マルチタッチ版 QMK フォークのみ。修飾キー付きの基本キーコードのみ送信                                   |
