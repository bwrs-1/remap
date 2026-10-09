@@TITLE Keys · Keymap
@@BIG Keys
@@SUB Keymap
@@NAVMODE state
@@VARIANTS Main:keys/keymap:Keys · Keymap|Macros:keys/macros:Keys · Macros|Combos:keys/combos:Keys · Combos|Layers:keys/layers:Keys · Layers|Pointing:pointing/touchpad:Pointing · Touchpad|Lighting:lighting/eff:Lighting
@@H 1080
@@RIGHT
<div style="position: relative">
<button class="mx-hbtn mx-press" aria-haspopup="menu" aria-expanded="{{layerOpen}}" onClick="{{toggleLayer}}" style="padding: 0 6px 0 16px"><span style="{{layerDot}}"></span>{{layerTitle}}<span class="mx-dot32"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg></span></button>
<sc-if value="{{layerOpen}}" hint-placeholder-val="{{false}}">
<div class="mx-menu r" role="menu">
<sc-for list="{{layers}}" as="l" hint-placeholder-count="4">
<button class="mx-mi" role="menuitemradio" aria-checked="{{l.on}}" onClick="{{l.pick}}" style="{{l.style}}"><span style="{{l.dot}}"></span><span style="flex: 1">{{l.title}}</span><sc-if value="{{l.hasPending}}" hint-placeholder-val="{{false}}"><span style="min-width: 22px; height: 22px; border-radius: 11px; background: #e6edfb; color: #2a55b0; font-size: 12px; display: flex; align-items: center; justify-content: center; padding: 0 6px; box-sizing: border-box">{{l.pending}}</span></sc-if></button>
</sc-for>
<div class="mx-sep"></div>
<button class="mx-mi" role="menuitem" onClick="{{manageLayers}}">Manage layers…</button>
</div>
</sc-if>
</div>
<sc-if value="{{isKeys}}" hint-placeholder-val="{{true}}">
<button class="mx-ib mx-press {{undoCls}}" aria-label="元に戻す" title="元に戻す" disabled="{{undoOff}}" onClick="{{undo}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"></path><path d="M4 9h10a6 6 0 0 1 0 12h-3"></path></svg></button>
<button class="mx-ib mx-press {{redoCls}}" aria-label="やり直す" title="やり直す" disabled="{{redoOff}}" onClick="{{redo}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"></path><path d="M20 9H10a6 6 0 0 0 0 12h3"></path></svg></button>
</sc-if>
@@MAIN
<main class="mx-main" style="margin-left: 0; display: flex; flex-direction: column; overflow: hidden; -webkit-mask-image: none; mask-image: none; padding-bottom: clamp(8px, 1.4vh, 14px)">
<section class="mx-card" aria-label="キーボード" style="flex: 1 1 auto; min-height: 0; display: flex; padding: clamp(6px, 1.2vh, 12px); animation: mx-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s backwards">
<div class="mx-stage {{stageCls}}" role="group" aria-label="3D キーボード" ref="{{stageRef}}" style="{{stageStyle}}">
<button class="mx-stagebg" aria-label="設定ウィンドウを閉じる" tabindex="-1" onClick="{{closeWin}}"></button>
<div class="mx-cam {{fxCls}}" style="{{camStyle}}">
<div class="mx-half" style="{{halfL}}"></div>
<div class="mx-half" style="{{halfR}}"></div>
<div class="mx-pad {{padCls}}" role="button" tabindex="0" aria-label="Touchpad" aria-pressed="{{padOn}}" onClick="{{pickPad}}" onMouseMove="{{padMove}}" onMouseLeave="{{padLeave}}" style="{{padStyle}}">
<span class="mx-padlbl" style="{{padLblStyle}}">TOUCHPAD</span>
<sc-if value="{{padRingOn}}" hint-placeholder-val="{{false}}"><span style="position: absolute; left: 50%; top: 50%; width: 76px; height: 76px; margin: -40px 0 0 -40px; border-radius: 40px; border: 2px dashed rgba(255, 255, 255, 0.4); pointer-events: none; animation: mx-fade 0.5s ease"></span></sc-if>
<sc-if value="{{padArrowOn}}" hint-placeholder-val="{{false}}"><span style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; animation: mx-fade 0.5s ease"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="{{padArrow}}"><path d="M12 20V4M6 10l6-6 6 6"></path></svg></span></sc-if>
<sc-if value="{{padZonesOn}}" hint-placeholder-val="{{false}}"><sc-for list="{{padZones}}" as="z" hint-placeholder-count="8"><button class="mx-pzone {{z.cls}}" aria-label="{{z.label}}" aria-pressed="{{z.on}}" title="{{z.label}}" onClick="{{z.pick}}" style="{{z.style}}">{{z.mark}}</button></sc-for></sc-if>
<sc-if value="{{padDotOn}}" hint-placeholder-val="{{false}}"><span style="{{padDot}}"></span></sc-if>
</div>
<sc-for list="{{knobs3d}}" as="k" hint-placeholder-count="2"><button class="mx-knob {{k.cls}}" aria-label="{{k.label}}" title="{{k.label}}" onClick="{{k.pick}}" style="{{k.style}}"></button></sc-for>
<sc-for list="{{caps}}" as="k" hint-placeholder-count="42"><button class="mx-cap {{k.cls}}" aria-label="{{k.aria}}" aria-pressed="{{k.on}}" onClick="{{k.pick}}" style="{{k.style}}">{{k.label}}<sc-if value="{{k.changed}}" hint-placeholder-val="{{false}}"><span style="position: absolute; top: 5px; right: 5px; width: 7px; height: 7px; border-radius: 4px; background: #3d6fd6"></span></sc-if><sc-if value="{{k.hasHold}}" hint-placeholder-val="{{false}}"><span style="{{k.holdStyle}}">{{k.hold}}</span></sc-if></button></sc-for>
</div>

<div class="mx-float" style="left: 16px; top: 16px">
<sc-if value="{{chipOn}}" hint-placeholder-val="{{true}}"><span class="mx-chip mx-glass" style="{{chipStyle}}"><span style="{{chipDot}}"></span>{{chipTitle}}<span style="font-weight: 500; color: #6b6e75">· {{chipSub}}</span></span></sc-if>
<sc-if value="{{isLighting}}" hint-placeholder-val="{{false}}"><div class="mx-seg mx-glass" role="radiogroup" aria-label="光り方を見るレイヤー" style="{{pvSegStyle}}"><sc-for list="{{pvLayers}}" as="o" hint-placeholder-count="4"><button class="mx-pill sm mx-press {{o.cls}}" role="radio" aria-checked="{{o.on}}" onClick="{{o.pick}}" style="border-color: transparent"><span style="{{o.dot}}"></span>{{o.label}}</button></sc-for></div></sc-if>
</div>
<sc-if value="{{isKeymap}}" hint-placeholder-val="{{true}}">
<div class="mx-float {{toolsCls}}" style="right: 16px; top: 16px">
<div class="mx-seg mx-glass" role="group" aria-label="キーボードの表示サイズ" title="{{sizeTitle}}" style="padding: 3px; border-radius: 19px"><sc-for list="{{sizes}}" as="z" hint-placeholder-count="3"><button class="mx-pill sm mx-press {{z.cls}}" aria-pressed="{{z.on}}" onClick="{{z.pick}}" style="border-color: transparent">{{z.label}}</button></sc-for></div>
<button class="mx-tool mx-press mx-glass" disabled="{{nothingPending}}" onClick="{{askClear}}" title="Clear all changes" style="border: none">Clear</button>
<button class="mx-tool mx-press mx-glass" onClick="{{cheatSheet}}" title="Get keymap cheat sheet (PDF)" style="border: none">PDF</button>
<div style="position: relative">
<button class="mx-dots mx-press mx-glass" aria-label="その他の操作" aria-haspopup="menu" aria-expanded="{{moreOpen}}" onClick="{{toggleMore}}" style="border: none"></button>
<sc-if value="{{moreOpen}}" hint-placeholder-val="{{false}}">
<div class="mx-menu r" role="menu" style="top: 44px; min-width: 280px">
<label class="mx-mi">Import keyboard definition file<input type="file" accept=".json" onChange="{{onDefImport}}" style="position: absolute; width: 1px; height: 1px; opacity: 0"></label>
<button class="mx-mi" role="menuitem" onClick="{{startTest}}">Test Matrix mode</button>
<div class="mx-sep"></div>
<button class="mx-mi danger" role="menuitem" onClick="{{askReset}}">Reset Keymap…</button>
</div>
</sc-if>
</div>
</div>
</sc-if>
<sc-if value="{{testing}}" hint-placeholder-val="{{false}}">
<div class="mx-float" style="left: 50%; top: 60px; transform: translateX(-50%)"><span class="mx-glass" style="display: flex; align-items: center; gap: 12px; padding: 8px 8px 8px 16px; border-radius: 18px; background: rgba(232, 244, 238, 0.92); font-size: 13px; color: #2f5f47"><b>Test Matrix</b>キーを押すと緑になります（見本ではクリックで代用）・{{testCount}}<button class="mx-pill sm mx-press" onClick="{{endTest}}">終了</button></span></div>
</sc-if>
<sc-if value="{{hintOn}}" hint-placeholder-val="{{true}}">
<div class="mx-float opt {{hintCls}}" style="left: 16px; bottom: 16px; max-width: 46%">
<span class="mx-chip mx-glass" style="{{hintStyle}}"><sc-if value="{{isKeymap}}" hint-placeholder-val="{{true}}"><span style="display: flex; align-items: center; gap: 6px"><span style="width: 7px; height: 7px; border-radius: 4px; background: #3d6fd6"></span>未反映</span><span><b style="color: #a3a6ad">▽</b> 透過</span></sc-if><span>{{hintText}}</span></span>
</div>
</sc-if>
<sc-if value="{{isKeymap}}" hint-placeholder-val="{{true}}">
<div class="mx-float {{toolsCls}}" style="right: 16px; bottom: 16px">
<div class="mx-seg mx-glass" role="group" aria-label="キーの表記" style="padding: 3px; border-radius: 19px"><button class="mx-pill sm mx-press {{usCls}}" aria-pressed="{{isUS}}" onClick="{{setUS}}" style="border-color: transparent">US</button><button class="mx-pill sm mx-press {{jisCls}}" aria-pressed="{{isJIS}}" onClick="{{setJIS}}" style="border-color: transparent">JIS</button></div>
<select class="mx-sel mx-glass" aria-label="キーの表記（言語・配列）" value="{{labelLang}}" onChange="{{onLabelLang}}" style="height: 34px; font-size: 12px; width: 180px; border: none"><sc-for list="{{langs}}" as="o" hint-placeholder-count="56"><option value="{{o}}">{{o}}</option></sc-for></select>
<div class="mx-seg mx-glass" style="padding: 3px; border-radius: 19px">
<button class="mx-pill sm mx-press {{ovCls}}" aria-pressed="{{isOverview}}" onClick="{{toOverview}}" title="キーボード全体を表示" style="border-color: transparent">Overview</button>
<button class="mx-pill sm mx-press {{fcCls}}" aria-pressed="{{isFocus}}" onClick="{{toFocus}}" title="選択中の場所にズーム" style="border-color: transparent">Zoom</button>
</div>
</div>
</sc-if>
<sc-if value="{{reopenOn}}" hint-placeholder-val="{{false}}">
<div class="mx-float" style="right: 16px; bottom: 16px; animation: mx-chip-a 0.4s ease"><button class="mx-btn dark mx-press" onClick="{{reopen}}" style="height: 40px; display: flex; align-items: center; gap: 8px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h7"></path></svg>{{reopenLabel}}</button></div>
</sc-if>

<sc-if value="{{keyWinOpen}}" hint-placeholder-val="{{false}}">
<div class="mx-win {{winCls}}" role="dialog" aria-label="{{winTitle}}">
<sc-if value="{{winKey}}" hint-placeholder-val="{{true}}">
<div style="display: flex; align-items: center; gap: 12px; flex: none">
<span style="{{capStyle}}">{{selLabel}}</span>
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1">
<span style="display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap"><b style="font-size: 15px">Selected key</b><span class="mx-sub" style="font-size: 12px">{{selWhere}}</span></span>
<span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; word-break: break-all">{{selCode}} · Tap {{selLabel}} · Hold {{selHold}}</span>
<span class="mx-sub mx-hide-short" style="font-size: 12px; line-height: 1.5">{{selDesc}}</span>
</div>
<button class="mx-ib mx-press" aria-label="閉じる" onClick="{{closeWin}}" style="width: 36px; height: 36px; flex: none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
</div>
<sc-if value="{{selChanged}}" hint-placeholder-val="{{false}}"><div class="mx-row" style="padding: 6px 6px 6px 12px; background: rgba(61, 111, 214, 0.1); flex: none"><span>Before <b>{{selBefore}}</b> → <b>{{selLabel}}</b></span><button class="mx-pill sm mx-press" onClick="{{resetKey}}">Revert</button></div></sc-if>
<div class="mx-tabs" role="tablist" style="flex: none"><sc-for list="{{winTabs}}" as="t" hint-placeholder-count="4"><button role="tab" aria-selected="{{t.on}}" onClick="{{t.pick}}">{{t.label}}</button></sc-for></div>

<sc-if value="{{tabKey}}" hint-placeholder-val="{{true}}">
<div style="display: flex; flex-direction: column; gap: 8px; flex: 1; min-height: 0">
<div class="mx-seg" role="group" aria-label="キーコードの種類" style="{{catsWrap}}"><sc-for list="{{cats}}" as="c" hint-placeholder-count="6"><button class="mx-pill sm mx-press {{c.cls}}" aria-pressed="{{c.on}}" onClick="{{c.pick}}">{{c.label}}</button></sc-for></div>
<label style="height: 34px; border-radius: 17px; background: rgba(255, 255, 255, 0.85); display: flex; align-items: center; gap: 8px; padding: 0 8px 0 14px; font-size: 13px; color: #6b6e75; flex: none"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b6e75" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg><input placeholder="Search keycodes" aria-label="キーコードを検索" value="{{query}}" onChange="{{onQuery}}" style="border: none; background: transparent; outline: none; font: inherit; color: #0e0e10; width: 100%"><sc-if value="{{hasQuery}}" hint-placeholder-val="{{false}}"><button aria-label="検索をクリア" onClick="{{clearQuery}}" style="width: 22px; height: 22px; border: none; border-radius: 11px; background: #e1e3e8; display: flex; align-items: center; justify-content: center; cursor: pointer; flex: none"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0e0e10" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></sc-if></label>
<span class="mx-sub mx-hide-short" style="font-size: 11px; flex: none">{{paletteNote}}</span>
<div style="display: flex; flex-direction: column; gap: 12px; flex: 1; min-height: 110px; overflow: auto; padding-right: 4px">
<sc-for list="{{groups}}" as="g" hint-placeholder-count="4">
<div class="mx-grp"><span class="mx-grph">{{g.title}}</span>
<div style="display: flex; flex-wrap: wrap; gap: 5px">
<sc-for list="{{g.keys}}" as="p" hint-placeholder-count="10"><button class="mx-tile mx-key" onClick="{{p.pick}}" onMouseEnter="{{p.hover}}" onMouseLeave="{{p.unhover}}" onFocus="{{p.hover}}" onBlur="{{p.unhover}}" title="{{p.tip}}" style="{{p.style}}">{{p.label}}</button></sc-for>
</div></div>
</sc-for>
</div>
<div role="status" aria-live="polite" style="{{descBar}}"><span style="{{descCap}}">{{hovLabel}}</span><span style="display: flex; flex-direction: column; gap: 1px; min-width: 0"><span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6b6e75">{{hovCode}}</span><span style="font-size: 12px; line-height: 1.5">{{hovDesc}}</span></span></div>
<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: none; font-size: 12px">
<b>Modifiers</b><sc-for list="{{mods}}" as="m" hint-placeholder-count="4"><label class="mx-check" style="font-size: 12px"><input type="checkbox" checked="{{m.on}}" disabled="{{m.off}}" onChange="{{m.toggle}}" style="width: 15px; height: 15px">{{m.label}}</label></sc-for>
<span class="mx-seg" style="margin-left: auto"><button class="mx-pill sm mx-press {{sideL}}" disabled="{{modsOff}}" onClick="{{setSideL}}" style="height: 26px; padding: 0 10px">L</button><button class="mx-pill sm mx-press {{sideR}}" disabled="{{modsOff}}" onClick="{{setSideR}}" style="height: 26px; padding: 0 10px">R</button></span>
</div>
</div>
</sc-if>

<sc-if value="{{tabHold}}" hint-placeholder-val="{{false}}">
<div style="display: flex; flex-direction: column; gap: 12px; flex: 1; min-height: 0">
<span class="mx-sub">タップでは {{selLabel}} を送り、長押しした時だけ下の動作をします。</span>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px"><sc-for list="{{holdOpts}}" as="h" hint-placeholder-count="9"><button class="mx-pill mx-press {{h.cls}}" role="radio" aria-checked="{{h.on}}" onClick="{{h.pick}}" style="padding: 0 6px">{{h.label}}</button></sc-for></div>
<span class="mx-sub" style="font-size: 12px">Ctrl などはモッドタップ（MT）、LT はレイヤータップです。判定時間は Pointing › Timing で変えられます。</span>
</div>
</sc-if>

<sc-if value="{{tabCustom}}" hint-placeholder-val="{{false}}">
<div style="display: flex; flex-direction: column; gap: 12px; flex: 1; min-height: 0">
<span class="mx-sub">キーコードを16進数で直接指定できます。</span>
<label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b6e75"><span style="font-family: 'JetBrains Mono', monospace; font-size: 15px; color: #0e0e10">0x</span><input class="mx-input" maxlength="4" aria-label="Code (hex)" value="{{hex}}" onChange="{{onHex}}" style="font-family: 'JetBrains Mono', monospace; text-transform: uppercase; width: 140px"></label>
<span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #4a4d54; letter-spacing: 0.06em">{{hexBits}}</span>
<div><button class="mx-btn dark mx-press" disabled="{{hexOff}}" onClick="{{applyHex}}">Apply</button></div>
</div>
</sc-if>

<sc-if value="{{tabPresets}}" hint-placeholder-val="{{false}}">
<div style="display: flex; flex-direction: column; gap: 10px; flex: 1; min-height: 0">
<div class="mx-seg" role="group" aria-label="OS"><button class="mx-pill sm mx-press {{macCls}}" onClick="{{setMac}}">Mac</button><button class="mx-pill sm mx-press {{winOsCls}}" onClick="{{setWin}}">Windows</button></div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; overflow: auto; min-height: 0">
<sc-for list="{{presets}}" as="p" hint-placeholder-count="16"><button class="mx-press" onClick="{{p.pick}}" style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 8px 10px; border: none; border-radius: 12px; background: rgba(255, 255, 255, 0.85); cursor: pointer; text-align: left"><b style="font-size: 13px">{{p.combo}}</b><span style="font-size: 11px; color: #6b6e75">{{p.label}}</span></button></sc-for>
</div>
</div>
</sc-if>

<div class="mx-hide-short" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex: none">
<span class="mx-sub" style="font-size: 11px">キーコードを選ぶと割り当てて閉じます</span>
<button class="mx-btn dark mx-press" onClick="{{closeWin}}" style="height: 38px">Done</button>
</div>
</sc-if>
</div>
</sc-if>

<sc-if value="{{secWinOpen}}" hint-placeholder-val="{{false}}">
<div class="mx-win {{secWinCls}}" role="dialog" aria-label="{{secTitle}}" style="{{secWinStyle}}">
<div style="display: flex; align-items: center; gap: 12px; flex: none">
<span style="{{secIcon}}"></span>
<div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1"><b style="font-size: 16px">{{secTitle}}</b><span class="mx-sub mx-help-t mx-whsub" title="{{secSub}}" style="font-size: 12px">{{secSub}}</span></div>
<span class="mx-chip" style="height: 28px; font-size: 11px; background: rgba(255, 255, 255, 0.7); flex: none"><span style="{{secChipDot}}"></span>{{saveChip}}</span>
<button class="mx-ib mx-press" aria-label="閉じる" onClick="{{closeWin}}" style="width: 36px; height: 36px; flex: none"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
</div>
<sc-if value="{{hasInner}}" hint-placeholder-val="{{true}}"><div class="mx-tabs n" role="tablist" aria-label="{{secTitle}} の設定項目" style="flex: none"><sc-for list="{{innerTabs}}" as="t" hint-placeholder-count="6"><button role="tab" aria-selected="{{t.on}}" onClick="{{t.pick}}">{{t.label}}</button></sc-for></div></sc-if>
<div class="mx-wpane" style="{{paneAnim}}">
<sc-if value="{{isMacros}}" hint-placeholder-val="{{false}}">
<div role="radiogroup" aria-label="マクロ" style="display: grid; grid-template-columns: repeat(16, minmax(0, 1fr)); gap: 4px; flex: none">
<sc-for list="{{mList}}" as="m" hint-placeholder-count="16"><button class="mx-press" role="radio" aria-checked="{{m.on}}" title="{{m.preview}}" onClick="{{m.pick}}" style="{{m.style}}">{{m.name}}<sc-if value="{{m.dirty}}" hint-placeholder-val="{{false}}"><span aria-label="未反映" style="position: absolute; top: 3px; right: 3px; width: 6px; height: 6px; border-radius: 3px; background: #3d6fd6"></span></sc-if></button></sc-for>
</div>
<div style="flex: 1; min-height: 112px; display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; overflow: auto; padding: 10px; border-radius: 18px; background: rgba(255, 255, 255, 0.6)">
<sc-if value="{{mEmpty}}" hint-placeholder-val="{{false}}"><span class="mx-sub" style="margin: auto; font-size: 12px">下のキーを押すか、テキストを追加してください。</span></sc-if>
<sc-for list="{{mSteps}}" as="s" hint-placeholder-count="6">
<div style="{{s.box}}">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 2px"><button class="mx-press" title="待ち時間（押すたびに増えます）" onClick="{{s.bump}}" style="height: 22px; border: none; border-radius: 11px; background: #eef0f3; padding: 0 7px; font-size: 10px; font-weight: 600; cursor: pointer; font-variant-numeric: tabular-nums">⧗ {{s.delay}}</button><button aria-label="このステップを削除" onClick="{{s.remove}}" style="width: 22px; height: 22px; border: none; border-radius: 11px; background: transparent; cursor: pointer; color: #6b6e75">×</button></div>
<button onClick="{{s.target}}" title="{{s.targetTitle}}" style="border: none; background: transparent; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; min-height: 34px; padding: 0"><sc-for list="{{s.keys}}" as="k" hint-placeholder-count="1"><b style="font-size: 13px; white-space: pre-line; text-align: center">{{k}}</b></sc-for></button>
<div style="display: flex; justify-content: space-between; align-items: center"><button aria-label="前へ" onClick="{{s.left}}" style="width: 20px; height: 20px; border: none; background: transparent; cursor: pointer; color: #6b6e75">‹</button><button disabled="{{s.noFlip}}" title="{{s.flipTitle}}" onClick="{{s.flip}}" style="{{s.tag}}">{{s.kind}}</button><button aria-label="後ろへ" onClick="{{s.right}}" style="width: 20px; height: 20px; border: none; background: transparent; cursor: pointer; color: #6b6e75">›</button></div>
</div>
</sc-for>
</div>
<div style="display: flex; gap: 6px; flex: none">
<input class="mx-input" placeholder="テキストを入力（例：Hello）" aria-label="追加するテキスト" value="{{mText}}" onChange="{{onMText}}" style="height: 36px; flex: 1; width: auto; border-radius: 18px">
<button class="mx-pill mx-press" disabled="{{mNoText}}" onClick="{{mAddText}}">Add text</button>
<button class="mx-pill mx-press" disabled="{{mEmpty}}" onClick="{{mClear}}" title="このマクロを空にする">Clear</button>
</div>
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex: none"><span class="mx-grph">{{mPickTitle}}</span><input class="mx-input" placeholder="Search keycodes" aria-label="キーコードを検索" value="{{mKq}}" onChange="{{onMKq}}" style="height: 32px; width: 200px; border-radius: 16px; font-size: 13px"></div>
<div class="mx-pick" style="display: flex; flex-wrap: wrap; gap: 5px; max-height: 80px; overflow: auto; flex: none">
<sc-for list="{{mPick}}" as="p" hint-placeholder-count="20"><button class="mx-tile mx-key" onClick="{{p.add}}" title="{{p.code}}" style="height: 36px; min-width: 38px; padding: 0 8px">{{p.label}}</button></sc-for>
</div>
</sc-if>

<sc-if value="{{isCombos}}" hint-placeholder-val="{{false}}">
<sc-if value="{{cNotEditing}}" hint-placeholder-val="{{true}}">
<div class="mx-row" style="flex: none; background: rgba(255, 255, 255, 0.7)"><span class="mx-sub" style="font-size: 12px">2〜4 個のキーを同時に押すと、別のキーを送ったりレイヤーを切り替えたりできます。保存した時点でキーボードに書き込まれます。</span><b style="font-size: 18px; flex: none">{{cUsed}}</b></div>
<sc-if value="{{cNone}}" hint-placeholder-val="{{false}}"><span class="mx-sub">まだコンボはありません。Add combo か、3D キーボードのキーを押して追加できます。</span></sc-if>
<div style="display: flex; flex-direction: column; gap: 6px; flex: 1; min-height: 0; overflow: auto">
<sc-for list="{{cList}}" as="c" hint-placeholder-count="2">
<div class="mx-row" onMouseEnter="{{c.hover}}" onMouseLeave="{{c.unhover}}" style="{{c.style}}"><span style="{{c.dot}}"></span><div style="display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0"><b style="font-size: 14px">{{c.title}}</b><span class="mx-sub" style="font-size: 12px">{{c.meta}}</span></div><button class="mx-pill sm mx-press" onClick="{{c.edit}}">Edit</button><button class="mx-pill sm mx-press" onClick="{{c.remove}}" style="color: #a33a2c">Delete</button></div>
</sc-for>
</div>
</sc-if>
<sc-if value="{{cEditing}}" hint-placeholder-val="{{false}}">
<div style="display: flex; flex-direction: column; gap: 6px; flex: none"><b style="font-size: 13px">1. Trigger keys <span class="mx-sub" style="font-weight: 500">3D キーボードのキーを 2〜4 個押す（レイヤー 0）</span></b>
<div class="mx-seg" style="min-height: 28px; align-items: center"><sc-for list="{{cTrig}}" as="t" hint-placeholder-count="2"><button class="mx-pill sm mx-press on" onClick="{{t.remove}}" title="外す" style="animation: mx-pop-a 0.35s ease">{{t.label}} ×</button></sc-for><sc-if value="{{cTrigEmpty}}" hint-placeholder-val="{{false}}"><span class="mx-sub" style="font-size: 12px">まだ選ばれていません</span></sc-if></div></div>
<div style="display: flex; flex-direction: column; gap: 6px; flex: none"><b style="font-size: 13px">2. Output</b>
<div style="display: flex; gap: 8px; align-items: center"><select class="mx-sel" aria-label="出力するキー" value="{{cOutSel}}" onChange="{{onCOut}}" style="height: 36px; flex: 1; min-width: 0"><option value="">Choose...</option><sc-for list="{{cGroups}}" as="g" hint-placeholder-count="8"><optgroup label="{{g.label}}"><sc-for list="{{g.opts}}" as="o" hint-placeholder-count="3"><option value="{{o}}">{{o}}</option></sc-for></optgroup></sc-for></select><label style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b6e75; flex: none">0x<input class="mx-input" maxlength="4" aria-label="keycode (hex)" value="{{cHex}}" onChange="{{onCHex}}" style="width: 70px; height: 36px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase"></label></div></div>
<div style="display: flex; flex-direction: column; gap: 6px; flex: none"><b style="font-size: 13px">3. Combo term <span class="mx-sub" style="font-weight: 500">同時押しとみなす時間（ms）</span></b><div class="mx-seg"><sc-for list="{{cTerms}}" as="t" hint-placeholder-count="7"><button class="mx-pill sm mx-press {{t.cls}}" aria-pressed="{{t.on}}" onClick="{{t.pick}}">{{t.label}}</button></sc-for></div></div>
<div style="display: flex; flex-direction: column; gap: 6px; flex: none"><b style="font-size: 13px">4. Active layers <span class="mx-sub" style="font-weight: 500">選ばなければ全レイヤー</span></b><div class="mx-seg"><sc-for list="{{cLayerOpts}}" as="t" hint-placeholder-count="4"><button class="mx-pill sm mx-press {{t.cls}}" aria-pressed="{{t.on}}" onClick="{{t.pick}}">{{t.label}}</button></sc-for></div></div>
<div style="flex: 1"></div>
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex: none"><sc-if value="{{cHasOut}}" hint-placeholder-val="{{false}}"><span style="height: 32px; border-radius: 12px; background: #0e0e10; color: #ffffff; padding: 0 12px; display: flex; align-items: center; font-size: 12px; font-weight: 600; animation: mx-pop-a 0.35s ease">{{cPreview}}</span></sc-if><span style="flex: 1"></span><button class="mx-btn mx-press" disabled="{{cBusy}}" onClick="{{cCancel}}" style="height: 38px">Cancel</button><button class="mx-btn dark mx-press" disabled="{{cSaveOff}}" onClick="{{cSave}}" style="height: 38px; display: flex; align-items: center; gap: 8px"><sc-if value="{{cBusy}}" hint-placeholder-val="{{false}}"><span class="mx-spin"></span></sc-if>Save to keyboard</button></div>
</sc-if>
</sc-if>

<sc-if value="{{isLayersSub}}" hint-placeholder-val="{{false}}">
<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex: none"><span class="mx-sub" style="font-size: 12px">{{lCount}}</span><button class="mx-tool mx-press" disabled="{{lAddOff}}" onClick="{{lAdd}}" title="{{lAddTitle}}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>Add layer</button></div>
<div style="display: flex; flex-direction: column; gap: 6px; flex: 1; min-height: 0; overflow: auto">
<sc-for list="{{lRows}}" as="r" hint-placeholder-count="4">
<div class="mx-row" onClick="{{r.pick}}" style="{{r.style}}">
<button class="mx-press" aria-label="{{r.colorLabel}}" aria-expanded="{{r.palOpen}}" onClick="{{r.togglePal}}" style="{{r.dot}}"></button>
<sc-if value="{{r.renaming}}" hint-placeholder-val="{{false}}"><input class="mx-input" aria-label="レイヤー名" maxlength="24" value="{{r.draft}}" onChange="{{r.onDraft}}" onKeyDown="{{r.onKey}}" onClick="{{r.stop}}" style="height: 32px; flex: 1; width: auto"><button class="mx-pill sm mx-press on" onClick="{{r.saveName}}">Save</button></sc-if>
<sc-if value="{{r.notRenaming}}" hint-placeholder-val="{{true}}"><b onDoubleClick="{{r.startRename}}" title="ダブルクリックで名前を変更" style="font-size: 14px">{{r.name}}</b><span class="mx-sub" style="font-family: 'JetBrains Mono', monospace; font-size: 12px">L{{r.index}}</span><button class="mx-press" aria-label="名前を変更" onClick="{{r.startRename}}" style="width: 28px; height: 28px; border: none; border-radius: 14px; background: transparent; cursor: pointer; color: #6b6e75"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"></path></svg></button><span style="flex: 1"></span></sc-if>
<sc-if value="{{r.hasLed}}" hint-placeholder-val="{{false}}"><button onClick="{{r.toLed}}" title="Lighting › Layer colors を開く" style="height: 24px; border-radius: 12px; background: #ffffff; border: 1px solid #e1e3e8; display: flex; align-items: center; gap: 5px; padding: 0 8px; font-size: 10px; font-weight: 700; cursor: pointer">LED<span style="{{r.ledDot}}"></span></button></sc-if>
<sc-if value="{{r.hasChanges}}" hint-placeholder-val="{{false}}"><span title="未反映の変更" style="min-width: 22px; height: 22px; border-radius: 11px; background: #fdebd6; color: #9a5310; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 6px; box-sizing: border-box">{{r.changes}}</span></sc-if>
<button class="mx-pill sm mx-press" onClick="{{r.edit}}">Edit keys</button>
<sc-if value="{{r.removable}}" hint-placeholder-val="{{false}}"><button class="mx-press" aria-label="レイヤーを削除" onClick="{{r.remove}}" style="width: 30px; height: 30px; border: none; border-radius: 15px; background: transparent; cursor: pointer; color: #a33a2c"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"></path></svg></button></sc-if>
</div>
<sc-if value="{{r.palOpen}}" hint-placeholder-val="{{false}}"><div role="radiogroup" aria-label="{{r.colorLabel}}" style="display: flex; gap: 6px; padding: 2px 12px 4px; animation: mx-menu 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)"><sc-for list="{{r.colors}}" as="c" hint-placeholder-count="9"><button class="mx-press" role="radio" aria-checked="{{c.on}}" aria-label="{{c.label}}" onClick="{{c.pick}}" style="{{c.style}}"></button></sc-for></div></sc-if>
</sc-for>
</div>
<span class="mx-sub mx-hide-short" style="font-size: 12px; flex: none">行を押すと 3D キーボードがそのレイヤーに切り替わります。▽（透過）は下のレイヤーと同じ動作です。削除できるのは一番上のレイヤーだけです。</span>
</sc-if>
<!--CARDS:paneCards-->
</div>
</div>
</sc-if>
</div>
</section>
</main>
@@HELP
<sc-if value="{{isKeymap}}" hint-placeholder-val="{{true}}">
<b style="font-size: 15px">Keymap</b>
<span>1. 3D キーボードのキーを押すと、そのキーにズームして設定ウィンドウが開きます。</span>
<span>2. Keycode からキーを選ぶと割り当ててウィンドウが閉じます。長押しの動作・16進コード・ショートカットは他のタブで設定します。</span>
<span>3. 右下の Write to keyboard でキーボードに書き込みます。それまでは青い点で表示されます。タッチパッドを押すと Pointing に移ります。</span>
</sc-if>
<sc-if value="{{isMacros}}" hint-placeholder-val="{{false}}">
<b style="font-size: 15px">Macros</b>
<span>上の M0〜M15 からマクロを選び、テキストやキーを追加します。⧗ はそのステップの前に待つ時間です。TAP / HOLD の表示を押すと切り替わります。</span>
<span>3D キーボードのキーを押すと、そのキーに選択中のマクロを割り当てます。Write to keyboard でまとめて書き込みます。</span>
</sc-if>
<sc-if value="{{isCombos}}" hint-placeholder-val="{{false}}">
<b style="font-size: 15px">Combos</b>
<span>3D キーボードのキーを押すとコンボの作成が始まり、押したキーがトリガーになります。出力・判定時間・有効なレイヤーを選んで保存します。</span>
<span>一覧の行にカーソルを合わせると、そのコンボのキーが 3D キーボード上で光ります。</span>
</sc-if>
<sc-if value="{{isLayersSub}}" hint-placeholder-val="{{false}}">
<b style="font-size: 15px">Layers</b>
<span>行を押すと 3D キーボードがそのレイヤーの割り当てに切り替わります。名前はダブルクリックか鉛筆のボタンで変更できます（Enter で保存、Esc で取り消し）。</span>
<span>レイヤーの削除は Write to keyboard を押すまでキーボードには書き込まれません。</span>
</sc-if>
<sc-if value="{{isPointing}}" hint-placeholder-val="{{false}}">
<b style="font-size: 15px">Pointing</b>
<span>タッチパッドにズームした状態で、右のウィンドウから設定します。Edges タブでは 3D のタッチパッド上の縁や角を直接押して選べます。</span>
<span>変更は約 0.4 秒後に自動でキーボードに保存されます。保存ボタンはありません。</span>
</sc-if>
<sc-if value="{{isLighting}}" hint-placeholder-val="{{false}}">
<b style="font-size: 15px">Lighting</b>
<span>設定はすぐに 3D キーボードの光り方に反映されます。左上のレイヤーを切り替えると、そのレイヤーが有効なときの光り方を確認できます。</span>
<span>Touch glow では、3D のタッチパッドの上でカーソルを動かすと対応する位置のキーが光ります。変更は自動で保存されます。</span>
</sc-if>
@@PRIMARY
<sc-if value="{{showWrite}}" hint-placeholder-val="{{true}}"><button class="mx-primary mx-press {{writeCls}}" onClick="{{write}}" disabled="{{writeOff}}"><sc-if value="{{writing}}" hint-placeholder-val="{{false}}"><span class="mx-spin"></span></sc-if>{{writeLabel}}<span style="{{badgeStyle}}">{{pending}}</span></button></sc-if>
<sc-if value="{{isCombos}}" hint-placeholder-val="{{false}}"><button class="mx-primary mx-press {{cAddCls}}" onClick="{{cAdd}}" disabled="{{cAddOff}}" style="animation: mx-chip-a 0.4s ease">Add combo<span style="min-width: 32px; height: 32px; border-radius: 16px; background: #ffffff; color: #0e0e10; display: flex; align-items: center; justify-content: center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg></span></button></sc-if>
<sc-if value="{{notKeys}}" hint-placeholder-val="{{false}}"><button class="mx-primary mx-press" onClick="{{resetSec}}" title="{{resetTitle}}" style="padding: 0 24px; animation: mx-chip-a 0.4s ease">Reset to defaults</button></sc-if>
@@DIALOGS
<sc-if value="{{dlgReset}}" hint-placeholder-val="{{false}}">
<div style="display: flex; flex-direction: column; gap: 16px">
<h2 style="margin: 0; font-size: 20px; font-weight: 600">Are you sure to reset keymap?</h2>
<span style="font-size: 14px; color: #4a4d54; line-height: 1.7">今のキーマップを破棄して、初期のキーマップをすぐにキーボードへ適用します。今のキーマップを使い回したい場合は、先に Export で保存してください。</span>
<div style="display: flex; justify-content: flex-end; gap: 8px"><button class="mx-btn mx-press" onClick="{{closeAll}}">No</button><button class="mx-btn red mx-press" onClick="{{doReset}}">Yes</button></div>
</div>
</sc-if>
<sc-if value="{{dlgClear}}" hint-placeholder-val="{{false}}">
<div style="display: flex; flex-direction: column; gap: 16px">
<h2 style="margin: 0; font-size: 20px; font-weight: 600">Clear all changes?</h2>
<span style="font-size: 14px; color: #4a4d54; line-height: 1.7">まだキーボードに反映していない {{pending}} 件の変更をすべて取り消します。</span>
<div style="display: flex; justify-content: flex-end; gap: 8px"><button class="mx-btn mx-press" onClick="{{closeAll}}">Cancel</button><button class="mx-btn red mx-press" onClick="{{doClear}}">Clear</button></div>
</div>
</sc-if>

<sc-if value="{{dlgLRemove}}" hint-placeholder-val="{{false}}">
<div style="display: flex; flex-direction: column; gap: 16px">
<h2 style="margin: 0; font-size: 20px; font-weight: 600">Remove layer?</h2>
<span style="font-size: 14px; color: #4a4d54; line-height: 1.7">このレイヤーにはキーが割り当てられています。すべてのキーを透過にして、レイヤーを削除しますか？（このあと Write to keyboard を押すと、キーボードに書き込まれます）</span>
<div style="display: flex; justify-content: flex-end; gap: 8px"><button class="mx-btn mx-press" onClick="{{closeAll}}">Cancel</button><button class="mx-btn red mx-press" onClick="{{doLRemove}}">Remove</button></div>
</div>
</sc-if>
@@JS
/*KEYCODE_CATS*/
/*KEY_DESC*/
/*DEFAULT_SECTION*/
const PRESETS = [['Copy', '⌘C', 'Ctrl+C'], ['Paste', '⌘V', 'Ctrl+V'], ['Cut', '⌘X', 'Ctrl+X'], ['Undo', '⌘Z', 'Ctrl+Z'], ['Redo', '⇧⌘Z', 'Ctrl+Y'], ['Select All', '⌘A', 'Ctrl+A'], ['Save', '⌘S', 'Ctrl+S'], ['Save As', '⇧⌘S', 'Ctrl+Shift+S'], ['Find', '⌘F', 'Ctrl+F'], ['New', '⌘N', 'Ctrl+N'], ['New Tab', '⌘T', 'Ctrl+T'], ['Close Tab', '⌘W', 'Ctrl+W'], ['Quit', '⌘Q', 'Alt+F4'], ['App Switch', '⌘Tab', 'Alt+Tab'], ['Spotlight', '⌘Space', null], ['IME Toggle', '⌃Space', 'Alt+`'], ['Screenshot', '⇧⌘3', null], ['Partial SS', '⇧⌘4', 'Shift+Win+S']];
const LANGS = ['Canadian Multilingual (CSA)', 'Croatian', 'Czech', 'Danish', 'Dutch (Belgium)', 'English (Ireland)', 'English (US)', 'English (UK)', 'English (US International)', 'Estonian', 'Finnish', 'French', 'French (AFNOR)', 'French (BÉPO)', 'French (Belgium)', 'French (Switzerland)', 'French (macOS, ISO)', 'German', 'German (Switzerland)', 'German (macOS)', 'German (Neo2)', 'Greek', 'Hebrew', 'Hungarian', 'Icelandic', 'Italian', 'Italian (macOS, ANSI)', 'Italian (macOS, ISO)', 'Japanese', 'Korean', 'Latvian', 'Lithuanian (ĄŽERTY)', 'Lithuanian (QWERTY)', 'Norwegian', 'Polish', 'Portuguese', 'Portuguese (macOS, ISO)', 'Portuguese (Brazil)', 'Romanian', 'Russian', 'Serbian', 'Serbian (Latin)', 'Slovak', 'Slovenian', 'Spanish', 'Spanish (Dvorak)', 'Swedish', 'Turkish (F)', 'Turkish (Q)', 'Colemak', 'Dvorak', 'Dvorak (French)', 'Dvorak (Programmer)', 'Norman', 'Workman', 'Workman (ZXCVM)'];
const PALETTE = ['#8d5129', '#275db9', '#366c1b', '#795c03', '#a83171', '#7345c1', '#b03229', '#09646f', '#383a3f'];
const LMAX = 8;
const lyrs = st.lyrs || [{ name: 'Base', color: 0 }, { name: 'Lower', color: 1 }, { name: 'Raise', color: 2 }, { name: 'Mouse', color: 3 }];
const LAYERS = lyrs.map((l) => ({ name: l.name, color: PALETTE[l.color] }));
const LAY = (i) => LAYERS[i] || { name: 'Layer ' + i, color: '#8f9197' };
const LIDX = LAYERS.map((_, i) => i);
const MAPS = {
1: { Q: '1', W: '2', E: '3', R: '4', T: '5', Y: '6', U: '7', I: '8', O: '9', P: '0', A: 'F1', S: 'F2', D: 'F3', F: 'F4', G: 'F5', H: '←', J: '↓', K: '↑', L: '→', Z: 'F6', X: 'F7', C: 'F8', V: 'F9', B: 'F10' },
2: { Q: '!', W: '@', E: '#', R: '$', T: '%', Y: '^', U: '&', I: '*', O: '(', P: ')', A: '-', S: '=', D: '[', F: ']', G: '\\', H: 'Home', J: 'Page Down', K: 'Page Up', L: 'End' },
3: { U: 'Mouse Wh ↑', M: 'Mouse Wh ↓', H: 'Mouse Wh ←', ';': 'Mouse Wh →', J: 'Mouse Btn1', K: 'Mouse Btn2', L: 'Mouse Btn3' }
};
const CODES = { Tab: 'KC_TAB', Ctrl: 'KC_LCTL', Shift: 'KC_LSFT', Bksp: 'KC_BSPC', Esc: 'KC_ESC', Alt: 'KC_LALT', Lower: 'MO(1)', Space: 'KC_SPC', Enter: 'KC_ENT', Raise: 'MO(2)', GUI: 'KC_LGUI', '!': 'S(KC_1)', '@': 'S(KC_2)', '#': 'S(KC_3)', '$': 'S(KC_4)', '%': 'S(KC_5)', '^': 'S(KC_6)', '&': 'S(KC_7)', '*': 'S(KC_8)', '(': 'S(KC_9)', ')': 'S(KC_0)', '▽': 'KC_TRNS' };
const CATOF = {};
KEYCODE_CATS.forEach(([cat, subs]) => subs.forEach(([sid, title, keys]) => keys.forEach(([l, c]) => { if (!CODES[l]) CODES[l] = c; if (!CATOF[l]) CATOF[l] = cat; })));
const custom = st.custom || {};
const codeOf = (l) => custom[l] || CODES[l] || l;
const JIS = { "'": ':', '@': '"', '^': '&', '&': "'", '*': '(', '(': ')', '=': '^', '[': '@', ']': '[', '\\': ']', '`': '半角/全角' };
const HOLDS = [['None', null], ['Ctrl', 'LCTL'], ['Shift', 'LSFT'], ['Alt', 'LALT'], ['Win/Cmd', 'LGUI'], ['LT 1', '1'], ['LT 2', '2'], ['LT 3', '3'], ['Swap Hands', 'SH']];
const START = ['Lower', ';'];

// ---- sections: Keys / Pointing / Lighting share one stage; switching is a state change, not a page load ----
const section = st.section || DEF_SECTION;
const isKeys = section === 'keys', isPointing = section === 'pointing', isLighting = section === 'lighting';
const ksub = st.ksub || (DEF_SECTION === 'keys' && DEF_SUB) || 'keymap';
const psub = st.psub || (DEF_SECTION === 'pointing' && DEF_SUB) || 'touchpad';
const lsub = st.lsub || (DEF_SECTION === 'lighting' && DEF_SUB) || 'eff';
const isKeymap = isKeys && ksub === 'keymap', isMacros = isKeys && ksub === 'macros', isCombos = isKeys && ksub === 'combos', isLayersSub = isKeys && ksub === 'layers';
const secN = st.secN || 0, paneN = st.paneN || 0;
const secHide = !!st.secHide;
const go = (sec, patch) => {
if (sec === section && !patch) return;
this.setState(Object.assign({ section: sec, win: false, winClosing: false, view: 'overview', secHide: false, secN: secN + 1, paneN: paneN + 1, open: null, hov: null, touch: null, testing: false }, patch || {}));
};

const layer = Math.min(st.layer ?? 0, lyrs.length - 1);
const sel = st.sel || 'F';
const n = st.n || 0;
const labelLang = st.labelLang || 'English (US)';
const jis = labelLang === 'Japanese';
const A = st.A || {}, H = st.H || {}, W = st.W || {}, WH = st.WH || {};
const past = st.past || [], future = st.future || [];
const writing = !!st.writing;
const query = st.query || '';
const cat = st.cat || 'Basic';
const size = st.size || 'M';
const testing = !!st.testing;
const tested = st.tested || {};
const os = st.os || 'mac';
const view = st.view || 'overview';
const win = !!st.win;
const wtab = st.wtab || 'key';
const closeWin = () => {
if (st.winClosing) return;
if (isKeymap && !win) return;
if (!isKeymap && secHide) return;
this.setState({ winClosing: true });
this.later(() => this.setState(isKeymap ? { win: false, winClosing: false, view: 'overview', hov: null } : { secHide: true, winClosing: false }), 230);
};
const openWin = (patch) => this.setState(Object.assign({ win: true, winClosing: false, wtab: 'key', view: 'focus', open: null, query: '' }, patch));

const baseOf = (l, id) => l === 0 ? id : (MAPS[l] && MAPS[l][id] !== undefined ? MAPS[l][id] : '▽');
const has = (o, l, id) => !!(o[l] && Object.prototype.hasOwnProperty.call(o[l], id));
const labelOf = (l, id) => has(A, l, id) ? A[l][id] : (has(W, l, id) ? W[l][id] : baseOf(l, id));
const holdOf = (l, id) => has(H, l, id) ? H[l][id] : (has(WH, l, id) ? WH[l][id] : null);
const startLeft = st.startDone ? [] : START;
const pendingOn = (l) => {
const ids = {};
Object.keys(A[l] || {}).forEach((id) => { ids[id] = 1; });
Object.keys(H[l] || {}).forEach((id) => { ids[id] = 1; });
if (l === 0) startLeft.forEach((id) => { ids[id] = 1; });
return Object.keys(ids).length;
};
const isChanged = (l, id) => has(A, l, id) || has(H, l, id) || (l === 0 && startLeft.indexOf(id) >= 0);
const kmPending = LIDX.reduce((s2, l) => s2 + pendingOn(l), 0);
const disp = (l) => (jis && JIS[l] !== undefined ? JIS[l] : l);
const holdShort = { LCTL: 'Ctrl', LSFT: 'Shift', LALT: 'Alt', LGUI: 'Win', '1': 'L1', '2': 'L2', '3': 'L3', SH: 'SH' };
const setIn = (obj, l, id, val) => { const o = Object.assign({}, obj); const m = Object.assign({}, o[l] || {}); if (val === undefined) delete m[id]; else m[id] = val; o[l] = m; return o; };
const commit = (nA, nH, extra) => this.setState(Object.assign({ A: nA, H: nH, past: past.concat([{ A, H }]).slice(-50), future: [], n: n + 1 }, extra || {}));
const assign = (label, code, extra) => {
const c = code && code !== label ? Object.assign({}, custom, { [label]: code }) : custom;
commit(setIn(A, layer, sel, label), H, Object.assign({ custom: c }, extra || {}));
};

// ---- Macros (M0–M15, written with Write to keyboard) ----
const MBUF = 1024;
const MINIT = [
[{ kind: 'ascii', keys: ['H'], delay: 0 }, { kind: 'ascii', keys: ['e'], delay: 0 }, { kind: 'ascii', keys: ['l'], delay: 0 }, { kind: 'ascii', keys: ['l'], delay: 0 }, { kind: 'ascii', keys: ['o'], delay: 0 }, { kind: 'tap', keys: ['Enter'], delay: 0 }],
[{ kind: 'hold', keys: ['*Ctrl', '*Shift', 'Esc'], delay: 0 }]
];
const macros = st.macros || Array.from({ length: 16 }, (_, i) => MINIT[i] || []);
const msaved = st.msaved || macros.map((m) => JSON.stringify(m));
const msel = st.msel ?? 0;
const mtarget = st.mtarget ?? -1;
const mSteps0 = macros[msel];
const setMacro = (list, extra) => { const ms = macros.slice(); ms[msel] = list; this.setState(Object.assign({ macros: ms }, extra || {})); };
const stepBytes = (x) => (x.kind === 'ascii' ? 1 : (x.kind === 'tap' ? 3 : x.keys.length * 6)) + (x.delay ? 3 + String(x.delay).length : 0);
const mUsed = macros.reduce((t, m) => t + m.reduce((u, x) => u + stepBytes(x), 0) + 1, 0);
const mRemaining = MBUF - mUsed;
const mDirty = macros.filter((m, i) => JSON.stringify(m) !== msaved[i]).length;
const mPreview = (m) => m.length ? m.map((x) => x.kind === 'ascii' ? x.keys[0] : (x.kind === 'hold' ? '[' + x.keys.join('+') + ']' : '{' + x.keys[0] + '}')).join('') : '（空）';
const mBump = (d) => (d < 1000 ? d + 50 : (d < 5000 ? d + 100 : (d + 1000 > 9999 ? 0 : d + 1000)));
const mSteps = mSteps0.map((x, i) => {
const isTarget = x.kind === 'hold' && i === mtarget;
return {
kind: x.kind.toUpperCase(), keys: x.kind === 'ascii' ? ['"' + x.keys[0] + '"'] : x.keys, delay: x.delay + 'ms',
noFlip: x.kind === 'ascii', flipTitle: x.kind === 'tap' ? '押すと HOLD（まとめて押し続ける）に変えます' : (x.kind === 'hold' ? '押すと TAP に分けます' : ''),
targetTitle: x.kind === 'hold' ? 'このグループにキーを追加する' : '',
box: 'width: 92px; display: flex; flex-direction: column; gap: 4px; padding: 6px; box-sizing: border-box; border-radius: 14px; background: #ffffff; animation: mx-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; box-shadow: ' + (isTarget ? '0 0 0 2px #0e0e10' : '0 1px 3px rgba(20, 24, 40, 0.08)'),
tag: 'height: 20px; border: none; cursor: ' + (x.kind === 'ascii' ? 'default' : 'pointer') + '; font-size: 9px; font-weight: 700; letter-spacing: 0.08em; padding: 0 7px; border-radius: 8px; ' + (x.kind === 'hold' ? 'background: #0e0e10; color: #ffffff' : (x.kind === 'ascii' ? 'background: #e6edfb; color: #2a55b0' : 'background: #eef0f3; color: #4a4d54')),
bump: () => { const l = mSteps0.slice(); l[i] = Object.assign({}, x, { delay: mBump(x.delay) }); setMacro(l); },
remove: () => { const l = mSteps0.slice(); l.splice(i, 1); setMacro(l, { mtarget: -1 }); },
left: () => { if (i === 0) return; const l = mSteps0.slice(); l.splice(i - 1, 0, l.splice(i, 1)[0]); setMacro(l); },
right: () => { if (i === mSteps0.length - 1) return; const l = mSteps0.slice(); l.splice(i + 1, 0, l.splice(i, 1)[0]); setMacro(l); },
target: () => this.setState({ mtarget: x.kind === 'hold' && mtarget !== i ? i : -1 }),
flip: () => {
if (x.kind === 'ascii') return;
const l = mSteps0.slice();
if (x.kind === 'tap') l[i] = Object.assign({}, x, { kind: 'hold' });
else l.splice(i, 1, ...x.keys.map((k) => ({ kind: 'tap', keys: [k], delay: 0 })));
setMacro(l, { mtarget: -1 });
}
};
});
const mkq = (st.mkq || '').trim().toLowerCase();
const mPool = [];
KEYCODE_CATS.forEach(([c, subs]) => { if (c === 'Midi' || c === 'Layer') return; subs.forEach(([sid, title, keys]) => { if (sid === 'macro') return; keys.forEach(([l, code]) => mPool.push([l, code, sid])); }); });
const mPicks = mkq ? mPool.filter(([l, code]) => l.toLowerCase().indexOf(mkq) >= 0 || code.toLowerCase().indexOf(mkq) >= 0).slice(0, 80) : mPool.filter((x) => ['edit', 'mods', 'move', 'f'].indexOf(x[2]) >= 0);
const mAddKey = (label) => {
const l = mSteps0.slice();
if (mtarget >= 0 && l[mtarget] && l[mtarget].kind === 'hold') { l[mtarget] = Object.assign({}, l[mtarget], { keys: l[mtarget].keys.concat([label]) }); setMacro(l); return; }
l.push({ kind: 'tap', keys: [label], delay: 0 });
setMacro(l);
};
const mText = st.mtext || '';

// ---- Combos (saved to the keyboard one by one) ----
const CSLOTS = 16;
const CCOL = ['#3d6fd6', '#d6409f', '#1f8a55', '#c08a1e', '#7345c1', '#05a2c2', '#b03229', '#383a3f'];
const CGROUPS = [['Common keys', ['Esc', 'Enter', 'Tab', 'Backspace', 'Delete', 'Space']], ['Japanese input', ['Eisu (LANG2)', 'Kana (LANG1)', 'Hankaku/Zenkaku (JIS `)']], ['Mouse', ['Left click', 'Right click', 'Middle click']], ['Layer (while held)', ['MO(1)', 'MO(2)', 'MO(3)']], ['Layer (toggle)', ['TG(1)', 'TG(2)', 'TG(3)']], ['Layer (switch)', ['TO(0)', 'TO(1)', 'TO(2)', 'TO(3)']], ['Mac', ['Cmd+C', 'Cmd+V', 'Cmd+Z']], ['Windows', ['Ctrl+C', 'Ctrl+V', 'Ctrl+Z']]];
const CTERMS = [[null, '50 (既定)'], [30, '30'], [40, '40'], [60, '60'], [80, '80'], [100, '100'], [150, '150']];
const cbs = st.cbs || [{ slot: 0, keys: ['J', 'K'], out: 'Esc', term: null, layers: [] }, { slot: 1, keys: ['D', 'F'], out: 'Tab', term: 40, layers: [0] }];
const ced = st.ced || null;
const cbusy = !!st.cbusy;
const chov = st.chov ?? -1;
const cOut = ced ? (ced.hex ? '0x' + ced.hex.padStart(4, '0') : ced.out) : '';
const cNext = (() => { for (let i = 0; i < CSLOTS; i++) if (!cbs.some((c) => c.slot === i)) return i; return -1; })();
const cOf = {};
cbs.forEach((c) => c.keys.forEach((k) => { if (!(k in cOf)) cOf[k] = c.slot; }));
const cStart = (keys) => { if (cNext < 0) return; this.setState({ ced: { isNew: true, slot: cNext, keys: keys || [], out: '', hex: '', term: null, layers: [] }, chov: -1 }); };
const cToggleKey = (id) => {
if (!ced) { cStart([id]); return; }
const on = ced.keys.indexOf(id) >= 0;
if (!on && ced.keys.length >= 4) { this.showToast('トリガーキーは 4 個までです'); return; }
this.setState({ ced: Object.assign({}, ced, { keys: on ? ced.keys.filter((k) => k !== id) : ced.keys.concat([id]) }) });
};

// ---- Layers (names and colors are display-only; removal is written with Write to keyboard) ----
const lremoved = st.lremoved || 0;
const lren = st.lren ?? -1;
const lpal = st.lpal ?? -1;
const setLyr = (i, patch) => { const ls = lyrs.slice(); ls[i] = Object.assign({}, ls[i], patch); this.setState({ lyrs: ls }); };
const lCommit = (i) => { const v2 = (st.ldraft || '').trim(); setLyr(i, { name: v2 || lyrs[i].name }); this.setState({ lren: -1 }); };
const lHasKeys = (i) => !!(MAPS[i] || (W[i] && Object.keys(W[i]).length) || (A[i] && Object.keys(A[i]).length));
const lRemoveTop = () => {
const i = lyrs.length - 1;
const nA = Object.assign({}, A), nH = Object.assign({}, H), nW = Object.assign({}, W), nWH = Object.assign({}, WH);
delete nA[i]; delete nH[i]; delete nW[i]; delete nWH[i];
this.setState({ lyrs: lyrs.slice(0, -1), A: nA, H: nH, W: nW, WH: nWH, lremoved: lremoved + (lHasKeys(i) ? 1 : 0), layer: Math.min(layer, i - 1), open: null, lpal: -1, lren: -1 });
this.showToast(lyrs[i].name + ' を削除しました' + (lHasKeys(i) ? '（未反映）' : ''));
};
const pending = kmPending + lremoved + mDirty;

// ---- Pointing values (auto-saved) ----
const TPD = { smoothMove: true, thr: 20, startMove: 10, upd: 6, slow: 6, fast: 28, momentum: 20, prec: 33, cpi: 800, accel: true, glide: false, rot: 0, invX: false, invY: false, tap: true, two: true, drag: false, tapTerm: 200, scroll: 'Two finger', sSpeed: 8, natural: false, horiz: true, precision: false, sens: '2x', edgeWidth: 15, step: 8, zone: 'right', zones: { right: 'Scroll up / down', bottom: 'Scroll left / right' }, rev: {} };
const MLD = { enabled: true, layer: 3, act: 10, release: 650, delay: 200, debounce: 25, nonMouse: true, keepMods: true };
const TMD = { term: 200, decision: 'Tap preferred', left: 'Middle click', right: 'Mouse back button', up: 'Win / Cmd key', down: 'Esc' };
const KND = { left: { p: 'Volume', rev: false }, right: { p: 'Scroll up / down', rev: false } };
const tp = Object.assign({}, TPD, st.tp || {});
const ml = Object.assign({}, MLD, st.ml || {});
const tm = Object.assign({}, TMD, st.tm || {});
const kn = Object.assign({}, KND, st.kn || {});
const setTp = (p) => autosave({ tp: Object.assign({}, tp, p) });
const setMl = (p) => autosave({ ml: Object.assign({}, ml, p) });
const setTm = (p) => autosave({ tm: Object.assign({}, tm, p) });
const setKn = (p) => autosave({ kn: Object.assign({}, kn, p) });
const TP = (k) => (x) => setTp({ [k]: x });
const ML = (k) => (x) => setMl({ [k]: x });
const TM = (k) => (x) => setTm({ [k]: x });
const tpTab = st.tpTab || 'pointer';
const mlTab = st.mlTab || 'ov';
const tmTab = st.tmTab || 'hold';
const knobSel = st.knobSel || 'left';
const EDGE_P = [['Volume', 'Volume down', 'Volume up'], ['Screen brightness', 'Brightness down', 'Brightness up'], ['Scroll up / down', 'Scroll down', 'Scroll up'], ['Scroll left / right', 'Scroll left', 'Scroll right'], ['Zoom (Ctrl + wheel)', 'Zoom out', 'Zoom in'], ['Zoom (Ctrl + keypad + / -)', 'Zoom out', 'Zoom in'], ['Zoom (Ctrl + = / -, US layout only)', 'Zoom out', 'Zoom in'], ['Switch tabs (Ctrl+Tab)', 'Previous tab', 'Next tab'], ['Undo / redo (Ctrl+Z / Ctrl+Y)', 'Undo', 'Redo'], ['Undo / redo (Cmd+Z / Cmd+Shift+Z)', 'Undo', 'Redo'], ['Previous / next track', 'Previous track', 'Next track'], ['Arrow keys up / down', 'Down', 'Up'], ['Arrow keys left / right', 'Left', 'Right'], ['Page up / down', 'Page down', 'Page up']];
const CORNERS = ['None', 'Esc', 'Mute', 'Play / pause', 'Middle click', 'Right click', 'Browser back', 'Browser forward', 'Copy (Ctrl+C)', 'Paste (Ctrl+V)', 'Copy (Cmd+C)', 'Paste (Cmd+V)', 'Show desktop', 'Task view', 'Mission Control'];
const ZONES = [['left', 'Left edge', 'edge', 'Left'], ['right', 'Right edge', 'edge', 'Right'], ['top', 'Top edge', 'edge', 'Top'], ['bottom', 'Bottom edge', 'edge', 'Bottom'], ['tl', 'Top-left corner', 'corner', '↖'], ['tr', 'Top-right corner', 'corner', '↗'], ['bl', 'Bottom-left corner', 'corner', '↙'], ['br', 'Bottom-right corner', 'corner', '↘']];
const SWIPE = [['Common', ['None', 'Middle click', 'Mouse back button', 'Mouse forward button', 'Browser back', 'Browser forward', 'Esc', 'Win / Cmd key']], ['Mac', ['Previous desktop', 'Next desktop', 'Mission Control', 'App windows', 'Back (Cmd+[)', 'Forward (Cmd+])']], ['Windows', ['Previous desktop ', 'Next desktop ', 'Task view', 'Show desktop', 'Back (Alt+Left)', 'Forward (Alt+Right)']]];

// ---- Lighting values (auto-saved) ----
const EFFECTS = ['Off', 'Solid color', 'Alphas/mods', 'Gradient up-down', 'Gradient left-right', 'Breathing', 'Band sat', 'Band val', 'Pinwheel sat', 'Pinwheel val', 'Spiral sat', 'Spiral val', 'Cycle all', 'Cycle left-right', 'Cycle up-down', 'Rainbow moving chevron', 'Cycle out-in', 'Cycle out-in dual', 'Cycle pinwheel', 'Cycle spiral', 'Dual beacon', 'Rainbow beacon', 'Rainbow pinwheels', 'Raindrops', 'Jellybean raindrops', 'Hue breathing', 'Hue pendulum', 'Hue wave', 'Pixel rain', 'Pixel flow', 'Pixel fractal', 'Typing heatmap', 'Digital rain', 'Solid reactive simple', 'Solid reactive', 'Solid reactive wide', 'Solid reactive multiwide', 'Solid reactive cross', 'Solid reactive multicross', 'Solid reactive nexus', 'Solid reactive multinexus', 'Splash', 'Multisplash', 'Solid splash', 'Solid multisplash'];
const LED = [[0, 'Lighting effect', null], [1, 'Off', '#1f2023'], [2, 'Red', '#e5484d'], [3, 'Green', '#30a46c'], [4, 'Yellow', '#f5d90a'], [5, 'Blue', '#3e63dd'], [6, 'Magenta', '#d6409f'], [7, 'Cyan', '#05a2c2'], [8, 'White', '#ffffff']];
const GLOW = [[0, 'Same as the lighting', null], [2, 'Red', '#e5484d'], [3, 'Green', '#30a46c'], [4, 'Yellow', '#f5d90a'], [5, 'Blue', '#3e63dd'], [6, 'Magenta', '#d6409f'], [7, 'Cyan', '#05a2c2'], [8, 'White', '#ffffff']];
const LTD = { effect: 'Cycle left-right', bright: 180, speed: 128, hue: 150, sat: 220, guide: 'Guide off', colorMode: 'Keep the colors', dim: 10, glow: true, glowColor: 0, size: 26, fade: 50, led: [0, 5, 3, 4] };
const lt = Object.assign({}, LTD, st.lt || {});
const setLt = (p) => autosave({ lt: Object.assign({}, lt, p) });
const LT = (k) => (x) => setLt({ [k]: x });
const fxKind = (e) => {
if (e === 'Off') return 'off';
if (e === 'Solid color' || e === 'Alphas/mods') return 'static';
if (/^(Gradient|Band|Pinwheel|Spiral)/.test(e)) return 'grad';
if (/[Bb]reathing|pendulum/.test(e)) return 'breathe';
if (e === 'Cycle all') return 'cycle';
if (/reactive|[Ss]plash/.test(e)) return 'react';
if (/rain|Raindrops|fractal|heatmap/i.test(e)) return 'twinkle';
return 'wave';
};
const FX_NOTE = { off: 'LED は消灯します。レイヤーの色も表示されません。', static: '一定の色で点灯します。', grad: '場所によって色が変わります（動きはありません）。', breathe: 'ゆっくり明るくなったり暗くなったりします。Speed で速さが変わります。', cycle: 'キーボード全体の色が順番に変わります。', wave: '虹色の波がキーボードを流れます。Speed で速さが変わります。', twinkle: 'ランダムな位置のキーが光ります。', react: '押したキーが光ります（見本ではキーにカーソルを合わせると光ります）。' };

// ---- 3D keyboard geometry (board coordinates in px, origin between the halves) ----
const P = [];
const stagL = [16, 16, 6, 0, 6, 10], stagR = [10, 6, 0, 6, 16, 16];
[['Tab', 'Ctrl', 'Shift'], ['Q', 'A', 'Z'], ['W', 'S', 'X'], ['E', 'D', 'C'], ['R', 'F', 'V'], ['T', 'G', 'B']].forEach((ks, c) => ks.forEach((id, r) => P.push({ id, side: 'Left', row: r + 1, col: c + 1, x: -370 + c * 60, y: -60 + r * 60 + stagL[c], w: 54 })));
[['Y', 'H', 'N'], ['U', 'J', 'M'], ['I', 'K', ','], ['O', 'L', '.'], ['P', ';', '/'], ['Bksp', "'", 'Esc']].forEach((ks, c) => ks.forEach((id, r) => P.push({ id, side: 'Right', row: r + 1, col: c + 1, x: 70 + c * 60, y: -60 + r * 60 + stagR[c], w: 54 })));
[['Alt', -190, 54, 4], ['Lower', -130, 54, 5], ['Space', -56, 84, 6]].forEach(([id, x, w, col]) => P.push({ id, side: 'Left', row: 4, col, x, y: 142, w }));
[['Enter', 56, 84, 1], ['Raise', 130, 54, 2], ['GUI', 190, 54, 3]].forEach(([id, x, w, col]) => P.push({ id, side: 'Right', row: 4, col, x, y: 142, w }));
const PAD = { x: 250, y: -215, w: 180, h: 118 };
const KNOBS = [{ id: 'left', label: 'Left knob', x: -362, y: 150 }, { id: 'right', label: 'Right knob', x: 362, y: 150 }];
const selPos = P.find((k) => k.id === sel) || P[0];

// ---- camera: fit the board to the stage (stage size comes from a ResizeObserver) ----
const stW = st.sw || 1200, stH = st.sh || 560;
const narrow = stW < 820;
const fit = Math.max(0.42, Math.min(stW * 0.9 / 840, stH * 0.82 / 370));
const baseScale = fit * { S: 0.8, M: 0.9, L: 1 }[size];
const keyWin = isKeymap && win && !st.winClosing;
const secWin = !isKeymap && !secHide && !st.winClosing;
const winW = Math.min(480, stW - 32);
const wideW = isMacros ? Math.min(640, stW * 0.54, stW - 32) : Math.min(520, stW * 0.46, stW - 32);
const sideW = Math.max(240, stW - wideW - 48);
const leftPct = keyWin && !narrow ? Math.max(18, (stW - winW - 32) / 2 / stW * 100) : 50;
const sideLeft = narrow ? 50 : (stW - wideW - 32) / 2 / stW * 100;
const sideTop = narrow ? 20 : 52;
const sideFit = narrow ? Math.min(stW * 0.9 / 840, stH * 0.34 / 370) : Math.max(0.36, Math.min(sideW * 0.94 / 840, stH * 0.8 / 370));
const zoomS = Math.min(1.4, Math.max(0.6, fit * (keyWin && !narrow ? 0.95 : 1.3)));
const padZoom = narrow ? Math.min(stW * 0.5 / PAD.w, stH * 0.24 / PAD.h) : Math.min(1.8, sideW * 0.42 / PAD.w, stH * 0.36 / PAD.h);
const padFocus = isPointing && (psub === 'touchpad' || (psub === 'timing' && tmTab === 'swipe'));
let cam = { s: baseScale, a: 44, x: 0, y: -40, left: 50, top: 52 };
if (isKeys && !isKeymap) cam = { s: secWin ? sideFit : baseScale, a: 40, x: 0, y: -40, left: secWin ? sideLeft : 50, top: secWin ? sideTop : 52 };
if (isKeymap && view === 'focus') cam = { s: zoomS, a: 34, x: selPos.x, y: selPos.y - 6, left: leftPct, top: keyWin && narrow ? 22 : 54 };
if (isPointing) {
if (padFocus) cam = secWin ? { s: padZoom, a: 30, x: PAD.x - 20, y: PAD.y + 40, left: sideLeft, top: sideTop } : { s: padZoom * 0.85, a: 32, x: PAD.x - 20, y: PAD.y + 40, left: 50, top: 50 };
else if (psub === 'knobs') cam = { s: (secWin ? sideFit : baseScale) * 0.98, a: 52, x: 0, y: 30, left: secWin ? sideLeft : 50, top: secWin ? sideTop : 52 };
else cam = { s: secWin ? sideFit : baseScale, a: 40, x: 0, y: -40, left: secWin ? sideLeft : 50, top: secWin ? sideTop : 52 };
}
if (isLighting) cam = { s: secWin ? sideFit : baseScale, a: 38, x: 0, y: -50, left: secWin ? sideLeft : 50, top: secWin ? sideTop : 52 };

// ---- lighting model ----
const viewLayer = isPointing && psub === 'mouse' ? ml.layer : (isCombos ? 0 : layer);
const lkind = fxKind(lt.effect);
const hueDeg = Math.round(lt.hue / 255 * 360);
const satPct = Math.round(lt.sat / 255 * 100);
const lightC = (h) => 'hsl(' + ((h % 360) + 360) % 360 + ', ' + satPct + '%, ' + (50 + (1 - lt.sat / 255) * 45).toFixed(0) + '%)';
const ledIdx = lt.led[layer] || 0;
const layerC = ledIdx > 1 ? LED[ledIdx][2] : null;
const lightsOut = lkind === 'off' || ledIdx === 1;
const effKind = layerC ? 'static' : lkind;
const ledA = 0.3 + 0.7 * lt.bright / 255;
const guideOn = lt.guide === 'Always' || (lt.guide === 'While a layer is on' && layer > 0);
const MODK = ['Ctrl', 'Shift', 'Alt', 'GUI'];
const kindColor = (lbl) => (MODK.indexOf(lbl) >= 0 ? '#3e63dd' : (/^(Lower|Raise)$|^MO\(|^LT/.test(lbl) ? '#d6409f' : (/^Mouse/.test(lbl) ? '#f5d90a' : (/Vol|Mute|Play/.test(lbl) ? '#30a46c' : (['Tab', 'Bksp', 'Esc', 'Enter', 'Space'].indexOf(lbl) >= 0 || lbl.length > 3 ? '#05a2c2' : '#ffffff')))));
const touch = st.touch || null;
const glowR = lt.size / 13 * 60;
const glowC = lt.glowColor ? (GLOW.find((g) => g[0] === lt.glowColor) || GLOW[0])[2] : null;
const effColor = (k, i) => {
if (layerC) return layerC;
if (lt.effect === 'Alphas/mods') return MODK.concat(['Tab', 'Esc', 'Bksp', 'Enter', 'Space', 'Lower', 'Raise']).indexOf(k.id) >= 0 ? lightC(hueDeg + 150) : lightC(hueDeg);
if (lkind === 'grad') {
if (/up-down|val/.test(lt.effect)) return lightC(hueDeg + (k.y + 80) * 0.35);
if (/Pinwheel|Spiral/.test(lt.effect)) return lightC(hueDeg + Math.atan2(k.y - 40, k.x) * 57.3 * 0.5);
return lightC(hueDeg + (k.x + 400) * 0.16);
}
if (lkind === 'wave') return lightC(hueDeg + (k.x + 400) * 0.45);
if (lt.effect === 'Digital rain') return 'hsl(140, 80%, 55%)';
if (lt.effect === 'Typing heatmap') return lightC(((i * 37) % 11) * 6);
return lightC(hueDeg);
};
const spd = (0.8 + (255 - lt.speed) / 255 * 5.2);
const lightOf = (k, i, lbl) => {
if (!isLighting || lightsOut) return null;
const held = (layer === 1 && k.id === 'Lower') || (layer === 2 && k.id === 'Raise');
let c = effColor(k, i);
let a = ledA;
let cls = 'lit';
if (guideOn && lbl === '▽' && !held) { if (!lt.dim) return null; cls = 'dimk'; a = lt.dim / 100; }
else if (guideOn && lt.colorMode === 'Color by kind') c = kindColor(lbl);
if (touch && lt.glow) {
const d = Math.hypot(k.x - touch.x, k.y - touch.y);
if (d < glowR) { c = glowC || c; a = Math.min(1, 0.55 + ledA * (0.9 - d / glowR * 0.5)); cls = 'lit touch'; } else a = a * 0.3;
}
let dly = 0;
if (effKind === 'wave') dly = -((k.x + 400) / 800) * spd;
if (effKind === 'twinkle') dly = -(((i * 37) % 17) / 17) * spd;
return { c, a, cls, dly };
};

const caps = P.map((k, i) => {
const lbl = labelOf(viewLayer, k.id);
const hold = holdOf(viewLayer, k.id);
const on = (isKeymap && k.id === sel && !testing && (win || view === 'focus')) || (isCombos && !!ced && ced.keys.indexOf(k.id) >= 0);
const L = lightOf(k, i, lbl);
let hl = '', hlc = '';
if (isMacros && /^M\d+$/.test(lbl)) { hl = lbl === 'M' + msel ? 'hl hl2' : 'hl'; hlc = lbl === 'M' + msel ? '#3d6fd6' : '#a3a6ad'; }
if (isCombos && !ced && k.id in cOf) { const sl = chov >= 0 && cbs.some((c) => c.slot === chov && c.keys.indexOf(k.id) >= 0) ? chov : cOf[k.id]; hl = sl === chov ? 'hl hl2' : 'hl'; hlc = CCOL[sl % CCOL.length]; }
return {
label: disp(lbl), on, changed: isKeys && isChanged(layer, k.id) && !testing, hasHold: !!hold && !testing && !isLighting, hold: hold ? holdShort[hold] : '',
cls: (testing && tested[k.id] ? 'ok' : (on ? 'sel' : (lbl === '▽' ? 'trans' : ''))) + (L ? ' ' + L.cls : '') + (hl && !on ? ' ' + hl : ''),
style: 'left: ' + (k.x - k.w / 2) + 'px; top: ' + (k.y - 27) + 'px; width: ' + k.w + 'px; font-size: ' + (lbl.length > 6 ? 9 : (lbl.length > 4 ? 10 : 12)) + 'px; --i: ' + i + (hlc ? '; --hl: ' + hlc : '') + (L ? '; --led: ' + L.c + '; --ledA: ' + L.a.toFixed(2) + '; --dly: ' + L.dly.toFixed(2) + 's' : ''),
holdStyle: 'position: absolute; left: 0; right: 0; bottom: 4px; font-size: 9px; font-weight: 700; color: ' + (on ? '#b8bac0' : '#6b6e75'),
aria: (lbl === '▽' ? 'Transparent' : disp(lbl)) + ' key',
pick: () => {
if (isLighting) return;
if (isPointing) { go('keys', { layer: viewLayer, sel: k.id, win: true, view: 'focus', wtab: 'key', query: '', n: n + 1 }); return; }
if (testing) { this.setState({ tested: Object.assign({}, tested, { [k.id]: true }) }); return; }
if (isMacros) { commit(setIn(A, layer, k.id, 'M' + msel), H, { sel: k.id }); this.showToast(disp(lbl) + ' → M' + msel + ' を割り当てました（未反映）'); return; }
if (isCombos) { if (cNext < 0 && !ced) { this.showToast('空いているスロットがありません'); return; } cToggleKey(k.id); return; }
if (isLayersSub) { this.setState({ ksub: 'keymap', sel: k.id, win: true, winClosing: false, view: 'focus', wtab: 'key', query: '', n: n + 1, paneN: paneN + 1 }); return; }
openWin({ sel: k.id, n: n + 1 });
}
};
});

// ---- keymap window (Keys) ----
const rawSel = labelOf(layer, sel);
const selHoldV = holdOf(layer, sel);
const tapCode = codeOf(rawSel);
const selCode = !selHoldV ? tapCode : (/^\d$/.test(selHoldV) ? 'LT(' + selHoldV + ', ' + tapCode + ')' : (selHoldV === 'SH' ? 'SH_T(' + tapCode + ')' : selHoldV + '_T(' + tapCode + ')'));
let selDesc = KEY_DESC[tapCode] || (rawSel === '▽' ? KEY_DESC['_______'] : '') || 'このキーを送信します。';
if (tapCode.indexOf('MO(') === 0) selDesc = '押している間だけレイヤー ' + tapCode.slice(3, -1) + ' を有効にし、離すと元に戻ります。';
else if (/^(LCTL|LSFT|LALT|LGUI|RCTL|RSFT|RALT|RGUI)\(/.test(tapCode)) selDesc = '修飾キーを押しながらキーを送信します。';
else if (/^0x/.test(tapCode)) selDesc = '16進数で直接指定したキーコードです。';
if (selHoldV) selDesc = 'タップで ' + disp(rawSel) + '、長押しで ' + holdShort[selHoldV] + ' として働きます。';
const before = has(W, layer, sel) ? W[layer][sel] : baseOf(layer, sel);

const q = query.trim().toLowerCase();
const hov = st.hov || null;
const tile = (label, code, i) => ({
label: disp(label) || '(none)', code, tip: code + ' — ' + (KEY_DESC[code] || ''),
style: 'animation-delay: ' + (Math.min(i, 40) * 0.01).toFixed(2) + 's',
hover: () => { if (!st.hov || st.hov.code !== code) this.setState({ hov: { label: disp(label) || '(none)', code, desc: KEY_DESC[code] || '' }, hovN: (st.hovN || 0) + 1 }); },
unhover: () => this.setState({ hov: null }),
pick: () => { assign(label, code); closeWin(); this.showToast(disp(rawSel) + ' → ' + (disp(label) || '(none)') + ' を割り当てました（未反映）'); }
});
let groups;
let shown = 0;
if (q) {
const found = [];
KEYCODE_CATS.forEach(([c, subs]) => subs.forEach(([sid, title, keys]) => keys.forEach(([l, code]) => { if (l.toLowerCase().indexOf(q) >= 0 || code.toLowerCase().indexOf(q) >= 0 || (KEY_DESC[code] || '').indexOf(query.trim()) >= 0) found.push([l, code, c]); })));
shown = found.length;
const byCat = {};
found.slice(0, 160).forEach(([l, code, c]) => { (byCat[c] = byCat[c] || []).push([l, code]); });
groups = Object.keys(byCat).map((c) => ({ title: c.toUpperCase(), keys: byCat[c].map(([l, code], i) => tile(l, code, i)) }));
} else {
const entry = KEYCODE_CATS.find((x) => x[0] === cat) || KEYCODE_CATS[0];
groups = entry[1].map(([sid, title, keys]) => { shown += keys.length; return { title, keys: keys.map(([l, code], i) => tile(l, code, i)) }; });
}
const total = KEYCODE_CATS.reduce((s2, [c, subs]) => s2 + subs.reduce((s3, x) => s3 + x[2].length, 0), 0);
const baseKey = (custom['__base_' + rawSel] || rawSel);
const isBasic = /^KC_/.test(codeOf(baseKey)) && CATOF[baseKey] === 'Basic';
const modState = st.modState || {};
const side = st.side || 'L';
const MODS = [['Ctrl', 'CTL'], ['Shift', 'SFT'], ['Alt', 'ALT'], ['Win/Cmd', 'GUI']];
const applyMods = (ms, sd) => {
const on = MODS.filter(([l, m]) => ms[m]);
if (!on.length) { assign(baseKey, codeOf(baseKey), { modState: ms, side: sd }); return; }
const lbl = on.map(([l]) => l.split('/')[0]).join('+') + '+' + baseKey;
let code = codeOf(baseKey);
on.slice().reverse().forEach(([l, m]) => { code = sd + m + '(' + code + ')'; });
const c = Object.assign({}, custom, { [lbl]: code, ['__base_' + lbl]: baseKey });
commit(setIn(A, layer, sel, lbl), H, { custom: c, modState: ms, side: sd });
};
const hex = st.hex || '';
const hexOk = /^[0-9a-fA-F]{1,4}$/.test(hex);
const hexVal = hexOk ? parseInt(hex, 16) : 0;
const presets = PRESETS.filter((p) => (os === 'mac' ? p[1] : p[2])).map(([label, m, w]) => { const combo = os === 'mac' ? m : w; return { label, combo, pick: () => { assign(combo, label + ' (' + combo + ')'); closeWin(); this.showToast(disp(rawSel) + ' → ' + combo + ' を割り当てました（未反映）'); } }; });

const write = () => {
if (!pending || writing) return;
const count = pending;
this.setState({ writing: true, open: null });
this.later(() => {
const cur = this.state || {};
const curM = cur.macros || macros;
const cA = cur.A || {}, cH = cur.H || {};
const nW = Object.assign({}, cur.W || {}), nWH = Object.assign({}, cur.WH || {});
LIDX.forEach((l) => { nW[l] = Object.assign({}, nW[l] || {}, cA[l] || {}); nWH[l] = Object.assign({}, nWH[l] || {}, cH[l] || {}); });
this.setState({ writing: false, W: nW, WH: nWH, A: {}, H: {}, startDone: true, past: [], future: [], msaved: curM.map((m) => JSON.stringify(m)), lremoved: 0 });
this.showToast(count + '件の変更をキーボードに反映しました');
}, 1500);
};
const selChanged = has(A, layer, sel) || has(H, layer, sel);

// ---- settings window panes (Pointing / Lighting) ----
const grid2 = 'display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; align-items: start';
const col1 = 'display: flex; flex-direction: column; gap: 12px';
const wide = (r) => Object.assign({}, r, { dim: (r.dim || '') + '; grid-column: 1 / -1' });
const pd = tp.precision;
const pdNote = pd ? [wide(R.note('高精度タッチパッドモード中は、この項目は Windows のタッチパッド設定に従います（Device タブで切り替え）。'))] : [];
const zone = ZONES.find((z) => z[0] === tp.zone) || ZONES[1];
const zv = tp.zones[zone[0]] || 'None';
const zpre = EDGE_P.find((p) => p[0] === zv);
const zSide = zone[0] === 'left' || zone[0] === 'right';
const zDirs = zSide ? ['↓', '↑'] : ['←', '→'];
const zRev = !!tp.rev[zone[0]];
const zPair = zpre ? (zRev ? [zpre[2], zpre[1]] : [zpre[1], zpre[2]]) : null;
const zAssigned = (id) => !!tp.zones[id] && tp.zones[id] !== 'None';
const setZone = (x) => setTp({ zones: Object.assign({}, tp.zones, { [zone[0]]: x }) });
const pickZone = (id) => this.setState({ tp: Object.assign({}, tp, { zone: id }) });
const TP_TABS = [['pointer', 'Pointer'], ['tap', 'Tap'], ['scroll', 'Scroll'], ['edges', 'Edges'], ['sensor', 'Sensor'], ['device', 'Device']];
const tpPane = {
pointer: card('Pointer', 'カーソルの速さと加速です。値を変えるとすぐにキーボードへ保存されます。', pdNote.concat([
R.slider('Speed (CPI)', tp.cpi, 100, 3200, 50, tp.cpi + ' cpi', '大きいほど少ない指の移動でカーソルが動きます', TP('cpi'), pd),
R.sw('Acceleration', tp.accel, '速く動かすほど遠くまで動きます', TP('accel'), pd),
R.slider('Slow speed', tp.slow, 3, 10, 1, '×' + (tp.slow / 10).toFixed(1), 'ゆっくり動かしたときの速さ（加速オン時）', TP('slow'), pd || !tp.accel),
R.slider('Fast speed', tp.fast, 10, 50, 1, '×' + (tp.fast / 10).toFixed(1), '素早く動かしたときの速さ（加速オン時）', TP('fast'), pd || !tp.accel),
R.slider('Precision mode speed', tp.prec, 10, 90, 1, tp.prec + '%', 'Sniping キーを押している間のカーソル速度', TP('prec'))
]), { rowsStyle: grid2 }),
tap: card('Tap & gestures', 'タップをクリックとして送るかどうかと、その判定時間です。', pdNote.concat([
R.sw('Tap to click', tp.tap, '1 本指タップで左クリック', TP('tap'), pd),
R.sw('Two-finger right click', tp.two, '2 本指タップで右クリック（マルチタッチ対応センサーのみ）', TP('two'), pd),
R.sw('Tap and drag', tp.drag, 'ダブルタップして指を置いたまま動かすとドラッグ', TP('drag'), pd),
R.slider('Tap term', tp.tapTerm, 100, 400, 10, tp.tapTerm + ' ms', 'これより短い接触をタップとみなします', TP('tapTerm'), pd)
]), { rowsStyle: grid2 }),
scroll: card('Scroll', 'スクロールの方式と速さ、指を離したあとの慣性です。', pdNote.concat([
R.seg('Scroll method', [['Two finger', 'Two-finger'], ['Circular', 'Circle'], ['Edge', 'Edge']], tp.scroll, 'Circle は円を描くとスクロール', TP('scroll'), pd),
R.slider('Scroll speed', tp.sSpeed, 1, 32, 1, '×' + (8 / tp.sSpeed).toFixed(2), '小さいほど速くスクロール（分周比）', TP('sSpeed'), pd),
R.sw('Natural scroll', tp.natural, 'スクロール方向を反転します', TP('natural'), pd),
R.sw('Horizontal scroll', tp.horiz, '左右方向のスクロールを有効にします', TP('horiz'), pd),
R.sw('Glide (inertia)', tp.glide, '勢いよく離すと減速しながら続きます', TP('glide'), pd),
R.slider('Momentum length', tp.momentum, 5, 60, 1, (tp.momentum / 100).toFixed(2) + ' s', '慣性スクロールが続く長さ', TP('momentum'), pd || !tp.glide)
]), { rowsStyle: grid2 }),
edges: card('Edge sliders and corner taps', '縁をなぞると音量やスクロールを操作でき、四隅のタップにはショートカットを割り当てられます。3D のタッチパッド上の縁・角を押しても選べます。', [
wide(R.seg('Zone', ZONES.map(([id, l, kind, short]) => [id, short + (zAssigned(id) ? ' •' : '')]), zone[0], '', pickZone)),
zone[2] === 'edge'
? R.select(zone[1], [['Edge slider', ['None'].concat(EDGE_P.map((p) => p[0]))]], zv, zPair ? zDirs[0] + ' ' + zPair[0] + '　' + zDirs[1] + ' ' + zPair[1] : '割り当てなし（触れるとカーソルが動きます）', setZone)
: R.select(zone[1], [['Corner tap', CORNERS]], zv, zv === 'None' ? '割り当てなし' : 'Tap → ' + zv, setZone),
zone[2] === 'edge' ? R.sw('Reverse', zRev, '向きを入れ替えます', () => setTp({ rev: Object.assign({}, tp.rev, { [zone[0]]: !zRev }) }), !zpre) : R.note('指を動かさずに 0.3 秒以内に離したときだけ送ります。'),
R.slider('Edge width', tp.edgeWidth, 5, 30, 1, tp.edgeWidth + '%', '各辺からどこまでを縁とみなすか', TP('edgeWidth')),
R.slider('Step distance', tp.step, 2, 25, 1, tp.step + '%', '1 回送るまでに動かす距離', TP('step'))
], { rowsStyle: grid2 }),
sensor: card('Sensor', 'タッチセンサーの反応を調整します。誤反応が多い・反応が鈍いときに変更してください。', [
R.seg('Sensor sensitivity', ['1x', '2x', '3x', '4x'], tp.sens, '厚いカバーを使う場合は高めに', TP('sens')),
R.slider('Touch threshold', tp.thr, 10, 80, 1, String(tp.thr), '小さいほど軽いタッチで反応します', TP('thr')),
R.slider('Movement to start', tp.startMove, 0, 40, 1, tp.startMove + ' (≈' + (tp.startMove / 100).toFixed(2) + ' mm)', '大きいとタップ時にカーソルがずれにくい', TP('startMove')),
R.slider('Movement per update', tp.upd, 0, 40, 1, tp.upd + ' (≈' + (tp.upd / 100).toFixed(2) + ' mm)', '大きいほど指の小さなぶれを抑えます', TP('upd'))
], { rowsStyle: grid2 }),
device: card('Device', '取り付け向き、なめらか補間、パソコンからの見え方です。', [
wide(R.seg('Rotation', [[0, '0°'], [90, '90°'], [180, '180°'], [270, '270°']], tp.rot, 'センサーの取り付け向き（3D のタッチパッドの矢印で確認できます）', TP('rot'))),
R.sw('Invert X axis', tp.invX, '左右の動きを逆にします', TP('invX')),
R.sw('Invert Y axis', tp.invY, '上下の動きを逆にします', TP('invY')),
R.sw('Smooth movement', tp.smoothMove, '報告の間を補間して滑らかに動かします（約 3ms 遅延）', TP('smoothMove')),
R.sw('Windows precision touchpad', tp.precision, 'オンにすると速度・タップ・スクロールは Windows 側の設定に従います', TP('precision'))
], { rowsStyle: grid2 })
};
const mlOff = !ml.enabled;
const mlPane = {
ov: card('Auto mouse layer', 'タッチパッドを操作している間だけ、指定したレイヤーを自動で有効にします。左の 3D キーボードは対象レイヤーの割り当てを表示しています。', [
wide(R.sw('Enable auto mouse layer', ml.enabled, 'オフにすると自動で切り替わらなくなります', ML('enabled'))),
wide(R.seg('Target layer', [[1, 'Layer 1'], [2, 'Layer 2'], [3, 'Layer 3']], ml.layer, 'クリック類は左手側に置くのがおすすめです', ML('layer'), mlOff)),
wide(R.note('① 指を動かす（移動量 ' + ml.act + ' 以上）→ ② Layer ' + ml.layer + ' が ON → ③ ' + ml.release + ' ms 操作なし' + (ml.nonMouse ? '、またはマウス以外のキー' : '') + ' → ④ 元のレイヤーに戻る')),
R.button('このレイヤーのキーを編集', () => go('keys', { layer: ml.layer }))
], { rowsStyle: grid2 }),
cond: card('Switching conditions', 'マウスレイヤーが ON / OFF になる条件です。', [
R.slider('Activation movement', ml.act, 1, 50, 1, String(ml.act), '小さいほど少し触れただけで切り替わります', ML('act'), mlOff),
R.slider('Time until release', ml.release, 200, 3000, 50, ml.release + ' ms', '最後の操作からこの時間で元に戻ります', ML('release'), mlOff),
R.slider('Delay after typing', ml.delay, 0, 1000, 50, ml.delay + ' ms', 'キー入力の直後はこの間切り替わりません', ML('delay'), mlOff),
R.slider('Debounce', ml.debounce, 0, 100, 5, ml.debounce + ' ms', 'クリック直後の誤った解除を防ぎます', ML('debounce'), mlOff),
R.sw('Release on non-mouse keys', ml.nonMouse, '文字キーを押すとすぐ戻ります', ML('nonMouse'), mlOff),
R.sw('Keep while modifiers held', ml.keepMods, 'Shift / Ctrl + クリックを使いやすくします', ML('keepMods'), mlOff)
], { rowsStyle: grid2 })
};
const tmPane = {
hold: card('Tap-hold keys', 'すべてのレイヤータップ（LT）・モッドタップ（MT）キーに適用されます。左のキーボードの小さな表示が長押しの動作です。', [
wide(R.slider('Tapping term', tm.term, 100, 400, 5, tm.term + ' ms', 'これより長く押すとホールド（レイヤー切替・修飾キー）と判定します', TM('term'))),
R.seg('Presets (ms)', [150, 175, 200, 250, 300].map((t) => [t, String(t)]), tm.term, '', TM('term')),
R.seg('Hold decision', [['Hold preferred', 'Hold'], ['Balanced', 'Balanced'], ['Tap preferred', 'Tap']], tm.decision, '', TM('decision')),
wide(R.note('ホールド優先：別のキーを押した時点でホールド。バランス：押している間に別のキーを押して離すとホールド。タップ優先：判定時間が過ぎるまではタップ。'))
], { rowsStyle: grid2 }),
swipe: card('3-finger swipe', 'タッチパッドを 3 本指でスワイプしたときに送るキーです（マルチタッチ対応センサーのみ）。', [
R.select('Swipe left', SWIPE, tm.left, '', TM('left')),
R.select('Swipe right', SWIPE, tm.right, '', TM('right')),
R.select('Swipe up', SWIPE, tm.up, '', TM('up')),
R.select('Swipe down', SWIPE, tm.down, '', TM('down'))
], { rowsStyle: grid2 })
};
const angle = st.angle || { left: 0, right: 0 };
const knobRows = [];
const knobInfo = KNOBS.map((K) => {
const cur = kn[K.id];
const p = EDGE_P.find((x) => x[0] === cur.p);
const pair = p ? (cur.rev ? [p[2], p[1]] : [p[1], p[2]]) : ['—', '—'];
return { K, cur, p, pair };
});
knobInfo.forEach(({ K, cur }) => knobRows.push(R.select(K.label + ' · Push and turn', [['Knob', ['None'].concat(EDGE_P.map((x) => x[0]))]], cur.p, '', (x) => setKn({ [K.id]: Object.assign({}, cur, { p: x }) }))));
knobInfo.forEach(({ K, cur, p }) => knobRows.push(R.sw('Reverse', cur.rev, '回す向きを入れ替えます', () => setKn({ [K.id]: Object.assign({}, cur, { rev: !cur.rev }) }), !p)));
knobInfo.forEach(({ pair }) => knobRows.push(R.note('↺ ' + pair[0] + '　/　↻ ' + pair[1])));
knobInfo.forEach(({ K, pair }) => knobRows.push(R.seg('Try', [[-1, '↺ Turn'], [1, '↻ Turn']], null, '3D のノブが回ります', (dir) => { const a2 = (this.state && this.state.angle) || angle; this.setState({ knobSel: K.id, angle: Object.assign({}, a2, { [K.id]: (a2[K.id] || 0) + dir * 30 }) }); this.showToast(K.label + '：' + (dir < 0 ? '↺ ' + pair[0] : '↻ ' + pair[1])); })));
const knPane = card('Knobs', 'ノブを押しながら回したときの動作です。押さずに回したときは Keymap でノブに割り当てたキーが送られます。', knobRows, { rowsStyle: grid2 });
const LT_SUBS = [['eff', 'Effects'], ['led', 'Layer colors'], ['guide', 'Key guide'], ['glow', 'Touch glow']];
const guideOff = lt.guide === 'Guide off';
const ltPane = {
eff: card('Effect', 'キーボードの LED の光り方です。左の 3D キーボードにそのまま反映されます。', [
wide(R.select('Effect', [['RGB Matrix effects', EFFECTS]], lt.effect, FX_NOTE[lkind], LT('effect'))),
R.slider('Brightness', lt.bright, 0, 255, 1, Math.round(lt.bright / 255 * 100) + '%', '', LT('bright'), lightsOut),
R.slider('Speed', lt.speed, 0, 255, 1, Math.round(lt.speed / 255 * 100) + '%', '動きのあるエフェクトの速さ', LT('speed'), lightsOut),
R.slider('Hue', lt.hue, 0, 255, 1, hueDeg + '°', '', LT('hue'), lightsOut),
R.slider('Saturation', lt.sat, 0, 255, 1, satPct + '%', '0% で白になります', LT('sat'), lightsOut)
].concat(layerC ? [wide(R.note('Layer ' + layer + ' には LED 色（' + LED[ledIdx][1] + '）が設定されているため、エフェクトより優先されています。Layer colors で「Lighting effect」に戻せます。'))] : []), { rowsStyle: grid2 }),
led: card('LED color per layer', 'レイヤーが有効な間、LED をその色で点灯します。色を選ぶとそのレイヤーの光り方を表示します。', LAYERS.map((L, i) => R.swatches('L' + i + ' ' + L.name, LED, lt.led[i] || 0, '', (x) => { const led = lt.led.slice(); led[i] = x; setLt({ led }); this.setState({ layer: i }); })), { rowsStyle: col1 }),
guide: card('Assigned keys only', '有効なレイヤーで割り当てのあるキーだけを光らせ、透過（▽）のキーは消灯します。左上でレイヤーを切り替えて確認できます。', [
wide(R.seg('When to show', [['Guide off', 'Off'], ['While a layer is on', 'While a layer is on'], ['Always', 'Always']], lt.guide, '「While a layer is on」ではベースレイヤーは通常の光り方です', LT('guide'))),
R.seg('Color of the assigned keys', [['Keep the colors', 'Keep'], ['Color by kind', 'By kind']], lt.colorMode, '種類別：修飾キー青・レイヤーキー桃・マウス黄・その他シアン', LT('colorMode'), guideOff),
R.slider('Unassigned keys', lt.dim, 0, 50, 5, lt.dim + '%', '割り当てのないキーの明るさ。0% で消灯', LT('dim'), guideOff),
wide(R.note('レイヤーを切り替えるために押しているキーは光ったままです。'))
], { rowsStyle: grid2, hasBadge: true, badge: 'r20+' }),
glow: card('Touch glow', 'タッチパッドに触れている間、キーボード上の対応する位置のキーが光ります。3D のタッチパッドの上でカーソルを動かして試せます。', [
wide(R.sw('Light the touched position', lt.glow, '明るさはライティングの明るさに従います', LT('glow'))),
wide(R.swatches('Glow color', GLOW, lt.glowColor, '', LT('glowColor'), !lt.glow)),
R.slider('Glow size', lt.size, 10, 60, 1, '約 ' + (lt.size / 13).toFixed(1) + ' キー', '指の位置から光らせる半径', LT('size'), !lt.glow),
R.slider('Fade-out time', lt.fade, 0, 200, 5, (lt.fade / 100).toFixed(2) + ' s', '指を離してから消えるまで', LT('fade'), !lt.glow)
], { rowsStyle: grid2, hasBadge: true, badge: 'r18+' })
};
let inner = null, paneCard = null, secTitle = '', secSub = '';
if (isPointing) {
if (psub === 'touchpad') { inner = ['tpTab', TP_TABS, tpTab]; paneCard = tpPane[tpTab] || tpPane.pointer; secTitle = 'Touchpad'; secSub = '右手側キーボードの上部に取り付けたタッチパッドの設定です。'; }
if (psub === 'mouse') { inner = ['mlTab', [['ov', 'Overview'], ['cond', 'Conditions']], mlTab]; paneCard = mlPane[mlTab] || mlPane.ov; secTitle = 'Mouse layer'; secSub = 'タッチパッド操作中に自動で有効になるレイヤーです。'; }
if (psub === 'timing') { inner = ['tmTab', [['hold', 'Tap-hold'], ['swipe', '3-finger swipe']], tmTab]; paneCard = tmPane[tmTab] || tmPane.hold; secTitle = 'Timing & gestures'; secSub = 'タップ/ホールドの判定と 3 本指スワイプです。'; }
if (psub === 'knobs') { paneCard = knPane; secTitle = 'Knobs'; secSub = '3D のノブを押すと選べます。Try で回して確認できます。'; }
}
if (isMacros) { secTitle = 'Macros · M' + msel; secSub = mRemaining + ' bytes 残り（全マクロ共通 ' + MBUF + ' バイト）。3D のキーを押すと M' + msel + ' を割り当てます。'; }
if (isCombos) { secTitle = ced ? 'Combos · ' + (ced.isNew ? 'New' : 'Edit') + ' (Slot ' + ced.slot + ')' : 'Combos'; secSub = 'コンボ ' + cbs.length + ' / ' + CSLOTS + ' 使用中。3D のキーを押すと新しいコンボを作れます。'; }
if (isLayersSub) { secTitle = 'Layers'; secSub = '名前と色は画面の表示に使います。'; }
if (isLighting) { paneCard = ltPane[lsub] || ltPane.eff; secTitle = (LT_SUBS.find((x) => x[0] === lsub) || LT_SUBS[0])[1]; secSub = 'Layer ' + layer + ' · ' + LAY(layer).name + ' が有効なときの光り方を表示しています。'; }
const pickInner = (key, id) => () => this.setState({ [key]: id, paneN: paneN + 1 });

const resetSec = () => {
if (isLighting) { setLt(LTD); this.showToast('Lighting を既定値に戻しました'); return; }
if (psub === 'touchpad') setTp(TPD);
if (psub === 'mouse') setMl(MLD);
if (psub === 'timing') setTm(TMD);
if (psub === 'knobs') setKn(KND);
this.showToast(secTitle + ' を既定値に戻しました');
};

// ---- touchpad on the 3D board ----
const ew = tp.edgeWidth;
const geom = { left: 'left: 0; top: 18%; bottom: 18%; width: ' + ew + '%', right: 'right: 0; top: 18%; bottom: 18%; width: ' + ew + '%', top: 'top: 0; left: 18%; right: 18%; height: ' + ew + '%', bottom: 'bottom: 0; left: 18%; right: 18%; height: ' + ew + '%', tl: 'left: 0; top: 0; width: 18%; height: 18%', tr: 'right: 0; top: 0; width: 18%; height: 18%', bl: 'left: 0; bottom: 0; width: 18%; height: 18%', br: 'right: 0; bottom: 0; width: 18%; height: 18%' };
const padZonesOn = isPointing && psub === 'touchpad' && tpTab === 'edges';
const padTouchOn = isLighting && lt.glow && !lightsOut;
const padMove = (e) => {
if (!padTouchOn) return;
const r = e.currentTarget.getBoundingClientRect();
const fx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
const fy = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
this._touch = { x: -400 + fx * 800, y: -75 + fy * 250, fx, fy };
if (!this._traf) this._traf = requestAnimationFrame(() => { this._traf = 0; this.setState({ touch: this._touch }); });
};
const glowOn = isLighting && lsub === 'glow';
const hintText = isMacros ? 'キーを押すと M' + msel + ' を割り当てます（青枠はマクロのキー）' : (isCombos ? (ced ? 'キーを押してトリガーを選びます（2〜4 個）' : 'キーを押すと、そのキーから新しいコンボを作ります') : (isLayersSub ? 'Layer ' + layer + ' · ' + LAY(layer).name + ' を表示中。キーを押すとそのキーを編集します' : (isKeys ? 'キーを押すと設定ウィンドウが開きます' : (isPointing ? (padZonesOn ? 'タッチパッドの縁・角を押して選べます' : (psub === 'knobs' ? 'ノブを押して選べます' : (psub === 'mouse' ? 'キーを押すと Keys に移ってそのキーを編集します' : 'キーを押すと Keys に移ってそのキーを編集します'))) : (lightsOut ? 'ライトは消灯中です' : (padTouchOn && (glowOn || touch) ? 'タッチパッドの上でカーソルを動かすと、対応する位置のキーが光ります' : (lkind === 'react' && !layerC ? 'キーにカーソルを合わせると反応します' : 'Layer ' + layer + ' の光り方を表示中')))))));
const chipAnim = 'animation: ' + (secN % 2 ? 'mx-chip-a' : 'mx-chip-b') + ' 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';

const SUBS = {
keys: [['keymap', 'Keymap'], ['macros', 'Macros'], ['combos', 'Combos'], ['layers', 'Layers']].map(([id, label]) => ({ label, isLink: false, isBtn: true, href: '', cls: ksub === id ? 'cur' : '', ac: ksub === id ? 'page' : 'false', pick: () => { if (ksub !== id) this.setState({ ksub: id, paneN: paneN + 1, secHide: false, winClosing: false, win: false, view: 'overview', hov: null, testing: false, open: null }); } })),
pointing: [['touchpad', 'Touchpad'], ['mouse', 'Mouse layer'], ['timing', 'Timing'], ['knobs', 'Knobs']].map(([id, label]) => ({ label, isLink: false, isBtn: true, href: '', cls: psub === id ? 'cur' : '', ac: psub === id ? 'page' : 'false', pick: () => this.setState({ psub: id, paneN: paneN + 1, secHide: false, winClosing: false }) })),
lighting: LT_SUBS.map(([id, label]) => ({ label, isLink: false, isBtn: true, href: '', cls: lsub === id ? 'cur' : '', ac: lsub === id ? 'page' : 'false', pick: () => this.setState({ lsub: id, paneN: paneN + 1, secHide: false, winClosing: false }) }))
};

return Object.assign(C, {
section, isKeys, isPointing, isLighting, notKeys: !isKeys,
isKeymap, isMacros, isCombos, isLayersSub, showWrite: isKeys && !isCombos,
manageLayers: () => go('keys', { ksub: 'layers' }),
dlgLRemove: open === 'dlg-lremove', doLRemove: lRemoveTop,
mList: macros.map((m, i) => ({
name: 'M' + i, preview: mPreview(m), on: i === msel, dirty: JSON.stringify(m) !== msaved[i],
style: 'position: relative; height: 32px; border: none; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; font-size: 11px; font-weight: 700; transition: background-color 0.25s ease, color 0.25s ease; ' + (i === msel ? 'background: #0e0e10; color: #ffffff' : (m.length ? 'background: rgba(255, 255, 255, 0.9); color: #0e0e10' : 'background: rgba(255, 255, 255, 0.45); color: #8f9197')),
pick: () => this.setState({ msel: i, mtarget: -1, paneN: paneN + 1 })
})),
mSteps, mEmpty: !mSteps0.length, mClear: () => setMacro([], { mtarget: -1 }),
mText, onMText: (e) => this.setState({ mtext: e.target.value }), mNoText: !mText,
mAddText: () => { if (!mText) return; const add = mText.split('').filter((ch) => ch >= ' ' && ch <= '~').map((ch) => ({ kind: 'ascii', keys: [ch], delay: 0 })); setMacro(mSteps0.concat(add), { mtext: '' }); },
mKq: st.mkq || '', onMKq: (e) => this.setState({ mkq: e.target.value }),
mPickTitle: mkq ? 'SEARCH RESULTS' : (mtarget >= 0 ? 'ADD TO THE SELECTED HOLD' : 'COMMON KEYS'),
mPick: mPicks.map(([l, code]) => ({ label: l, code, add: () => mAddKey(l) })),
cNotEditing: !ced, cEditing: !!ced, cUsed: cbs.length + ' / ' + CSLOTS, cNone: !cbs.length,
cList: cbs.map((c) => ({
title: c.keys.join(' + ') + ' → ' + (c.hex ? '0x' + c.hex.padStart(4, '0') : c.out),
meta: (c.term ? c.term + ' ms' : '50 ms (default)') + ' · ' + (c.layers.length ? c.layers.map((l) => 'L' + l).join(', ') : 'All layers') + ' · Slot ' + c.slot,
dot: 'width: 10px; height: 10px; border-radius: 5px; flex: none; background: ' + CCOL[c.slot % CCOL.length],
style: 'padding: 10px 12px; cursor: default; transition: background-color 0.25s ease, box-shadow 0.25s ease; background: ' + (chov === c.slot ? '#ffffff' : 'rgba(255, 255, 255, 0.7)') + '; box-shadow: ' + (chov === c.slot ? '0 0 0 2px ' + CCOL[c.slot % CCOL.length] : 'none'),
hover: () => { if (chov !== c.slot) this.setState({ chov: c.slot }); }, unhover: () => this.setState({ chov: -1 }),
edit: () => this.setState({ ced: Object.assign({ isNew: false }, c, { keys: c.keys.slice(), layers: c.layers.slice(), hex: c.hex || '' }), chov: -1 }),
remove: () => { this.setState({ cbs: cbs.filter((x) => x.slot !== c.slot), chov: -1 }); this.showToast('コンボを削除しました'); }
})),
cEditTitle: ced && ced.isNew ? 'New combo' : 'Edit combo', cSlot: ced ? 'Slot ' + ced.slot : '',
cTrig: ced ? ced.keys.map((k) => ({ label: disp(k), remove: () => cToggleKey(k) })) : [], cTrigEmpty: !!ced && !ced.keys.length,
cGroups: CGROUPS.map(([label, opts]) => ({ label, opts })), cOutSel: ced ? (ced.hex ? '' : ced.out) : '',
onCOut: (e) => this.setState({ ced: Object.assign({}, ced, { out: e.target.value, hex: '' }) }),
cHex: ced ? ced.hex || '' : '', onCHex: (e) => this.setState({ ced: Object.assign({}, ced, { hex: e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 4).toUpperCase() }) }),
cHasOut: !!cOut && !!ced && ced.keys.length > 0, cPreview: ced ? ced.keys.map(disp).join(' + ') + ' → ' + cOut : '',
cTerms: CTERMS.map(([v2, label]) => ({ label, on: !!ced && ced.term === v2, cls: !!ced && ced.term === v2 ? 'on' : '', pick: () => this.setState({ ced: Object.assign({}, ced, { term: v2 }) }) })),
cLayerOpts: LAYERS.map((L, i) => { const on = !!ced && ced.layers.indexOf(i) >= 0; return { label: 'L' + i + ' ' + L.name, on, cls: on ? 'on' : '', pick: () => this.setState({ ced: Object.assign({}, ced, { layers: on ? ced.layers.filter((x) => x !== i) : ced.layers.concat([i]).sort() }) }) }; }),
cBusy: cbusy, cSaveOff: cbusy || !ced || ced.keys.length < 2 || !cOut,
cCancel: () => this.setState({ ced: null }),
cSave: () => {
if (!ced || ced.keys.length < 2 || !cOut) return;
this.setState({ cbusy: true });
this.later(() => {
const item = { slot: ced.slot, keys: ced.keys, out: ced.out, hex: ced.hex, term: ced.term, layers: ced.layers };
const list = ((this.state && this.state.cbs) || cbs).filter((c) => c.slot !== ced.slot).concat([item]).sort((a, b) => a.slot - b.slot);
this.setState({ cbs: list, ced: null, cbusy: false });
this.showToast('コンボをキーボードに保存しました');
}, 900);
},
cAdd: () => { if (ced || cNext < 0) return; cStart([]); }, cAddOff: !!ced || cNext < 0, cAddCls: ced || cNext < 0 ? 'idle' : '',
lCount: lyrs.length + ' / ' + LMAX + ' レイヤー表示中（ファームウェアは ' + LMAX + ' レイヤー）',
lAddOff: lyrs.length >= LMAX, lAddTitle: lyrs.length >= LMAX ? 'ファームウェアにこれ以上のレイヤーはありません' : 'レイヤーを追加',
lAdd: () => { if (lyrs.length >= LMAX) return; const i = lyrs.length; this.setState({ lyrs: lyrs.concat([{ name: 'Layer ' + i, color: i % PALETTE.length }]), layer: i }); this.showToast('Layer ' + i + ' を表示しました'); },
lRows: lyrs.map((l, i) => {
const stop = (e) => { if (e && e.stopPropagation) e.stopPropagation(); };
return {
index: i, name: l.name, renaming: lren === i, notRenaming: lren !== i, palOpen: lpal === i,
style: 'padding: 8px 10px; gap: 8px; cursor: pointer; transition: background-color 0.25s ease, box-shadow 0.25s ease; background: ' + (i === layer ? '#ffffff' : 'rgba(255, 255, 255, 0.55)') + '; box-shadow: ' + (i === layer ? '0 0 0 2px ' + PALETTE[l.color] : 'none'),
dot: 'width: 22px; height: 22px; border-radius: 11px; border: 3px solid #ffffff; box-shadow: 0 0 0 1px #d5d8de; cursor: pointer; padding: 0; flex: none; background: ' + PALETTE[l.color],
colorLabel: 'レイヤー ' + i + ' の色',
togglePal: (e) => { stop(e); this.setState({ lpal: lpal === i ? -1 : i }); },
colors: PALETTE.map((c, ci) => ({ label: 'Color ' + (ci + 1), on: ci === l.color, style: 'width: 24px; height: 24px; border-radius: 12px; cursor: pointer; padding: 0; background: ' + c + '; border: ' + (ci === l.color ? '3px solid #0e0e10' : '2px solid #ffffff') + '; box-shadow: 0 0 0 1px #d5d8de', pick: () => { setLyr(i, { color: ci }); this.setState({ lpal: -1 }); } })),
pick: () => { if (layer !== i) this.setState({ layer: i }); },
stop, draft: st.ldraft || '', onDraft: (e) => this.setState({ ldraft: e.target.value }),
onKey: (e) => { if (e.key === 'Enter') lCommit(i); if (e.key === 'Escape') this.setState({ lren: -1 }); },
startRename: (e) => { stop(e); this.setState({ lren: i, ldraft: l.name }); }, saveName: (e) => { stop(e); lCommit(i); },
hasLed: (lt.led[i] || 0) > 0, ledDot: 'width: 9px; height: 9px; border-radius: 5px; border: 1px solid rgba(0, 0, 0, 0.15); background: ' + ((lt.led[i] || 0) > 1 ? LED[lt.led[i]][2] : 'transparent'),
toLed: (e) => { stop(e); go('lighting', { lsub: 'led', layer: i }); },
hasChanges: pendingOn(i) > 0, changes: pendingOn(i),
edit: (e) => { stop(e); this.setState({ ksub: 'keymap', layer: i, paneN: paneN + 1, win: false, view: 'overview' }); },
removable: i > 0 && i === lyrs.length - 1,
remove: (e) => { stop(e); if (lHasKeys(i)) this.setState({ open: 'dlg-lremove' }); else lRemoveTop(); }
};
}),
bigTabs: [['keys', 'Keys'], ['pointing', 'Pointing'], ['lighting', 'Lighting']].map(([id, label]) => ({ label, cls: section === id ? 'cur' : '', ac: section === id ? 'page' : 'false', pick: () => go(id) })),
subTabs: SUBS[section], subLabel: { keys: 'Keys', pointing: 'Pointing', lighting: 'Lighting' }[section] + ' のページ',
subAnim: 'animation: ' + (secN % 2 ? 'mx-sub-a' : 'mx-sub-b') + ' 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)',
layerOpen: open === 'layer', toggleLayer: toggle('layer'),
moreOpen: open === 'more', toggleMore: toggle('more'),
dlgReset: open === 'dlg-reset', dlgClear: open === 'dlg-clear',
layers: LAYERS.map((L, i) => ({
title: 'Layer ' + i + ' · ' + L.name, on: i === layer, pending: pendingOn(i), hasPending: pendingOn(i) > 0,
dot: 'width: 10px; height: 10px; border-radius: 5px; flex: none; background: ' + L.color,
style: 'font-weight: ' + (i === layer ? 700 : 500) + '; background: ' + (i === layer ? '#f5f6f8' : 'transparent'),
pick: () => this.setState({ layer: i, open: null, n: n + 1 })
})),
layerTitle: 'Layer ' + layer + ' · ' + LAY(layer).name,
layerDot: 'width: 10px; height: 10px; border-radius: 5px; flex: none; transition: background-color 0.3s ease; background: ' + LAY(layer).color,
undoOff: !past.length, redoOff: !future.length, undoCls: past.length ? '' : 'off', redoCls: future.length ? '' : 'off',
undo: () => { if (!past.length) return; const p = past[past.length - 1]; this.setState({ A: p.A, H: p.H, past: past.slice(0, -1), future: [{ A, H }].concat(future), n: n + 1 }); },
redo: () => { if (!future.length) return; const f = future[0]; this.setState({ A: f.A, H: f.H, future: future.slice(1), past: past.concat([{ A, H }]), n: n + 1 }); },
onDefImport: (e) => { const f = e.target.files && e.target.files[0]; this.setState({ open: null }); if (f) this.showToast(f.name + ' を読み込みました'); },

sizes: ['S', 'M', 'L'].map((z) => ({ label: z, on: z === size, cls: z === size ? 'on' : '', pick: () => this.setState({ size: z, view: 'overview' }) })),
sizeTitle: 'Keyboard size: ' + { S: '60%', M: '70%', L: '85%' }[size],
nothingPending: !pending, askClear: () => this.setState({ open: 'dlg-clear' }),
doClear: () => { commit({}, {}, { open: null, startDone: true }); this.showToast('すべての変更を取り消しました'); },
cheatSheet: () => this.showToast('キーマップのチートシート（PDF）を作成しました'),
startTest: () => this.setState({ testing: true, tested: {}, open: null, view: 'overview', win: false }),
endTest: () => this.setState({ testing: false }),
testing, testCount: Object.keys(tested).length + ' / 42 キー確認済み',
askReset: () => this.setState({ open: 'dlg-reset' }),
doReset: () => { this.setState({ A: {}, H: {}, W: {}, WH: {}, startDone: true, past: [], future: [], open: null, n: n + 1 }); this.showToast('初期のキーマップを適用しました'); },

stageCls: isLighting ? 'dark' : '',
stageStyle: 'flex: 1; height: auto; min-height: 0; border-radius: clamp(14px, 2vh, 20px); --under: ' + (isLighting && !lightsOut ? 'color-mix(in srgb, ' + (layerC || lightC(hueDeg)) + ' 30%, transparent)' : 'rgba(0, 0, 0, 0)'),
fxCls: (isLighting && !lightsOut ? 'fx-' + effKind + ' ' : '') + 'flip-' + viewLayer,
camStyle: 'left: ' + cam.left.toFixed(2) + '%; top: ' + cam.top + '%; transform: scale(' + cam.s.toFixed(3) + ') rotateX(' + cam.a + 'deg) translate(' + (-cam.x) + 'px, ' + (-cam.y) + 'px); --spd: ' + spd.toFixed(2) + 's; --fade: ' + (touch || st.touchFading ? Math.max(0.05, lt.fade / 100) : 0.6).toFixed(2) + 's',
halfL: 'left: -416px; top: -114px; width: 410px; height: 304px',
halfR: 'left: 6px; top: -300px; width: 410px; height: 490px',
padStyle: 'left: ' + (PAD.x - PAD.w / 2) + 'px; top: ' + (PAD.y - PAD.h / 2) + 'px; width: ' + PAD.w + 'px; height: ' + PAD.h + 'px' + (padTouchOn ? '; cursor: crosshair' : ''),
padCls: isPointing && (psub === 'touchpad' || psub === 'timing' || psub === 'mouse') ? 'sel' : '', padOn: isPointing,
padLblStyle: 'opacity: ' + (padZonesOn || (isPointing && psub === 'touchpad' && tpTab === 'device') || (touch && padTouchOn) ? 0 : 1),
pickPad: () => {
if (testing) return;
if (isKeys) { go('pointing', { psub: 'touchpad' }); return; }
if (isLighting) { this.setState({ lsub: 'glow', secHide: false, paneN: lsub === 'glow' ? paneN : paneN + 1 }); return; }
if (psub === 'knobs') this.setState({ psub: 'touchpad', paneN: paneN + 1, secHide: false }); else this.setState({ secHide: false });
},
padMove, padLeave: () => { if (!st.touch) return; this.setState({ touch: null, touchFading: true }); this.later(() => this.setState({ touchFading: false }), Math.max(50, lt.fade * 10) + 100); },
padZonesOn, padZones: ZONES.map(([id, label, kind]) => ({ label, on: id === zone[0], cls: (id === zone[0] ? 'on ' : '') + (zAssigned(id) ? 'set' : ''), mark: kind === 'corner' ? (zAssigned(id) ? '●' : '') : (zAssigned(id) ? 'SET' : ''), style: geom[id], pick: (e) => { if (e && e.stopPropagation) e.stopPropagation(); pickZone(id); } })),
padArrowOn: isPointing && psub === 'touchpad' && tpTab === 'device',
padArrow: 'transition: transform 0.6s cubic-bezier(0.34, 1.4, 0.64, 1); transform: rotate(' + tp.rot + 'deg) scale(' + (tp.invX ? -1 : 1) + ', ' + (tp.invY ? -1 : 1) + ')',
padRingOn: isPointing && psub === 'touchpad' && tpTab === 'scroll' && tp.scroll === 'Circular',
padDotOn: !!touch && padTouchOn,
padDot: touch ? 'position: absolute; left: ' + (touch.fx * 100).toFixed(1) + '%; top: ' + (touch.fy * 100).toFixed(1) + '%; width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 11px; pointer-events: none; background: ' + (glowC || lightC(hueDeg)) + '; box-shadow: 0 0 18px ' + (glowC || lightC(hueDeg)) : '',
knobs3d: KNOBS.map((K) => ({ label: K.label, cls: isPointing && psub === 'knobs' && knobSel === K.id ? 'sel' : '', style: 'left: ' + (K.x - 26) + 'px; top: ' + (K.y - 26) + 'px; transform: translateZ(14px) rotate(' + (angle[K.id] || 0) + 'deg)', pick: () => { if (isPointing) this.setState({ psub: 'knobs', knobSel: K.id, secHide: false, paneN: psub === 'knobs' ? paneN : paneN + 1 }); else go('pointing', { psub: 'knobs', knobSel: K.id }); } })),
caps,
isOverview: view === 'overview', isFocus: view === 'focus', ovCls: view === 'overview' ? 'on' : '', fcCls: view === 'focus' ? 'on' : '',
toOverview: () => this.setState({ view: 'overview' }), toFocus: () => this.setState({ view: 'focus' }),
stageRef: (el) => {
if (!el || this._ro) return;
this._ro = new ResizeObserver((entries) => {
const r = entries[0].contentRect;
const cur = this.state || {};
if (Math.abs((cur.sw || 0) - r.width) > 4 || Math.abs((cur.sh || 0) - r.height) > 4) this.setState({ sw: Math.round(r.width), sh: Math.round(r.height) });
});
this._ro.observe(el);
},

chipOn: !isLighting, chipStyle: 'height: 34px; border-radius: 17px; gap: 8px; font-size: 13px; font-weight: 600; color: #0e0e10; ' + chipAnim,
chipDot: isKeys || (isPointing && psub === 'mouse') ? 'width: 10px; height: 10px; border-radius: 5px; flex: none; background: ' + LAY(viewLayer).color : 'width: 10px; height: 10px; border-radius: 5px; flex: none; background: #7aa2ff; box-shadow: 0 0 8px #7aa2ff',
chipTitle: isKeys ? 'Layer ' + viewLayer + ' · ' + LAY(viewLayer).name : (psub === 'mouse' ? 'Layer ' + ml.layer + ' · ' + LAY(ml.layer).name : (psub === 'knobs' ? 'Knobs' : 'Touchpad')),
chipSub: isKeys ? (isCombos ? 'コンボのトリガーはレイヤー 0 のキー' : (isMacros ? 'マクロのキー ' + caps.filter((c) => /^M\d+$/.test(c.label)).length + '個' : '42 keys · このレイヤーの未反映 ' + pendingOn(layer) + '件')) : (psub === 'mouse' ? 'マウスレイヤーの割り当て' : (psub === 'knobs' ? '左右のノブ' : '右手側の上部')),
pvSegStyle: 'padding: 3px; border-radius: 19px; ' + chipAnim,
pvLayers: LAYERS.map((L, i) => ({ label: 'L' + i + ' ' + L.name, on: i === layer, cls: i === layer ? 'on' : '', dot: 'display: inline-block; width: 8px; height: 8px; border-radius: 4px; margin-right: 6px; background: ' + (lt.led[i] > 1 ? LED[lt.led[i]][2] : 'conic-gradient(#e5484d, #f5d90a, #30a46c, #05a2c2, #3e63dd, #d6409f, #e5484d)'), pick: () => this.setState({ layer: i }) })),
hintOn: true, hintText, hintCls: isKeymap && win ? 'hide' : '', hintStyle: 'height: 32px; gap: 10px; ' + chipAnim,
reopenOn: !isKeymap && secHide && !st.winClosing, reopenLabel: isLighting ? 'Lighting settings' : (isMacros ? 'Macros' : secTitle) + (isKeys ? '' : ' settings'), reopen: () => this.setState({ secHide: false }),

closeWin, keyWinOpen: isKeymap && win, winCls: st.winClosing ? 'out' : '', winKey: true,
winTitle: disp(rawSel) + ' キーの設定',
toolsCls: win ? 'hide' : '',
secWinOpen: !isKeymap && !secHide, secWinCls: (st.winClosing ? 'out ' : '') + (isLighting ? 'ondark ' : '') + (isMacros ? 'xwide' : 'wide'),
secWinStyle: st.winClosing ? '' : 'animation-name: ' + (secN % 2 ? 'mx-win' : 'mx-win2'),
secTitle, secSub,
secIcon: 'width: 44px; height: 44px; border-radius: 14px; flex: none; background: linear-gradient(150deg, #2f3137, #1b1c20); box-shadow: inset 0 0 0 2px ' + (isLighting ? (layerC || lightC(hueDeg)) : (isKeys ? LAY(layer).color : '#7aa2ff')) + ', 0 0 18px ' + (isLighting ? (layerC || lightC(hueDeg)) : (isKeys ? 'rgba(14, 14, 16, 0.12)' : 'rgba(122, 162, 255, 0.5)')) + '; transition: box-shadow 0.5s ease',
saveChip: isKeys ? (isCombos ? (cbusy ? '保存中…' : 'Save で書き込み') : (pending ? '未反映 ' + pending + '件' : '反映済み')) : (st.saving ? '保存中…' : '自動保存'),
secChipDot: isKeys ? 'width: 8px; height: 8px; border-radius: 4px; background: ' + (isCombos ? (cbusy ? '#c08a1e' : '#1f8a55') : (pending ? '#3d6fd6' : '#1f8a55')) : C.autoStatusDot,
hasInner: !!inner, innerTabs: inner ? inner[1].map(([id, label]) => ({ label, on: inner[2] === id, pick: pickInner(inner[0], id) })) : [],
paneCards: paneCard ? [paneCard] : [],
paneAnim: 'animation: ' + (paneN % 2 ? 'mx-pin-a' : 'mx-pin-b') + ' 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
resetSec, resetTitle: (isLighting ? 'Lighting' : secTitle) + ' を既定値に戻す',

summary: '42 keys · このレイヤーの未反映 ' + pendingOn(layer) + '件',
isUS: !jis, isJIS: jis, usCls: labelLang === 'English (US)' ? 'on' : '', jisCls: jis ? 'on' : '',
setUS: () => this.setState({ labelLang: 'English (US)' }), setJIS: () => this.setState({ labelLang: 'Japanese' }),
langs: LANGS, labelLang, onLabelLang: (e) => this.setState({ labelLang: e.target.value }),

selLabel: disp(rawSel), selCode, selDesc, selHold: selHoldV ? holdShort[selHoldV] : 'None',
selWhere: 'Layer ' + layer + ' · ' + selPos.side + ' · row ' + selPos.row + ', col ' + selPos.col,
selChanged, selBefore: disp(before),
resetKey: () => commit(setIn(A, layer, sel, undefined), setIn(H, layer, sel, undefined)),
capStyle: 'min-width: 56px; height: 56px; border-radius: 16px; background: #0e0e10; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: ' + (rawSel.length > 5 ? 12 : 17) + 'px; font-weight: 700; flex: none; padding: 0 8px; box-sizing: border-box; text-align: center; white-space: pre-line; animation: ' + (n % 2 ? 'mx-swap-a' : 'mx-swap-b') + ' 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
macCls: os === 'mac' ? 'on' : '', winOsCls: os === 'win' ? 'on' : '', setMac: () => this.setState({ os: 'mac' }), setWin: () => this.setState({ os: 'win' }),
presets,
winTabs: [['key', 'Keycode'], ['hold', 'Hold/Tap'], ['custom', 'Custom'], ['presets', 'Presets']].map(([id, label]) => ({ label, on: wtab === id, pick: () => this.setState({ wtab: id }) })),
tabKey: wtab === 'key', tabHold: wtab === 'hold', tabCustom: wtab === 'custom', tabPresets: wtab === 'presets',
cats: KEYCODE_CATS.map(([c]) => ({ label: c, on: !q && c === cat, cls: !q && c === cat ? 'on' : '', pick: () => this.setState({ cat: c, query: '' }) })),
catsWrap: 'flex: none; transition: opacity 0.2s ease; opacity: ' + (q ? 0.5 : 1),
groups, query, hasQuery: !!query, onQuery: (e) => this.setState({ query: e.target.value }), clearQuery: () => this.setState({ query: '' }),
paletteNote: q ? (shown ? '「' + query + '」に一致：' + shown + '件' + (shown > 160 ? '（先頭の160件）' : '') : '「' + query + '」に一致するキーコードはありません。') : cat + '：' + shown + '件（全 ' + total + ' 件）。押すと選択中のキーに割り当てます。',
hovLabel: hov ? hov.label : '?', hovCode: hov ? hov.code : 'Keycodes',
hovDesc: hov ? (hov.desc || '説明はありません。') : 'キーにカーソルを合わせると、どういうキーかをここに表示します。',
descBar: 'flex: none; display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 6px 12px 6px 6px; border-radius: 18px; transition: background-color 0.25s ease; background: ' + (hov ? '#eef3fd' : '#f5f6f8'),
descCap: 'min-width: 36px; height: 36px; padding: 0 8px; box-sizing: border-box; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; white-space: pre-line; text-align: center; flex: none; ' + (hov ? 'background: #0e0e10; color: #ffffff; animation: ' + ((st.hovN || 0) % 2 ? 'mx-pop-a' : 'mx-pop-b') + ' 0.3s ease' : 'background: #e1e3e8; color: #6b6e75'),
modsOff: !isBasic, sideL: side === 'L' ? 'on' : '', sideR: side === 'R' ? 'on' : '',
setSideL: () => applyMods(modState, 'L'), setSideR: () => applyMods(modState, 'R'),
mods: MODS.map(([label, m]) => ({ label, on: !!modState[m], off: !isBasic, toggle: () => applyMods(Object.assign({}, modState, { [m]: !modState[m] }), side) })),
holdOpts: HOLDS.map(([label, val]) => ({ label, on: selHoldV === val, cls: selHoldV === val ? 'on' : '', pick: () => { if (selHoldV !== val) commit(A, setIn(H, layer, sel, val)); } })),
hex, onHex: (e) => this.setState({ hex: e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 4).toUpperCase() }),
hexBits: hexOk ? hexVal.toString(2).padStart(16, '0').replace(/(\d{4})(?=\d)/g, '$1 ') : '0000 0000 0000 0000',
hexOff: !hexOk, applyHex: () => { if (!hexOk) return; const lbl = '0x' + hex.padStart(4, '0'); assign(lbl, lbl); closeWin(); },

pending, writing, write,
statusText: isCombos ? (cbusy ? 'キーボードに保存中…' : (ced ? 'コンボを編集中（まだ保存されていません）' : 'コンボ ' + cbs.length + ' / ' + CSLOTS + ' 使用中・キーボードに保存済み')) : isKeys ? (mRemaining < 0 ? 'マクロの容量が足りません（' + (-mRemaining) + ' バイト超過）' : writing ? 'キーボードに書き込み中…' : (pending ? '未反映の変更 ' + pending + '件' : 'すべてキーボードに反映済み')) : C.autoStatusText,
statusDot: isKeys ? 'width: 8px; height: 8px; border-radius: 4px; transition: background-color 0.3s ease; background: ' + (writing ? '#c08a1e' : (pending ? '#3d6fd6' : '#1f8a55')) : C.autoStatusDot,
writeOff: !pending || writing || mRemaining < 0, writeCls: !pending && !writing ? 'idle' : '',
writeLabel: writing ? 'Writing…' : (pending ? 'Write to keyboard' : 'Up to date'),
badgeStyle: 'min-width: 32px; height: 32px; border-radius: 16px; background: #ffffff; color: #0e0e10; display: flex; align-items: center; justify-content: center; font-size: 13px; padding: 0 6px; box-sizing: border-box; animation: ' + (pending % 2 ? 'mx-pop-a' : 'mx-pop-b') + ' 0.4s cubic-bezier(0.3, 0.7, 0.4, 1)'
});
