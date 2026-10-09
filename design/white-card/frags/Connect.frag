@@TITLE Connect
@@BIG Connect
@@SUB Keyboards
@@NAVMODE state
@@NOGEAR 1
@@VARIANTS Connect:connect/kbd:Connect|Firmware:firmware/write:Firmware
@@H 900
@@LEFT
<sc-if value="{{connected}}" hint-placeholder-val="{{false}}">
%%KBD_MENU%%
<span class="mx-chip opt" style="animation: mx-chip-a 0.4s ease"><span style="width: 8px; height: 8px; border-radius: 4px; background: #1f8a55"></span>Connected · both halves</span>
</sc-if>
<sc-if value="{{notConnected}}" hint-placeholder-val="{{true}}"><span class="mx-chip"><span style="{{connDot}}"></span>{{connText}}</span></sc-if>
@@RIGHT
<div style="position: relative">
<button class="mx-hbtn mx-press" aria-label="表示言語" aria-haspopup="menu" aria-expanded="{{langOpen}}" onClick="{{toggleLang}}" style="padding: 0 14px 0 18px">{{langLabel}}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg></button>
<sc-if value="{{langOpen}}" hint-placeholder-val="{{false}}">
<div class="mx-menu r" role="menu" style="min-width: 180px">
<sc-for list="{{langs}}" as="l" hint-placeholder-count="2"><button class="mx-mi" role="menuitemradio" aria-checked="{{l.on}}" onClick="{{l.pick}}" style="{{l.style}}">{{l.label}}</button></sc-for>
</div>
</sc-if>
</div>
<div style="position: relative">
<button class="mx-ib mx-press" aria-label="アカウント" aria-haspopup="menu" aria-expanded="{{acctOpen}}" onClick="{{toggleAcct}}" style="{{acctBtn}}"><sc-if value="{{signedIn}}" hint-placeholder-val="{{false}}"><span style="font-size: 14px; font-weight: 700; color: #ffffff">W</span></sc-if><sc-if value="{{signedOut}}" hint-placeholder-val="{{true}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0e0e10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg></sc-if></button>
<sc-if value="{{acctOpen}}" hint-placeholder-val="{{false}}">
<div class="mx-menu r" role="menu" style="width: 280px; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px">
<sc-if value="{{signedOut}}" hint-placeholder-val="{{true}}"><b style="font-size: 15px">Sign in</b><span class="mx-sub">ログインすると、キーマップの共有や保存したキーマップの呼び出しが使えます。キーの変更だけならログインは不要です。</span><button class="mx-btn dark mx-press" onClick="{{signIn}}">Sign in</button></sc-if>
<sc-if value="{{signedIn}}" hint-placeholder-val="{{false}}"><span class="mx-sub">ログイン中</span><button class="mx-mi" onClick="{{signOut}}" style="background: #f5f6f8">Sign out</button></sc-if>
</div>
</sc-if>
</div>
@@MAIN
<main class="mx-main" style="margin-left: 0; display: flex; flex-direction: column; overflow: hidden; -webkit-mask-image: none; mask-image: none; padding-bottom: clamp(8px, 1.4vh, 14px)">
<section class="mx-card" aria-label="キーボード" style="flex: 1 1 auto; min-height: 0; display: flex; padding: clamp(6px, 1.2vh, 12px); animation: mx-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s backwards">
<div class="mx-stage {{stageCls}}" role="group" aria-label="3D キーボード" ref="{{stageRef}}" style="flex: 1; height: auto; min-height: 0; border-radius: clamp(14px, 2vh, 20px)">
<button class="mx-stagebg" aria-label="設定ウィンドウを閉じる" tabindex="-1" onClick="{{closeWin}}"></button>
<div class="mx-cam" style="{{camStyle}}">
<div class="mx-rig {{rigCls}}">
<button class="mx-half {{halfLCls}}" aria-label="Left half" onClick="{{pickLeft}}" style="{{halfLStyle}}"></button>
<button class="mx-half {{halfRCls}}" aria-label="Right half" onClick="{{pickRight}}" style="{{halfRStyle}}"></button>
<div class="mx-pad {{padCls}}" style="{{padStyle}}"><span class="mx-padlbl">TOUCHPAD</span></div>
<sc-for list="{{knobs3d}}" as="k" hint-placeholder-count="2"><span class="mx-knob {{k.cls}}" style="{{k.style}}"></span></sc-for>
<sc-for list="{{caps}}" as="k" hint-placeholder-count="42"><button class="mx-cap {{k.cls}}" aria-label="{{k.label}}" tabindex="-1" onClick="{{k.pick}}" style="{{k.style}}">{{k.label}}</button></sc-for>
</div>
</div>

<div class="mx-float" style="left: 16px; top: 16px"><span class="mx-chip mx-glass" style="{{chipStyle}}"><span style="{{chipDot}}"></span>{{chipTitle}}<span style="font-weight: 500; color: #6b6e75">· {{chipSub}}</span></span></div>
<sc-if value="{{flashChip}}" hint-placeholder-val="{{false}}">
<div class="mx-float" style="left: 50%; top: 16px; transform: translateX(-50%); animation: mx-chip-a 0.4s ease"><span class="mx-chip mx-glass" style="height: 34px; gap: 10px; font-size: 13px; font-weight: 600; color: #0e0e10"><span class="mx-spin" style="border-color: rgba(14, 14, 16, 0.15); border-top-color: #0e0e10"></span>{{flashPct}}</span></div>
</sc-if>
<div class="mx-float opt" style="left: 16px; bottom: 16px; max-width: 46%"><span class="mx-chip mx-glass" style="{{hintStyle}}">{{hintText}}</span></div>
<sc-if value="{{reopenOn}}" hint-placeholder-val="{{false}}">
<div class="mx-float" style="right: 16px; bottom: 16px; animation: mx-chip-a 0.4s ease"><button class="mx-btn dark mx-press" onClick="{{reopen}}" style="height: 40px">{{reopenLabel}}</button></div>
</sc-if>

<sc-if value="{{winOpen}}" hint-placeholder-val="{{true}}">
<div class="mx-win wide {{winCls}}" role="dialog" aria-label="{{winTitle}}" style="{{winStyle}}">
<div style="display: flex; align-items: center; gap: 12px; flex: none">
<span style="{{winIcon}}"></span>
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1"><b style="font-size: 16px">{{winTitle}}</b><span class="mx-sub mx-help-t mx-whsub" title="{{winSub}}" style="font-size: 12px">{{winSub}}</span></div>
<button class="mx-ib mx-press" aria-label="閉じる" onClick="{{closeWin}}" style="width: 36px; height: 36px; flex: none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
</div>
<div class="mx-wpane" style="{{paneAnim}}">

<sc-if value="{{paneConnect}}" hint-placeholder-val="{{true}}">
<sc-if value="{{phaseIdle}}" hint-placeholder-val="{{true}}">
<div style="display: flex; flex-direction: column; gap: 10px; padding: 16px; border-radius: 20px; background: #0e0e10; color: #ffffff; flex: none">
<b style="font-size: 18px">Connect a keyboard</b>
<span style="font-size: 13px; line-height: 1.6; color: #c5c8ce">USB でつないでから押し、表示される一覧から選びます。分割キーボードは片方をつなげば使えます。</span>
<button class="mx-btn mx-press" onClick="{{openPicker}}" style="align-self: flex-start; border: none; display: flex; align-items: center; gap: 8px">Connect keyboard<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>
</div>
<div style="display: flex; flex-direction: column; gap: 6px; flex: none"><span class="mx-grph">RECENT</span>
<a class="mx-row mx-press" href="Main.dc.html" style="text-decoration: none; color: #0e0e10; background: rgba(255, 255, 255, 0.8)"><span style="display: flex; flex-direction: column; gap: 2px"><b style="font-size: 14px">Matrix Split 42</b><span class="mx-sub" style="font-size: 12px">このブラウザで前回使用・すぐ開けます</span></span><span style="font-size: 16px">→</span></a></div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; flex: none">
<label class="mx-row mx-press" style="position: relative; flex-direction: column; align-items: flex-start; gap: 4px; cursor: pointer; background: rgba(255, 255, 255, 0.8)"><b style="font-size: 13px">Keyboard definition</b><span class="mx-sub mx-help-t" style="font-size: 12px" title="カタログにないキーボードで、最初の1回だけ必要です。">{{defText}}</span><input type="file" accept=".json" aria-label="キーボード定義を読み込む" onChange="{{onDef}}" style="position: absolute; width: 1px; height: 1px; opacity: 0"></label>
<button class="mx-row mx-press" onClick="{{toFirmware}}" style="flex-direction: column; align-items: flex-start; gap: 4px; border: none; cursor: pointer; background: rgba(255, 255, 255, 0.8); text-align: left; font: inherit"><b style="font-size: 13px">Flash firmware</b><span class="mx-sub mx-help-t" style="font-size: 12px">.uf2 を左右に書き込む</span></button>
</div>
<span class="mx-sub mx-hide-short" style="font-size: 12px; flex: none">Chrome / Edge のバージョン 89 以降で動作します（WebHID）。</span>
</sc-if>
<sc-if value="{{phasePick}}" hint-placeholder-val="{{false}}">
<b style="font-size: 15px; flex: none">Choose a keyboard</b>
<span class="mx-sub" style="font-size: 12px; flex: none">USB でつながっているキーボードです。選んで Connect を押してください。</span>
<div role="listbox" aria-label="キーボード" style="display: flex; flex-direction: column; gap: 6px; flex: none">
<sc-for list="{{devices}}" as="d" hint-placeholder-count="1"><button class="mx-press" role="option" aria-selected="{{d.on}}" onClick="{{d.pick}}" style="{{d.style}}"><span style="display: flex; flex-direction: column; gap: 2px; text-align: left"><b style="font-size: 14px">{{d.name}}</b><span class="mx-sub" style="font-size: 12px">{{d.note}}</span></span><span style="{{d.radio}}"></span></button></sc-for>
</div>
<div style="flex: 1"></div>
<div style="display: flex; justify-content: flex-end; gap: 8px; flex: none"><button class="mx-btn mx-press" onClick="{{cancelPick}}">Cancel</button><button class="mx-btn dark mx-press" disabled="{{noDevice}}" onClick="{{connect}}">Connect</button></div>
</sc-if>
<sc-if value="{{phaseBusy}}" hint-placeholder-val="{{false}}">
<div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center">
<span class="mx-spin" style="width: 44px; height: 44px; border-radius: 22px; border: 3px solid #e1e3e8; border-top-color: #0e0e10"></span>
<b style="font-size: 17px">Connecting…</b><span class="mx-sub">キーボードからキーマップを読み込んでいます。</span>
</div>
</sc-if>
<sc-if value="{{phaseDone}}" hint-placeholder-val="{{false}}">
<div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center">
<span style="width: 56px; height: 56px; border-radius: 28px; background: #1f8a55; display: flex; align-items: center; justify-content: center; animation: mx-pop-a 0.45s cubic-bezier(0.3, 0.7, 0.4, 1)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"></path></svg></span>
<b style="font-size: 17px">Connected</b><span class="mx-sub">{{deviceName}} の準備ができました。左右とも認識しています。</span>
<a class="mx-primary mx-press" href="Main.dc.html">Open Keys<span style="width: 32px; height: 32px; border-radius: 16px; background: #ffffff; color: #0e0e10; display: flex; align-items: center; justify-content: center">→</span></a>
</div>
</sc-if>
</sc-if>

<sc-if value="{{paneDefs}}" hint-placeholder-val="{{false}}">
<span class="mx-sub" style="font-size: 12px; flex: none">キーボード定義（.json）はキーの配置やマトリクスを Remap に伝えるファイルです。このブラウザに保存され、次回から読み込みなしで開けます。カタログにあるキーボードでは不要です。</span>
<sc-if value="{{noDefs}}" hint-placeholder-val="{{false}}"><span class="mx-sub">保存されている定義はありません。</span></sc-if>
<div style="display: flex; flex-direction: column; gap: 6px; flex: 1; min-height: 0; overflow: auto">
<sc-for list="{{defs}}" as="d" hint-placeholder-count="2"><div class="mx-row" style="background: rgba(255, 255, 255, 0.8); animation: mx-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) backwards"><span style="display: flex; flex-direction: column; gap: 2px"><b style="font-size: 14px">{{d.name}}</b><span class="mx-sub" style="font-size: 12px; font-family: 'JetBrains Mono', monospace">{{d.meta}}</span></span><button class="mx-pill sm mx-press" onClick="{{d.remove}}" style="color: #a33a2c">Delete</button></div></sc-for>
</div>
<label class="mx-btn dark mx-press" style="position: relative; align-self: flex-start; display: flex; align-items: center; flex: none">Load definition file<input type="file" accept=".json" onChange="{{onDef}}" style="position: absolute; width: 1px; height: 1px; opacity: 0"></label>
</sc-if>

<sc-if value="{{paneFw}}" hint-placeholder-val="{{false}}">
<div style="display: flex; flex-direction: column; gap: 6px; flex: none"><b style="font-size: 13px">Side <span class="mx-sub" style="font-weight: 500">3D キーボードの左右の本体を押しても選べます</span></b>
<div class="mx-seg" role="radiogroup" aria-label="Side"><sc-for list="{{sides}}" as="o" hint-placeholder-count="2"><button class="mx-pill sm mx-press {{o.cls}}" role="radio" aria-checked="{{o.on}}" disabled="{{o.off}}" onClick="{{o.pick}}">{{o.label}}</button></sc-for></div></div>
<label style="{{fileBox}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5"></path></svg><span style="flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{fileLabel}}</span><span class="mx-pill sm" style="display: flex; align-items: center">Choose file</span><input type="file" accept=".uf2" aria-label=".uf2 ファイルを選択" disabled="{{flashing}}" onChange="{{onFile}}" style="position: absolute; width: 1px; height: 1px; opacity: 0"></label>
<sc-if value="{{flashing}}" hint-placeholder-val="{{false}}"><div style="height: 8px; border-radius: 4px; background: rgba(14, 14, 16, 0.08); overflow: hidden; flex: none"><div style="{{barStyle}}"></div></div></sc-if>
<div class="mx-row" style="background: #fff4e0; color: #6a4a12; gap: 10px; flex: none"><span class="mx-sub2" style="font-size: 12px; line-height: 1.6" title="新しいファームウェアを書き込むと、キーボードに保存されたキーマップはファームウェアの初期状態に戻ります。先に Export keymap で保存し、書き込み後に Import で戻してください。">書き込むとキーマップは初期状態に戻ります。先に Export で保存してください。左右両方に書き込みます。</span><button class="mx-pill sm mx-press" onClick="{{exportKeymap}}" style="flex: none">Export keymap</button></div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; flex: none">
<sc-for list="{{versions}}" as="r" hint-placeholder-count="3"><div class="mx-row" style="flex-direction: column; align-items: flex-start; gap: 2px; background: rgba(255, 255, 255, 0.8); padding: 8px 12px"><span class="mx-sub" style="font-size: 11px">{{r.k}}</span><b style="{{r.style}}">{{r.v}}</b></div></sc-for>
</div>
<sc-if value="{{fwNote}}" hint-placeholder-val="{{false}}"><span class="mx-sub" title="{{fwNoteText}}" style="{{fwNoteStyle}}">{{fwNoteText}}</span></sc-if>
</sc-if>

</div>
</div>
</sc-if>
</div>
</section>
</main>
@@HELP
<sc-if value="{{isConnect}}" hint-placeholder-val="{{true}}">
<b style="font-size: 15px">If it doesn’t connect</b>
<span>・一覧にキーボードが出ない時は、ケーブルを挿し直してください。</span>
<span>・データ通信に対応した USB ケーブルか確認してください。</span>
<span>・ほかのアプリがキーボードを使っていると接続できないことがあります。</span>
</sc-if>
<sc-if value="{{isFirmware}}" hint-placeholder-val="{{false}}">
<b style="font-size: 15px">Write firmware</b>
<span>3D キーボードの本体か Side で書き込む側を選び、.uf2 ファイルを選んで右下の Flash を押します。</span>
<span>書き込み前にキーマップをバックアップしておくと、書き込み後にすぐ元に戻せます。</span>
</sc-if>
@@PRIMARY
<sc-if value="{{isConnect}}" hint-placeholder-val="{{true}}">
<sc-if value="{{connected}}" hint-placeholder-val="{{false}}"><a class="mx-primary mx-press" href="Main.dc.html" style="animation: mx-chip-a 0.4s ease">Open Keys<span style="min-width: 32px; height: 32px; border-radius: 16px; background: #ffffff; color: #0e0e10; display: flex; align-items: center; justify-content: center">→</span></a></sc-if>
<sc-if value="{{notConnected}}" hint-placeholder-val="{{true}}"><button class="mx-primary mx-press {{connCls}}" onClick="{{openPicker}}" disabled="{{connOff}}">Connect keyboard<span style="min-width: 32px; height: 32px; border-radius: 16px; background: #ffffff; color: #0e0e10; display: flex; align-items: center; justify-content: center">→</span></button></sc-if>
</sc-if>
<sc-if value="{{isFirmware}}" hint-placeholder-val="{{false}}"><button class="mx-primary mx-press {{pCls}}" onClick="{{flash}}" disabled="{{pOff}}" style="animation: mx-chip-a 0.4s ease"><sc-if value="{{flashing}}" hint-placeholder-val="{{false}}"><span class="mx-spin"></span></sc-if>{{pLabel}}<span style="min-width: 32px; height: 32px; border-radius: 16px; background: #ffffff; color: #0e0e10; display: flex; align-items: center; justify-content: center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"></path></svg></span></button></sc-if>
@@JS
/*DEFAULT_SECTION*/
const section = st.section || DEF_SECTION;
const isConnect = section === 'connect', isFirmware = section === 'firmware';
const csub = st.csub || (DEF_SECTION === 'connect' && DEF_SUB) || 'kbd';
const secN = st.secN || 0, paneN = st.paneN || 0;
const winHide = !!st.winHide;
const go = (sec) => { if (sec === section) return; this.setState({ section: sec, secN: secN + 1, paneN: paneN + 1, winHide: false, winClosing: false, open: null }); };
const closeWin = () => { if (winHide || st.winClosing || st.flashing || st.phase === 'busy') return; this.setState({ winClosing: true }); this.later(() => this.setState({ winHide: true, winClosing: false }), 230); };

// connection: Connect starts unplugged; Firmware is reached from a connected session
const phase = st.phase || (st.connected ?? DEF_SECTION === 'firmware' ? 'done' : 'idle');
const connected = phase === 'done';
const DEVICES = [{ id: 'ms42', name: 'Matrix Split 42', note: 'USB でつながっています（左右とも検出）' }];
const dev = st.dev || null;
const deviceName = (DEVICES.find((d) => d.id === dev) || DEVICES[0]).name;
const connect = () => {
if (!dev) return;
this.setState({ phase: 'busy', powerN: (st.powerN || 0) + 1 });
this.later(() => { this.setState({ phase: 'done' }); this.showToast(deviceName + ' に接続しました'); }, 1700);
};

// firmware
const LATEST = 21;
const side = st.side || 'Left';
const file = st.file || null;
const flashing = !!st.flashing;
const prog = st.prog || 0;
const rev = st.rev || { Left: 19, Right: 19 };
const pickSide = (id) => () => { if (!isFirmware || flashing) return; this.setState({ side: id }); };
const flash = () => {
if (!file || flashing) return;
this.setState({ flashing: true, prog: 0 });
for (let i = 1; i <= 20; i++) this.later(() => this.setState({ prog: i / 20 }), i * 120);
this.later(() => { this.setState({ flashing: false, file: null, prog: 0, rebootN: (st.rebootN || 0) + 1, rev: Object.assign({}, rev, { [side]: LATEST }) }); this.showToast((side === 'Left' ? '左手側' : '右手側') + 'にファームウェアを書き込みました'); }, 2600);
};

// 3D keyboard geometry (same board as the Keys stage)
const P = [];
const stagL = [16, 16, 6, 0, 6, 10], stagR = [10, 6, 0, 6, 16, 16];
[['Tab', 'Ctrl', 'Shift'], ['Q', 'A', 'Z'], ['W', 'S', 'X'], ['E', 'D', 'C'], ['R', 'F', 'V'], ['T', 'G', 'B']].forEach((ks, c) => ks.forEach((id, r) => P.push({ id, side: 'Left', x: -370 + c * 60, y: -60 + r * 60 + stagL[c], w: 54 })));
[['Y', 'H', 'N'], ['U', 'J', 'M'], ['I', 'K', ','], ['O', 'L', '.'], ['P', ';', '/'], ['Bksp', "'", 'Esc']].forEach((ks, c) => ks.forEach((id, r) => P.push({ id, side: 'Right', x: 70 + c * 60, y: -60 + r * 60 + stagR[c], w: 54 })));
[['Alt', -190, 54], ['Lower', -130, 54], ['Space', -56, 84]].forEach(([id, x, w]) => P.push({ id, side: 'Left', x, y: 142, w }));
[['Enter', 56, 84], ['Raise', 130, 54], ['GUI', 190, 54]].forEach(([id, x, w]) => P.push({ id, side: 'Right', x, y: 142, w }));
const PAD = { x: 250, y: -215, w: 180, h: 118 };
const stW = st.sw || 1200, stH = st.sh || 560;
const narrow = stW < 820;
const fit = Math.max(0.42, Math.min(stW * 0.9 / 840, stH * 0.82 / 370));
const winOn = !winHide && !st.winClosing;
const wideW = Math.min(520, stW * 0.46, stW - 32);
const sideW = Math.max(240, stW - wideW - 48);
const sideLeft = narrow ? 50 : (stW - wideW - 32) / 2 / stW * 100;
const sideFit = narrow ? Math.min(stW * 0.9 / 840, stH * 0.34 / 370) : Math.max(0.36, Math.min(sideW * 0.94 / 840, stH * 0.8 / 370));
const s0 = winOn ? sideFit : fit * 0.9, left0 = winOn ? sideLeft : 50, top0 = winOn && narrow ? 20 : 52;
let cam = { s: s0 * (connected ? 1 : 0.94), a: connected ? 40 : 52, x: 0, y: -40, left: left0, top: top0 };
if (isFirmware) cam = { s: s0 * 1.18, a: 42, x: side === 'Left' ? -170 : 170, y: -40, left: left0, top: top0 };

const order = (k) => (k.side === 'Left' ? (k.x + 400) : (k.x - 40)) / 380;
const caps = P.map((k, i) => {
const mine = isFirmware && k.side === side;
const lit = mine && flashing && order(k) <= prog;
const cls = (connected ? '' : 'ghost') + (isFirmware && !mine ? ' fdim' : '') + (lit ? ' flashk' : '');
return {
label: connected ? k.id : '',
cls,
style: 'left: ' + (k.x - k.w / 2) + 'px; top: ' + (k.y - 27) + 'px; width: ' + k.w + 'px; font-size: ' + (k.id.length > 4 ? 10 : 12) + 'px; --i: ' + i + '; --o: ' + order(k).toFixed(2),
pick: k.side === 'Left' ? pickSide('Left') : pickSide('Right')
};
});
const sidesOut = (id) => (isFirmware && side !== id ? 'fdim' : '') + (isFirmware && side === id ? ' fsel' : '');
const pct = Math.round(prog * 100);

return Object.assign(C, {
isConnect, isFirmware, connected, notConnected: !connected,
bigTabs: [['connect', 'Connect'], ['firmware', 'Firmware']].map(([id, label]) => ({ label, cls: section === id ? 'cur' : '', ac: section === id ? 'page' : 'false', pick: () => go(id) })),
subTabs: isConnect ? [['kbd', 'Keyboards'], ['defs', 'Saved definitions']].map(([id, label]) => ({ label, isLink: false, isBtn: true, href: '', cls: csub === id ? 'cur' : '', ac: csub === id ? 'page' : 'false', pick: () => { if (csub !== id) this.setState({ csub: id, paneN: paneN + 1, winHide: false }); } })) : [{ label: 'Write firmware', isLink: false, isBtn: true, href: '', cls: 'cur', ac: 'page', pick: () => this.setState({ winHide: false }) }],
subLabel: (isConnect ? 'Connect' : 'Firmware') + ' のページ',
subAnim: 'animation: ' + (secN % 2 ? 'mx-sub-a' : 'mx-sub-b') + ' 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)',
connDot: 'width: 8px; height: 8px; border-radius: 4px; background: ' + (phase === 'busy' ? '#c08a1e' : '#8f9197'), connText: phase === 'busy' ? 'Connecting…' : 'Not connected',
langOpen: open === 'lang', toggleLang: toggle('lang'), langLabel: (st.lang || 'ja') === 'ja' ? '日本語' : 'English',
langs: [['ja', '日本語'], ['en', 'English']].map(([id, label]) => ({ label, on: (st.lang || 'ja') === id, style: 'font-weight: ' + ((st.lang || 'ja') === id ? 700 : 500), pick: () => this.setState({ lang: id, open: null }) })),
acctOpen: open === 'acct', toggleAcct: toggle('acct'), signedIn: !!st.signedIn, signedOut: !st.signedIn,
acctBtn: st.signedIn ? 'background: #3d6fd6' : '',
signIn: () => { this.setState({ signedIn: true, open: null }); this.showToast('ログインしました'); },
signOut: () => { this.setState({ signedIn: false, open: null }); this.showToast('ログアウトしました'); },

stageCls: (phase === 'busy' ? 'powering ' : '') + (connected && st.powerN ? 'powered' : ''),
camStyle: 'left: ' + cam.left.toFixed(2) + '%; top: ' + cam.top + '%; transform: scale(' + cam.s.toFixed(3) + ') rotateX(' + cam.a + 'deg) translate(' + (-cam.x) + 'px, ' + (-cam.y) + 'px)',
rigCls: (connected ? '' : 'idle') + ((st.rebootN || 0) ? ' reboot-' + ((st.rebootN || 0) % 2 ? 'a' : 'b') : ''),
halfLCls: sidesOut('Left'), halfRCls: sidesOut('Right'), halfLStyle: 'left: -416px; top: -114px; width: 410px; height: 304px; border: none; padding: 0; cursor: ' + (isFirmware && !flashing ? 'pointer' : 'default'),
halfRStyle: 'left: 6px; top: -300px; width: 410px; height: 490px; border: none; padding: 0; cursor: ' + (isFirmware && !flashing ? 'pointer' : 'default'),
pickLeft: pickSide('Left'), pickRight: pickSide('Right'),
padCls: (connected ? '' : 'ghost') + (isFirmware && side !== 'Right' ? ' fdim' : ''),
padStyle: 'left: ' + (PAD.x - PAD.w / 2) + 'px; top: ' + (PAD.y - PAD.h / 2) + 'px; width: ' + PAD.w + 'px; height: ' + PAD.h + 'px; cursor: default',
knobs3d: [['Left', -362], ['Right', 362]].map(([sd, x]) => ({ cls: isFirmware && side !== sd ? 'fdim' : '', style: 'left: ' + (x - 26) + 'px; top: 124px; transform: translateZ(14px)' })),
caps,
stageRef: (el) => {
if (!el || this._ro) return;
this._ro = new ResizeObserver((entries) => {
const r = entries[0].contentRect;
const cur = this.state || {};
if (Math.abs((cur.sw || 0) - r.width) > 4 || Math.abs((cur.sh || 0) - r.height) > 4) this.setState({ sw: Math.round(r.width), sh: Math.round(r.height) });
});
this._ro.observe(el);
},
chipStyle: 'height: 34px; border-radius: 17px; gap: 8px; font-size: 13px; font-weight: 600; color: #0e0e10; animation: ' + (secN % 2 ? 'mx-chip-a' : 'mx-chip-b') + ' 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
chipDot: 'width: 10px; height: 10px; border-radius: 5px; flex: none; transition: background-color 0.4s ease; background: ' + (connected ? '#1f8a55' : (phase === 'busy' ? '#c08a1e' : '#b5b8be')),
chipTitle: isFirmware ? (side === 'Left' ? 'Left half' : 'Right half') : (connected ? deviceName : 'No keyboard'),
chipSub: isFirmware ? 'r' + rev[side] + (rev[side] < LATEST ? ' → r' + LATEST + ' に更新できます' : ' · 最新') : (connected ? '接続済み・左右とも' : (phase === 'busy' ? '接続中…' : 'USB でつないでください')),
flashChip: flashing, flashPct: (side === 'Left' ? '左手側' : '右手側') + 'に書き込み中 ' + pct + '%',
hintText: isFirmware ? (flashing ? '書き込み中はケーブルを抜かないでください' : '本体を押すと、書き込む側を選べます') : (connected ? 'キーボードの準備ができました' : 'つなぐとキーボードが点灯します'),
hintStyle: 'height: 32px; animation: ' + (secN % 2 ? 'mx-chip-a' : 'mx-chip-b') + ' 0.5s ease',
reopenOn: winHide && !st.winClosing, reopenLabel: isFirmware ? 'Firmware settings' : 'Connect', reopen: () => this.setState({ winHide: false }),

closeWin, winOpen: !winHide, winCls: st.winClosing ? 'out' : '',
winStyle: st.winClosing ? '' : 'animation-name: ' + (secN % 2 ? 'mx-win' : 'mx-win2'),
winTitle: isFirmware ? 'Write firmware' : (csub === 'defs' ? 'Saved definitions' : 'Keyboards'),
winSub: isFirmware ? '.uf2 ファイルを左右それぞれに書き込みます。書き込み中はケーブルを抜かないでください。' : (csub === 'defs' ? 'このブラウザに保存されたキーボード定義です。' : 'Remap は WebHID でキーボードと直接通信します。'),
winIcon: 'width: 44px; height: 44px; border-radius: 14px; flex: none; background: linear-gradient(150deg, #2f3137, #1b1c20); transition: box-shadow 0.5s ease; box-shadow: inset 0 0 0 2px ' + (connected ? '#1f8a55' : '#8f9197') + (flashing ? ', 0 0 18px rgba(122, 162, 255, 0.6)' : ''),
paneAnim: 'animation: ' + (paneN % 2 ? 'mx-pin-a' : 'mx-pin-b') + ' 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
paneConnect: isConnect && csub === 'kbd', paneDefs: isConnect && csub === 'defs', paneFw: isFirmware,
phaseIdle: phase === 'idle', phasePick: phase === 'pick', phaseBusy: phase === 'busy', phaseDone: phase === 'done',
openPicker: () => this.setState({ phase: 'pick', dev: null, section: 'connect', csub: 'kbd', winHide: false, open: null, paneN: paneN + 1, secN: isConnect ? secN : secN + 1 }),
cancelPick: () => this.setState({ phase: 'idle', paneN: paneN + 1 }),
devices: DEVICES.map((d) => ({
name: d.name, note: d.note, on: dev === d.id, pick: () => this.setState({ dev: d.id }),
style: 'display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 14px 16px; border-radius: 16px; cursor: pointer; background: ' + (dev === d.id ? '#ffffff' : 'rgba(255, 255, 255, 0.6)') + '; border: ' + (dev === d.id ? '1.5px solid #0e0e10' : '1px solid #e1e3e8'),
radio: 'width: 18px; height: 18px; border-radius: 9px; box-sizing: border-box; flex: none; transition: border-width 0.2s ease; border: ' + (dev === d.id ? '6px solid #0e0e10' : '1.5px solid #b5b8be')
})),
noDevice: !dev, connect, deviceName,
connOff: phase === 'busy', connCls: phase === 'busy' ? 'idle' : '',
toFirmware: () => go('firmware'),
defText: st.def ? st.def + ' を読み込み済み' : 'Import .json',
noDefs: !(st.defs || [1]).length,
defs: (st.defs || [{ name: 'Matrix Split 42', meta: 'FEED:0000 · matrix-split42.json' }]).map((d, i, arr) => ({ name: d.name, meta: d.meta, remove: () => { this.setState({ defs: arr.filter((x, j) => j !== i) }); this.showToast(d.name + ' の定義を削除しました'); } })),
onDef: (e) => { const f = e.target.files && e.target.files[0]; if (f) { this.setState({ def: f.name, defs: (st.defs || [{ name: 'Matrix Split 42', meta: 'FEED:0000 · matrix-split42.json' }]).concat([{ name: f.name.replace(/\.json$/, ''), meta: f.name }]) }); this.showToast(f.name + ' を読み込みました'); } },

sides: [['Left', 'Left half'], ['Right', 'Right half']].map(([id, label]) => ({ label, on: side === id, cls: side === id ? 'on' : '', off: flashing, pick: pickSide(id) })),
fileLabel: file || '.uf2 ファイルを選択',
fileBox: 'position: relative; display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 8px 0 16px; border-radius: 16px; font-size: 14px; cursor: pointer; flex: none; transition: background-color 0.3s ease; ' + (file ? 'background: #ffffff; border: 1px solid #e1e3e8; color: #0e0e10' : 'background: rgba(255, 255, 255, 0.6); border: 1.5px dashed #c5c8ce; color: #4a4d54'),
onFile: (e) => { const f = e.target.files && e.target.files[0]; if (f) this.setState({ file: f.name }); },
flashing,
barStyle: 'height: 100%; border-radius: 4px; background: #0e0e10; transition: width 0.12s linear; width: ' + pct + '%',
versions: [{ k: 'Left half', v: 'r' + rev.Left, style: 'font-size: 15px; color: ' + (rev.Left < LATEST ? '#9a5310' : '#1f8a55') }, { k: 'Right half', v: 'r' + rev.Right, style: 'font-size: 15px; color: ' + (rev.Right < LATEST ? '#9a5310' : '#1f8a55') }, { k: 'Latest', v: 'r' + LATEST, style: 'font-size: 15px' }],
fwNote: rev.Left < LATEST || rev.Right < LATEST || rev.Left !== rev.Right,
fwNoteText: rev.Left !== rev.Right ? '左右のファームウェアが一致していません。もう片方にも同じファームウェアを書き込んでください。' : '最新の Matrix 対応版より古いため、一部の設定が反映されない可能性があります。',
fwNoteStyle: 'font-size: 12px; padding: 8px 12px; border-radius: 12px; flex: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ' + (rev.Left !== rev.Right ? 'background: #fbeae7; color: #8a2f24' : 'background: #fff4e0; color: #6a4a12'),
flash, pOff: !file || flashing, pCls: !file && !flashing ? 'idle' : '',
pLabel: flashing ? 'Flashing…' : 'Flash',
statusText: isFirmware ? (flashing ? (side === 'Left' ? '左手側' : '右手側') + 'に書き込み中… ' + pct + '%' : (file ? file + ' を選択中' : '.uf2 ファイルを選んでください')) : (connected ? deviceName + ' に接続済み' : (phase === 'busy' ? '接続中…' : 'キーボード未接続')),
statusDot: 'width: 8px; height: 8px; border-radius: 4px; transition: background-color 0.3s ease; background: ' + (isFirmware ? (flashing ? '#c08a1e' : (file ? '#3d6fd6' : '#8f9197')) : (connected ? '#1f8a55' : (phase === 'busy' ? '#c08a1e' : '#8f9197')))
});
