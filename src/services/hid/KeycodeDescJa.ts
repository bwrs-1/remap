import i18next from 'i18next';

// Japanese descriptions for the QMK keycode descriptions shown in the
// editor (KeycodeInfoList and the layer / mod-tap compositions). Unknown
// descriptions are returned unchanged.

const EXACT: Record<string, string> = {
  'Ignore this key (NOOP)': '何もしないキー（無効化）',
  'Use the next lowest non-transparent key':
    '透過キー。下のレイヤーで割り当てたキーがそのまま使われます',
  'Return (Enter)': 'Enter（改行・決定）',
  Escape: 'Esc（取り消し）',
  'Delete (Backspace)': 'Backspace（左側の文字を削除）',
  Tab: 'Tab',
  Spacebar: 'スペース',
  'Caps Lock': 'Caps Lock（大文字固定）',
  'Print Screen': 'Print Screen（画面の撮影）',
  'Scroll Lock, Brightness Down (macOS)': 'Scroll Lock（macOS では画面を暗く）',
  'Pause, Brightness Up (macOS)': 'Pause（macOS では画面を明るく）',
  Insert: 'Insert（挿入/上書きの切替）',
  Home: 'Home（行頭へ）',
  'Page Up': 'Page Up（1 画面上へ）',
  'Forward Delete': 'Delete（右側の文字を削除）',
  End: 'End（行末へ）',
  'Page Down': 'Page Down（1 画面下へ）',
  'Right Arrow': '→（右矢印）',
  'Left Arrow': '←（左矢印）',
  'Down Arrow': '↓（下矢印）',
  'Up Arrow': '↑（上矢印）',
  'Application (Windows Context Menu Key)':
    'アプリケーションキー（Windows の右クリックメニュー）',
  'System Power': '電源',
  Execute: '実行',
  Help: 'ヘルプ',
  Menu: 'メニュー',
  Select: '選択',
  Stop: '停止',
  Again: 'やり直し（Again）',
  Undo: '元に戻す',
  Cut: '切り取り',
  Copy: 'コピー',
  Paste: '貼り付け',
  Find: '検索',
  Mute: 'ミュート',
  'Volume Up': '音量を上げる',
  'Volume Down': '音量を下げる',
  'Locking Caps Lock': 'Caps Lock（ロック式）',
  'Locking Num Lock': 'Num Lock（ロック式）',
  'Locking Scroll Lock': 'Scroll Lock（ロック式）',
  'Alternate Erase': '代替消去',
  'SysReq/Attention': 'SysReq',
  Cancel: 'キャンセル',
  Clear: 'クリア',
  Prior: 'Prior',
  Return: 'Return',
  Separator: '区切り',
  Out: 'Out',
  Oper: 'Oper',
  'Clear/Again': 'Clear/Again',
  'CrSel/Props': 'CrSel/Props',
  ExSel: 'ExSel',
  'System Power Down': '電源を切る',
  'System Sleep': 'スリープ',
  'System Wake': 'スリープ解除',
  'Next Track': '次の曲',
  'Previous Track': '前の曲',
  'Stop Track': '再生停止',
  'Play/Pause Track': '再生/一時停止',
  'Launch Media Player': 'メディアプレーヤーを起動',
  Eject: '取り出し',
  'Launch Mail': 'メールを起動',
  'Launch Calculator': '電卓を起動',
  'Launch My Computer': 'エクスプローラー（PC）を起動',
  'Browser Search': 'ブラウザで検索',
  'Browser Home': 'ブラウザのホーム',
  'Browser Back': 'ブラウザの戻る',
  'Browser Forward': 'ブラウザの進む',
  'Browser Stop': 'ブラウザの読み込み中止',
  'Browser Refresh': 'ブラウザの再読み込み',
  'Browser Favorites': 'ブラウザのお気に入り',
  'Brightness Up': '画面を明るく',
  'Brightness Down': '画面を暗く',
  'Open Control Panel': 'コントロールパネルを開く',
  'Launch Context-Aware Assistant': 'アシスタントを起動',
  'Open Mission Control': 'Mission Control を開く（macOS）',
  'Open Launchpad': 'Launchpad を開く（macOS）',
  'Mouse Cursor Up': 'マウスカーソルを上へ',
  'Mouse Cursor Down': 'マウスカーソルを下へ',
  'Mouse Cursor Left': 'マウスカーソルを左へ',
  'Mouse Cursor Right': 'マウスカーソルを右へ',
  'Mouse Button 1': '左クリック（マウスボタン 1）',
  'Mouse Button 2': '右クリック（マウスボタン 2）',
  'Mouse Button 3': '中クリック（マウスボタン 3）',
  'Mouse Button 4': 'マウスの戻るボタン（ボタン 4）',
  'Mouse Button 5': 'マウスの進むボタン（ボタン 5）',
  'Press button 6': 'マウスボタン 6',
  'Press button 7': 'マウスボタン 7',
  'Press button 8': 'マウスボタン 8',
  'Mouse Wheel Up': 'ホイールを上へ（上スクロール）',
  'Mouse Wheel Down': 'ホイールを下へ（下スクロール）',
  'Mouse Wheel Left': 'ホイールを左へ（左スクロール）',
  'Mouse Wheel Right': 'ホイールを右へ（右スクロール）',
  'Set mouse acceleration to 0': 'マウスキーの速度を 0（遅い）に',
  'Set mouse acceleration to 1': 'マウスキーの速度を 1（普通）に',
  'Set mouse acceleration to 2': 'マウスキーの速度を 2（速い）に',
  'Left Control': '左 Ctrl',
  'Left Shift': '左 Shift',
  'Left Alt (Option)': '左 Alt（Mac は Option）',
  'Left GUI (Windows/Command/Meta key)': '左 Win（Mac は Command）',
  'Right Control': '右 Ctrl',
  'Right Shift': '右 Shift',
  'Right Alt (Option/AltGr)': '右 Alt（Mac は Option）',
  'Right GUI (Windows/Command/Meta key)': '右 Win（Mac は Command）',
  'Toggle hand swap': '左右入れ替えの切替',
  'Momentary swap when held, toggle when tapped':
    '押している間は左右入れ替え、タップで切替',
  'Turn on hand swap while held': '押している間だけ左右入れ替え',
  'Turn off hand swap while held': '押している間だけ左右入れ替えを解除',
  'Turn off hand swap': '左右入れ替えを解除',
  'Turn on hand swap': '左右入れ替えを有効化',
  'Turn on hand swap while held or until next key press':
    '次のキーを押すまで左右入れ替え',
  'Stop treating Caps Lock as Control':
    'Caps Lock を Ctrl として扱うのをやめる',
  'Treat Caps Lock as Control': 'Caps Lock を Ctrl として扱う',
  'Enable the GUI keys': 'Win/Command キーを有効化',
  'Disable the GUI keys': 'Win/Command キーを無効化',
  'Toggles the status of the GUI keys': 'Win/Command キーの有効/無効を切替',
  'Enable N-key rollover': '同時押し無制限（NKRO）を有効化',
  'Disable N-key rollover': '同時押し無制限（NKRO）を無効化',
  'Toggle N-key rollover': '同時押し無制限（NKRO）を切替',
  'Set the master half of a split keyboard as the left hand (for EE_HANDS)':
    '分割キーボードの左側を USB 接続側に設定（EE_HANDS 用）',
  'Set the master half of a split keyboard as the right hand (for EE_HANDS)':
    '分割キーボードの右側を USB 接続側に設定（EE_HANDS 用）',
  'Turn MIDI on': 'MIDI をオン',
  'Turn MIDI off': 'MIDI をオフ',
  'Toggle MIDI enabled': 'MIDI のオン/オフ',
  'No transposition': '移調なし',
  'Decrease transposition': '移調を下げる',
  'Increase transposition': '移調を上げる',
  'Decrease velocity': 'ベロシティを下げる',
  'Increase velocity': 'ベロシティを上げる',
  'Decrease channel': 'チャンネルを下げる',
  'Increase channel': 'チャンネルを上げる',
  'Stop all notes': 'すべての音を止める',
  Sustain: 'サステイン',
  Portmento: 'ポルタメント',
  Sostenuto: 'ソステヌート',
  'Soft Pedal': 'ソフトペダル',
  Legato: 'レガート',
  Modulation: 'モジュレーション',
  'Decrease modulation speed': 'モジュレーション速度を下げる',
  'Increase modulation speed': 'モジュレーション速度を上げる',
  'Bend pitch down': 'ピッチを下げる',
  'Bend pitch up': 'ピッチを上げる',
  'Sequencer On': 'シーケンサーをオン',
  'Sequencer Off': 'シーケンサーをオフ',
  'Sequencer Toggle': 'シーケンサーのオン/オフ',
  'Sequencer Tempo Down': 'シーケンサーのテンポを下げる',
  'Sequencer Tempo Up': 'シーケンサーのテンポを上げる',
  'Sequencer Resolution Down': 'シーケンサーの分解能を下げる',
  'Sequencer Resolution Up': 'シーケンサーの分解能を上げる',
  'Sequencer Steps All': 'シーケンサーの全ステップを選択',
  'Sequencer Steps Clear': 'シーケンサーのステップを消去',
  'Turns on Audio Feature': 'オーディオ機能をオン',
  'Turns off Audio Feature': 'オーディオ機能をオフ',
  'Toggles Audio state': 'オーディオ機能のオン/オフ',
  'Toggles Audio clicky mode': 'クリック音モードのオン/オフ',
  'Turns on Audio clicky mode': 'クリック音モードをオン',
  'Turns off Audio clicky mode': 'クリック音モードをオフ',
  'Increases frequency of the clicks': 'クリック音を高く',
  'Decreases frequency of the clicks': 'クリック音を低く',
  'Resets frequency to default': 'クリック音の高さを初期値に',
  'Turns on Music Mode': 'ミュージックモードをオン',
  'Turns off Music Mode': 'ミュージックモードをオフ',
  'Toggles Music Mode': 'ミュージックモードのオン/オフ',
  'Cycles through the music modes': 'ミュージックモードを切り替える',
  'Cycles through the audio voices': '音色を切り替える',
  'Cycles through the audio voices in reverse': '音色を逆順に切り替える',
  'Steno Bolt': 'ステノ（Bolt）',
  'Steno Gemini': 'ステノ（Gemini）',
  'Steno Comb': 'ステノ（Comb）',
  'Steno Comb Max': 'ステノ（Comb Max）',
  'Set the backlight to max brightness': 'バックライトを最大の明るさに',
  'Turn the backlight off': 'バックライトを消す',
  'Turn the backlight on or off': 'バックライトのオン/オフ',
  'Decrease the backlight level': 'バックライトを暗く',
  'Increase the backlight level': 'バックライトを明るく',
  'Cycle through backlight levels': 'バックライトの明るさを順に切替',
  'Toggle backlight breathing': 'バックライトの点滅（呼吸）を切替',
  'Toggle RGB lighting on or off': 'RGB ライトのオン/オフ',
  'Cycle through modes, reverse direction when Shift is held':
    'ライトの効果を次へ（Shift で前へ）',
  'Cycle through modes in reverse, forward direction when Shift is held':
    'ライトの効果を前へ（Shift で次へ）',
  'Increase hue, decrease hue when Shift is held':
    'ライトの色相を進める（Shift で戻す）',
  'Decrease hue, increase hue when Shift is held':
    'ライトの色相を戻す（Shift で進める）',
  'Increase saturation, decrease saturation when Shift is held':
    'ライトの彩度を上げる（Shift で下げる）',
  'Decrease saturation, increase saturation when Shift is held':
    'ライトの彩度を下げる（Shift で上げる）',
  'Increase value (brightness), decrease value when Shift is held':
    'ライトを明るく（Shift で暗く）',
  'Decrease value (brightness), increase value when Shift is held':
    'ライトを暗く（Shift で明るく）',
  'Increase effect speed (does not support eeprom yet), decrease speed when Shift is held':
    'ライトの効果を速く（Shift で遅く。保存はされません）',
  'Decrease effect speed (does not support eeprom yet), increase speed when Shift is held':
    'ライトの効果を遅く（Shift で速く。保存はされません）',
  'Static (no animation) mode': 'ライト：単色（アニメーションなし）',
  'Breathing animation mode': 'ライト：呼吸',
  'Rainbow animation mode': 'ライト：レインボー',
  'Swirl animation mode': 'ライト：渦巻き',
  'Snake animation mode': 'ライト：スネーク',
  '“Knight Rider” animation mode': 'ライト：ナイトライダー',
  'Christmas animation mode': 'ライト：クリスマス',
  'Static gradient animation mode': 'ライト：グラデーション',
  'Red,Green,Blue test animation mode': 'ライト：RGB テスト',
  'Rgb Mode Twinkle': 'ライト：きらめき',
  'Put the keyboard into bootloader mode for flashing':
    'ファームウェア書き込みモード（ブートローダー）にする',
  'Resets the keyboard. Does not load the bootloader':
    'キーボードを再起動（書き込みモードにはなりません）',
  'Toggle debug mode': 'デバッグモードの切替',
  'Reinitializes the keyboard’s EEPROM (persistent memory)':
    'キーボードの保存領域（EEPROM）を初期化。設定がリセットされます',
  'Sends qmk compile -kb (keyboard) -km (keymap), or qmk flash if shift is held. Puts keyboard into bootloader mode if shift & control are held':
    'QMK のビルドコマンドを入力（開発者向け）',
  'Lower the Auto Shift timeout variable (down)':
    'オートシフトの判定時間を短く',
  'Raise the Auto Shift timeout variable (up)': 'オートシフトの判定時間を長く',
  'Report your current Auto Shift timeout value':
    'オートシフトの判定時間を入力して表示',
  'Turns on the Auto Shift Function': 'オートシフトをオン',
  'Turns off the Auto Shift Function': 'オートシフトをオフ',
  'Toggles the state of the Auto Shift feature': 'オートシフトのオン/オフ',
  'Escape when pressed, ` when Shift or GUI are held':
    'Esc。Shift か Win/Command と一緒なら `',
  'Velocikey Toggle': 'Velocikey の切替',
  'Left Control when held, ( when tapped': '長押しで左 Ctrl、タップで (',
  'Right Control when held, ) when tapped': '長押しで右 Ctrl、タップで )',
  'Left Shift when held, ( when tapped': '長押しで左 Shift、タップで (',
  'Right Shift when held, ) when tapped': '長押しで右 Shift、タップで )',
  'Left Alt when held, ( when tapped': '長押しで左 Alt、タップで (',
  'Right Alt when held, ) when tapped': '長押しで右 Alt、タップで )',
  'Right Shift when held, Enter when tapped':
    '長押しで右 Shift、タップで Enter',
  'USB only': 'USB 接続のみ',
  'Bluetooth only': 'Bluetooth 接続のみ',
  'Cycle through selected input modes': 'Unicode 入力方式を切替',
  'Cycle through selected input modes in reverse':
    'Unicode 入力方式を逆順に切替',
  'Switch to macOS input': 'Unicode 入力を macOS 用に',
  'Switch to Linux input': 'Unicode 入力を Linux 用に',
  'Switch to Windows input': 'Unicode 入力を Windows 用に',
  'Switch to BSD input (not implemented)': 'Unicode 入力を BSD 用に（未実装）',
  'Switch to Windows input using WinCompose': 'Unicode 入力を WinCompose 用に',
  'Switch to emacs (C-x-8 RET)': 'Unicode 入力を emacs 用に',
  'Haptic On': '振動をオン',
  'Haptic Off': '振動をオフ',
  'Haptic Toggle': '振動のオン/オフ',
  'Haptic Reset': '振動の設定を初期化',
  'Haptic Feedback Toggle': '振動フィードバックの切替',
  'Haptic Buzz Toggle': '振動ブザーの切替',
  'Haptic Mode Next': '振動パターンを次へ',
  'Haptic Mode Previous': '振動パターンを前へ',
  'Haptic Continuous Toggle': '連続振動の切替',
  'Haptic Continuous Up': '連続振動を強く',
  'Haptic Continuous Down': '連続振動を弱く',
  'Haptic Dwell Up': '振動時間を長く',
  'Haptic Dwell Down': '振動時間を短く',
  'Combo On': 'コンボを有効化',
  'Combo Off': 'コンボを無効化',
  'Combo Toggle': 'コンボの有効/無効を切替',
  'Finish the macro that is currently being recorded.': '記録中のマクロを終了',
  'Replay Macro 1': '記録したマクロ 1 を再生',
  'Replay Macro 2': '記録したマクロ 2 を再生',
  Leader: 'リーダーキー（続けて押したキーの並びで動作）',
  'Hold down the next key pressed, until the key is pressed again':
    '次に押したキーを、もう一度押すまで押しっぱなしにする',
  'Turns One Shot keys on': 'ワンショットキーを有効化',
  'Turns One Shot keys off': 'ワンショットキーを無効化',
  'Toggles One Shot keys status': 'ワンショットキーの有効/無効を切替',
  'Key Override Toggle': 'キーオーバーライドの切替',
  'Key Override On': 'キーオーバーライドを有効化',
  'Key Override Off': 'キーオーバーライドを無効化',
  'Secure Lock': 'セキュアモードをロック',
  'Secure Unlock': 'セキュアモードを解除',
  'Secure Toggle': 'セキュアモードの切替',
  'Secure Request': 'セキュアモードの解除を要求',
  'Types the current tapping term, in milliseconds':
    '現在の長押し判定時間（ミリ秒）を入力して表示',
  'Increases the current tapping term by DYNAMIC_TAPPING_TERM_INCREMENTms (5ms by default)':
    '長押し判定時間を長く（初期設定で 5ms ずつ）',
  'Decreases the current tapping term by DYNAMIC_TAPPING_TERM_INCREMENTms (5ms by default)':
    '長押し判定時間を短く（初期設定で 5ms ずつ）',
  'Toggles Caps Word': 'Caps Word（次の単語だけ大文字）の切替',
  'Turns on the Autocorrect feature.': '自動修正をオン',
  'Turns off the Autocorrect feature.': '自動修正をオフ',
  'Toggles the status of the Autocorrect feature.': '自動修正のオン/オフ',
  'Tri Layer Lower': 'トライレイヤー（Lower）',
  'Tri Layer Upper': 'トライレイヤー（Upper）',
  'Repeat the last pressed key': '直前に押したキーを繰り返す',
  'Perform alternate of the last key': '直前のキーの対になる動作をする',
  // Hand swap compositions
  'Toggles swap on and off with every key press.':
    '押すたびに左右入れ替えのオン/オフを切替',
  'Toggles with a tap; momentary when held.':
    'タップで切替、長押しの間だけ有効',
  'Swaps hands when pressed, returns to normal when released (momentary).':
    '押している間だけ左右を入れ替え',
  'Momentarily turns off swap.': '押している間だけ左右入れ替えを解除',
  'Turn off swapping and leaves it off. Good for returning to a known state.':
    '左右入れ替えを解除したままにする',
  'Turns on swapping and leaves it on.': '左右入れ替えを有効にしたままにする',
  'One shot swap hands: toggles while pressed or until next key press.':
    '次のキーを押すまで左右入れ替え',
  'Momentary swap when held, sends keycode when tapped. Depends on your keyboard whether this function is available.':
    '長押しで左右入れ替え、タップでキーを入力（キーボードにより使えない場合があります）',
  'Momentarily activates modifier(s) until the next key is pressed.':
    '次のキーを押すまでだけ修飾キーを有効にする（ワンショット）',
  Unknown: '不明なキー',
};

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^(.+) and (.+)$/, (m) => `${m[1]}（Shift で ${m[2]}）`],
  [/^Keypad (.+)$/, (m) => `テンキーの ${m[1]}`],
  [/^F(\d+)$/, (m) => `ファンクションキー F${m[1]}`],
  [/^Macro (\d+)$/, (m) => `マクロ ${m[1]}（Matrix/VIA で登録した操作を入力）`],
  [/^Kb (\d+)$/, (m) => `キーボード独自キー ${m[1]}`],
  [/^User (\d+)$/, (m) => `ユーザー定義キー ${m[1]}`],
  [/^Button (\d+)$/, (m) => `ジョイスティックのボタン ${m[1]}`],
  [/^Programmable button (\d+)$/, (m) => `プログラマブルボタン ${m[1]}`],
  [/^Language (\d+)$/, (m) => `言語キー ${m[1]}`],
  [/^International (\d+)$/, (m) => `国際キー ${m[1]}`],
  [/^Set channel to (\d+)$/, (m) => `MIDI チャンネルを ${m[1]} に`],
  [
    /^Set transposition to ([+-]\d+) semitones?$/,
    (m) => `移調を ${m[1]} 半音に`,
  ],
  [/^Set velocity to (\d+)$/, (m) => `ベロシティを ${m[1]} に`],
  [/^(.+) octave (\d+)$/, (m) => `MIDI の音 ${m[1]}（オクターブ ${m[2]}）`],
  [/^Start recording Macro (\d+)$/, (m) => `マクロ ${m[1]} の記録を開始`],
  [
    /^Switches the default layer\((\d+)\)\..*$/,
    (m) =>
      `既定のレイヤーをレイヤー ${m[1]} に切り替えます。既定のレイヤーは常に有効な土台で、他のレイヤーはこの上に重なります。`,
  ],
  [
    /^Momentarily activates Layer\((\d+)\), but with modifier\(s\) mod active\.$/,
    (m) =>
      `押している間だけレイヤー ${m[1]} を有効にし、修飾キーも同時に押した状態にします。`,
  ],
  [
    /^Momentarily activates Layer\((\d+)\) when held, and sends keycode when tapped\.$/,
    (m) =>
      `長押しの間はレイヤー ${m[1]}、タップするとキーを入力します（レイヤータップ）。`,
  ],
  [
    /^If you hold the key down, layer\((\d+)\) is activated, and then is de-activated when you let go\.$/,
    (m) =>
      `長押しでレイヤー ${m[1]} を有効にし、離すと戻ります。素早く連打すると切り替えたままになります（タップトグル）。`,
  ],
  [
    /^Momentarily activates (.+) when held, and sends keycode when tapped\.$/,
    (m) =>
      `長押しの間は ${m[1]}、タップするとキーを入力します（モッドタップ）。`,
  ],
  [
    /^Momentarily activates layer\((\d+)\)\. As soon as you let go of the key, the layer is deactivated\.$/,
    (m) => `押している間だけレイヤー ${m[1]} を有効にし、離すと元に戻ります。`,
  ],
  [
    /^Momentarily activates layer\((\d+)\) until the next key is pressed\.$/,
    (m) =>
      `次のキーを押すまでだけレイヤー ${m[1]} を有効にします（ワンショット）。`,
  ],
  [
    /^Activates layer\((\d+)\) and de-activates all other layers \(except your default layer\)\.$/,
    (m) =>
      `レイヤー ${m[1]} に切り替え、他のレイヤーを解除します（既定のレイヤーを除く）。`,
  ],
  [
    /^Toggles layer\((\d+)\), activating it if it's inactive and vice versa\.$/,
    (m) => `押すたびにレイヤー ${m[1]} のオン/オフを切り替えます。`,
  ],
];

export function keycodeDescJa(desc: string): string {
  if (!desc) return desc;
  const exact = EXACT[desc];
  if (exact) return exact;
  for (const [re, fn] of PATTERNS) {
    const m = desc.match(re);
    if (m) return fn(m);
  }
  return desc;
}

// The description in the editor's language.
export function localizedKeycodeDesc(desc: string): string {
  return (i18next.language || '').startsWith('ja') ? keycodeDescJa(desc) : desc;
}
