#!/usr/bin/env python3
# Assembles canvas pages from per-page fragments plus the shared chrome taken from Main.dc.html.
import re, sys, os

ROOT = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.join(ROOT, 'canvas2', 'project')
HELMET = open(os.path.join(ROOT, 'shared', 'helmet.html')).read()
KBD_MENU = open(os.path.join(ROOT, 'shared', 'kbd.html')).read()
GEAR_MENU = open(os.path.join(ROOT, 'shared', 'actions.html')).read()

NAVS = {
    'Keys': [('Keymap', 'Main.dc.html'), ('Macros', 'Macros.dc.html'), ('Combos', 'Combos.dc.html'), ('Layers', 'Layers.dc.html')],
    'Firmware': [('Write firmware', 'Firmware.dc.html')],
}
BIG_EDITOR = [('Keys', 'Main.dc.html'), ('Pointing', 'Pointing.dc.html'), ('Lighting', 'Lighting.dc.html')]
BIG_CONNECT = [('Connect', 'Connect.dc.html'), ('Firmware', 'Firmware.dc.html')]

CARDS_TPL = """<sc-for list="{{%(list)s}}" as="c" hint-placeholder-count="3">
<section class="mx-card" aria-label="{{c.title}}" style="{{c.style}}">
<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px"><div style="display: flex; flex-direction: column; gap: 4px"><h2 class="mx-h1">{{c.title}}<sc-if value="{{c.hasBadge}}" hint-placeholder-val="{{false}}"><span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px; background: #fdebd6; color: #9a5310">{{c.badge}}</span></sc-if></h2><span class="mx-sub mx-sub2" title="{{c.sub}}">{{c.sub}}</span></div></div>
<div class="mx-rows" style="{{c.rowsStyle}}">
<sc-for list="{{c.rows}}" as="r" hint-placeholder-count="3">
<div style="{{r.dim}}">
<sc-if value="{{r.isSlider}}" hint-placeholder-val="{{false}}"><label style="display: flex; flex-direction: column; gap: 6px"><span style="display: flex; justify-content: space-between; gap: 12px; font-size: 14px; font-weight: 600">{{r.label}}<span style="font-variant-numeric: tabular-nums; color: #4a4d54; font-weight: 600">{{r.valueText}}</span></span><input type="range" min="{{r.min}}" max="{{r.max}}" step="{{r.step}}" value="{{r.value}}" disabled="{{r.off}}" onChange="{{r.onChange}}" style="{{r.track}}"><span class="mx-sub mx-help-t" title="{{r.help}}" style="font-size: 12px">{{r.help}}</span></label></sc-if>
<sc-if value="{{r.isSwitch}}" hint-placeholder-val="{{false}}"><div style="display: flex; justify-content: space-between; gap: 16px; align-items: center"><span style="display: flex; flex-direction: column; gap: 2px"><b style="font-size: 14px; font-weight: 600">{{r.label}}</b><span class="mx-sub mx-help-t" title="{{r.help}}" style="font-size: 12px">{{r.help}}</span></span><button role="switch" aria-checked="{{r.on}}" aria-label="{{r.label}}" disabled="{{r.off}}" onClick="{{r.toggle}}" style="{{r.swStyle}}"><span style="{{r.knobStyle}}"></span></button></div></sc-if>
<sc-if value="{{r.isSeg}}" hint-placeholder-val="{{false}}"><div style="display: flex; flex-direction: column; gap: 8px"><b style="font-size: 14px; font-weight: 600">{{r.label}}</b><div class="mx-seg" role="radiogroup" aria-label="{{r.label}}"><sc-for list="{{r.opts}}" as="o" hint-placeholder-count="3"><button class="mx-pill sm mx-press {{o.cls}}" role="radio" aria-checked="{{o.on}}" disabled="{{o.off}}" onClick="{{o.pick}}" style="{{o.style}}">{{o.label}}</button></sc-for></div><span class="mx-sub mx-help-t" title="{{r.help}}" style="font-size: 12px">{{r.help}}</span></div></sc-if>
<sc-if value="{{r.isSelect}}" hint-placeholder-val="{{false}}"><label style="display: flex; flex-direction: column; gap: 8px"><b style="font-size: 14px; font-weight: 600">{{r.label}}</b><select class="mx-sel" value="{{r.value}}" disabled="{{r.off}}" onChange="{{r.onChange}}" style="height: 40px; border-radius: 12px"><sc-for list="{{r.groups}}" as="g" hint-placeholder-count="2"><optgroup label="{{g.label}}"><sc-for list="{{g.opts}}" as="o" hint-placeholder-count="4"><option value="{{o}}">{{o}}</option></sc-for></optgroup></sc-for></select><span class="mx-sub mx-help-t" title="{{r.help}}" style="font-size: 12px">{{r.help}}</span></label></sc-if>
<sc-if value="{{r.isSwatches}}" hint-placeholder-val="{{false}}"><div style="display: flex; flex-direction: column; gap: 8px"><span style="display: flex; justify-content: space-between; gap: 12px"><b style="font-size: 14px; font-weight: 600">{{r.label}}</b><span class="mx-sub">{{r.valueText}}</span></span><div style="display: flex; gap: 8px; flex-wrap: wrap" role="radiogroup" aria-label="{{r.label}}"><sc-for list="{{r.opts}}" as="o" hint-placeholder-count="8"><button class="mx-press mx-swatch" role="radio" aria-checked="{{o.on}}" aria-label="{{o.label}}" title="{{o.label}}" disabled="{{o.off}}" onClick="{{o.pick}}" style="{{o.style}}"></button></sc-for></div><span class="mx-sub mx-help-t" title="{{r.help}}" style="font-size: 12px">{{r.help}}</span></div></sc-if>
<sc-if value="{{r.isNote}}" hint-placeholder-val="{{false}}"><div class="mx-sub mx-sub2" title="{{r.help}}" style="padding: 10px 14px; border-radius: 14px; background: #f5f6f8; font-size: 12px">{{r.help}}</div></sc-if>
<sc-if value="{{r.isButton}}" hint-placeholder-val="{{false}}"><button class="mx-pill sm mx-press" onClick="{{r.onClick}}">{{r.label}}</button></sc-if>
</div>
</sc-for>
</div>
</section>
</sc-for>"""

COMMON_JS = r'''const st = this.state || {};
const ptr = st.ptr || null;
const gx = ptr ? ptr.x : 690;
const gy = ptr ? ptr.y : 40;
const glowBase = 'position: absolute; top: 0; left: 0; border-radius: 50%; pointer-events: none; will-change: transform; ';
const at = (w, h, dx, dy) => 'translate(' + Math.round(gx - w / 2 + dx) + 'px, ' + Math.round(gy - h / 2 + dy) + 'px)';
const open = st.open || null;
const toggle = (name) => () => this.setState({ open: open === name ? null : name });
const closeAll = () => this.setState({ open: null });
const dlg = !!open && open.indexOf('dlg-') === 0;
const sw = (on) => 'position: relative; width: 56px; height: 32px; border: none; border-radius: 16px; cursor: pointer; padding: 0; flex: none; transition: background-color 0.3s ease, transform 0.2s ease; background: ' + (on ? '#0e0e10' : '#d5d8de');
const knob = (on) => 'position: absolute; top: 4px; left: ' + (on ? '28px' : '4px') + '; width: 24px; height: 24px; border-radius: 12px; background: #ffffff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18); transition: left 0.42s cubic-bezier(0.34, 1.56, 0.64, 1)';
const pillCls = (on) => (on ? 'on' : '');
const autosave = (patch) => {
this.setState(Object.assign({ saving: true }, patch));
clearTimeout(this._ts);
this._ts = setTimeout(() => this.setState({ saving: false }), 700);
};
const R = {
slider: (label, value, min, max, step, text, help, onSet, off) => ({ isSlider: true, label, value, min, max, step, valueText: text, help: help || '', off: !!off, dim: off ? 'opacity: 0.45; transition: opacity 0.3s ease' : 'transition: opacity 0.3s ease', track: 'width: 100%; accent-color: #0e0e10', onChange: (e) => onSet(Number(e.target.value)) }),
sw: (label, on, help, onSet, off) => ({ isSwitch: true, label, on: !!on, help: help || '', off: !!off, dim: off ? 'opacity: 0.45; transition: opacity 0.3s ease' : 'transition: opacity 0.3s ease', swStyle: sw(!!on), knobStyle: knob(!!on), toggle: () => onSet(!on) }),
seg: (label, options, cur, help, onSet, off) => ({ isSeg: true, label, help: help || '', off: !!off, dim: off ? 'opacity: 0.45; transition: opacity 0.3s ease' : 'transition: opacity 0.3s ease', opts: options.map((o) => { const v = Array.isArray(o) ? o[0] : o; const l = Array.isArray(o) ? o[1] : o; return { label: l, on: v === cur, cls: v === cur ? 'on' : '', off: !!off, style: '', pick: () => onSet(v) }; }) }),
select: (label, groups, cur, help, onSet, off) => ({ isSelect: true, label, value: cur, help: help || '', off: !!off, dim: off ? 'opacity: 0.45; transition: opacity 0.3s ease' : 'transition: opacity 0.3s ease', groups: groups.map(([g, opts]) => ({ label: g, opts })), onChange: (e) => onSet(e.target.value) }),
swatches: (label, options, cur, help, onSet, off) => ({ isSwatches: true, label, help: help || '', off: !!off, dim: off ? 'opacity: 0.45; transition: opacity 0.3s ease' : 'transition: opacity 0.3s ease', valueText: (options.find((o) => o[0] === cur) || [0, ''])[1], opts: options.map(([v, l, color]) => ({ label: l, on: v === cur, off: !!off, pick: () => onSet(v), style: 'width: 34px; height: 34px; border-radius: 17px; cursor: pointer; padding: 0; transition: transform 0.2s ease; ' + (color ? 'background: ' + color : 'background: conic-gradient(#e5484d, #f5d90a, #30a46c, #05a2c2, #3e63dd, #d6409f, #e5484d)') + '; border: ' + (v === cur ? '3px solid #0e0e10' : '2px solid #ffffff') + '; box-shadow: 0 0 0 1px #d5d8de' })) }),
note: (text) => ({ isNote: true, help: text, dim: '' }),
button: (label, onClick) => ({ isButton: true, label, onClick, dim: '' })
};
const card = (title, sub, rows, extra) => Object.assign({ title, sub: sub || '', rows, hasBadge: false, badge: '', style: '', rowsStyle: 'display: flex; flex-direction: column; gap: 16px' }, extra || {});
const rowsGrid = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px 28px';
const ptabs = (key, list, def) => { const cur = st[key] || def; return { cur, tabs: list.map(([id, label]) => ({ label, on: cur === id, pick: () => this.setState({ [key]: id }) })) }; };
const C = {
glowStyle: glowBase + 'width: 1300px; height: 900px; background: radial-gradient(closest-side, rgba(70, 112, 210, 0.42), rgba(70, 112, 210, 0.16) 55%, rgba(70, 112, 210, 0) 100%); filter: blur(80px); transition: transform 1.6s cubic-bezier(0.2, 0.7, 0.2, 1); transform: ' + at(1300, 900, 0, -120),
glowStyle2: glowBase + 'width: 760px; height: 560px; background: radial-gradient(closest-side, rgba(130, 168, 245, 0.5), rgba(130, 168, 245, 0) 100%); filter: blur(64px); transition: transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1); transform: ' + at(760, 560, 0, 0),
glowStyle3: glowBase + 'width: 900px; height: 640px; background: radial-gradient(closest-side, rgba(160, 140, 235, 0.28), rgba(160, 140, 235, 0) 100%); filter: blur(90px); transition: transform 2.4s cubic-bezier(0.2, 0.7, 0.2, 1); transform: ' + at(900, 640, ptr ? (690 - gx) * 0.6 + 220 : 380, ptr ? (300 - gy) * 0.4 + 120 : 260),
onMove: (e) => {
if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const el = e.currentTarget;
const r = el.getBoundingClientRect();
const k = el.offsetWidth ? r.width / el.offsetWidth : 1;
this._ptr = { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
if (!this._raf) this._raf = requestAnimationFrame(() => { this._raf = 0; this.setState({ ptr: this._ptr }); });
},
onLeave: () => this.setState({ ptr: null }),
closeAll, menuOpen: !!open && !dlg, dialogOpen: dlg,
hdrCls: st.scrolled ? 'scrolled' : '', miniCls: st.scrolled ? 'show' : '',
kbdOpen: open === 'kbd', toggleKbd: toggle('kbd'),
gearOpen: open === 'gear', toggleGear: toggle('gear'),
helpOpen: open === 'help', toggleHelp: toggle('help'),
onImport: (e) => { const f = e.target.files && e.target.files[0]; this.setState({ open: null }); if (f) this.showToast('Imported: ' + f.name); },
exportKeymap: () => { this.setState({ open: null }); this.showToast('matrix-split42.matrix-keymap.json を書き出しました'); },
hasToast: !!st.toast, toast: st.toast || '',
toastAnim: 'animation: ' + ((st.toastN || 0) % 2 ? 'mx-pop-a' : 'mx-pop-b') + ' 0.4s cubic-bezier(0.3, 0.7, 0.4, 1)',
saving: !!st.saving,
autoStatusText: st.saving ? 'キーボードに保存中…' : 'キーボードに保存済み（自動保存）',
autoStatusDot: 'width: 8px; height: 8px; border-radius: 4px; transition: background-color 0.3s ease; background: ' + (st.saving ? '#c08a1e' : '#1f8a55')
};
'''

def parse(path):
    parts = {}
    cur = None
    for line in open(path).read().split('\n'):
        m = re.match(r'^@@(\w+)\s*(.*)$', line)
        if m:
            cur = m.group(1)
            parts[cur] = m.group(2).strip() + ('\n' if m.group(2).strip() else '')
            if m.group(2).strip():
                parts[cur] = m.group(2).strip()
                cur = cur  # single-line value; following lines append
            continue
        if cur:
            parts[cur] = (parts[cur] + '\n' if parts[cur] else '') + line
    return {k: v.strip('\n') for k, v in parts.items()}

def nav(items, current, cls, label, fade=False):
    links = ''.join('<a href="%s"%s>%s</a>' % (href, ' aria-current="page"' if name == current else '', name) for name, href in items)
    return '<nav class="%s%s" aria-label="%s">%s</nav>' % (cls, ' mx-fade' if fade else '', label, links)

STATE_BIG = '<nav class="mx-big" aria-label="セクション"><sc-for list="{{bigTabs}}" as="b" hint-placeholder-count="3"><button class="{{b.cls}}" aria-current="{{b.ac}}" onClick="{{b.pick}}">{{b.label}}</button></sc-for></nav>'
STATE_SUB = '<nav class="mx-subnav" aria-label="{{subLabel}}" style="{{subAnim}}"><sc-for list="{{subTabs}}" as="t" hint-placeholder-count="4"><sc-if value="{{t.isLink}}" hint-placeholder-val="{{false}}"><a href="{{t.href}}">{{t.label}}</a></sc-if><sc-if value="{{t.isBtn}}" hint-placeholder-val="{{true}}"><button class="{{t.cls}}" aria-current="{{t.ac}}" onClick="{{t.pick}}">{{t.label}}</button></sc-if></sc-for></nav>'

def build(frag, out, variant=None):
    p = parse(frag)
    if variant:
        p['TITLE'] = variant[1]
        sec, _, sub = variant[0].partition('/')
        p['JS'] = p['JS'].replace('/*DEFAULT_SECTION*/', "const DEF_SECTION = '%s'; const DEF_SUB = '%s';" % (sec, sub))
    big = p['BIG']
    group = BIG_CONNECT if big in ('Connect', 'Firmware') else BIG_EDITOR
    sub = NAVS.get(big, [])
    mini = '<nav class="mx-mini {{miniCls}}" aria-label="セクション（縮小）">' + ''.join('<a href="%s"%s>%s</a>' % (href, ' aria-current="page"' if name == big else '', name) for name, href in group) + ('<i>/</i><b>%s</b>' % p.get('SUB', '') if p.get('SUB') else '') + '</nav>'
    left = p['LEFT'].replace('%%KBD_MENU%%', KBD_MENU) if p.get('LEFT') else KBD_MENU + '\n<span class="mx-chip opt"><span style="width: 8px; height: 8px; border-radius: 4px; background: #1f8a55"></span>Connected · both halves</span>'
    header = '<header class="mx-hdr">\n<div class="mx-hgrp">\n' + left + '\n</div>\n<div class="mx-hgrp">\n' + p.get('RIGHT', '') + '\n' + ('' if p.get('NOGEAR') else GEAR_MENU) + '\n</div>\n</header>'
    h = int(p.get('H', '900'))
    html = '''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>%(title)s</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
%(helmet)s
<div class="mx-root">
<div class="mx-panel" onMouseMove="{{onMove}}" onMouseLeave="{{onLeave}}">
<div aria-hidden="true" style="{{glowStyle}}"></div>
<div aria-hidden="true" style="{{glowStyle2}}"></div>
<div aria-hidden="true" style="{{glowStyle3}}"></div>
<sc-if value="{{menuOpen}}" hint-placeholder-val="{{false}}"><button class="mx-close" aria-label="メニューを閉じる" onClick="{{closeAll}}"></button></sc-if>

<div class="mx-top mx-fade {{hdrCls}}">
%(header)s
%(big)s
%(sub)s
<div class="mx-rule" style="margin-top: 0"></div>
</div>

%(main)s

<footer class="mx-foot">
<div class="mx-hgrp" style="position: relative; z-index: 30">
<button class="mx-ib mx-press" aria-label="ヘルプ" aria-expanded="{{helpOpen}}" onClick="{{toggleHelp}}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></svg></button>
<sc-if value="{{helpOpen}}" hint-placeholder-val="{{false}}">
<div class="mx-help" role="dialog" aria-label="使い方">
%(help)s
</div>
</sc-if>
<span class="mx-status" role="status"><span style="{{statusDot}}"></span>{{statusText}}</span>
</div>
%(primary)s
</footer>

<sc-if value="{{hasToast}}" hint-placeholder-val="{{false}}">
<div class="mx-toast" role="status" style="{{toastAnim}}"><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"></path></svg></i>{{toast}}</div>
</sc-if>

<sc-if value="{{dialogOpen}}" hint-placeholder-val="{{false}}">
<div class="mx-scrimwrap">
<button class="mx-scrim" aria-label="閉じる" onClick="{{closeAll}}"></button>
<div class="mx-dlg" role="dialog" aria-modal="true">
%(dialogs)s
</div>
</div>
</sc-if>
</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":%(h)d}}'>
class Component extends DCLogic {
componentDidMount() {
this._onScroll = (e) => {
const t = e.target;
if (!t || !t.classList || !t.classList.contains('mx-main')) return;
const s = t.scrollTop > 8;
if (s !== !!(this.state && this.state.scrolled)) this.setState({ scrolled: s });
};
document.addEventListener('scroll', this._onScroll, true);
}
componentWillUnmount() {
document.removeEventListener('scroll', this._onScroll, true);
if (this._ro) this._ro.disconnect();
(this._timers || []).forEach((t) => clearTimeout(t));
clearTimeout(this._tt); clearTimeout(this._ts);
if (this._raf) cancelAnimationFrame(this._raf);
}
later(fn, ms) {
this._timers = this._timers || [];
const t = setTimeout(fn, ms);
this._timers.push(t);
return t;
}
showToast(msg) {
clearTimeout(this._tt);
this.setState({ toast: msg, toastN: ((this.state && this.state.toastN) || 0) + 1 });
this._tt = setTimeout(() => this.setState({ toast: null }), 3200);
}
renderVals() {
%(common)s
%(js)s
}
}
</script>
</body>
</html>
''' % dict(title=p['TITLE'], helmet=HELMET, header=header,
           big=STATE_BIG if p.get('NAVMODE') == 'state' else nav(group, big, 'mx-big', 'セクション'),
           sub=STATE_SUB if p.get('NAVMODE') == 'state' else nav(sub, p.get('SUB', ''), 'mx-subnav', big + ' のページ', True),
           main=re.sub(r'<!--CARDS:(\w+)-->', lambda m: CARDS_TPL % {'list': m.group(1)}, p['MAIN']), help=p['HELP'], primary=p['PRIMARY'], dialogs=p.get('DIALOGS', ''),
           h=h, common=COMMON_JS, js=p['JS'].replace('/*KEYCODE_CATS*/', open(os.path.join(ROOT, 'keycats.js')).read()).replace('/*KEY_DESC*/', open(os.path.join(ROOT, 'descja.js')).read()))
    open(os.path.join(PROJ, out), 'w').write(html)
    print('built', out, len(html))

if __name__ == '__main__':
    for name in sys.argv[1:]:
        path = os.path.join(ROOT, 'frags', name + '.frag')
        p = parse(path)
        if p.get('VARIANTS'):
            # VARIANTS: Out:section:Title|Out:section:Title — one frag, several entry pages
            for v in p['VARIANTS'].split('|'):
                o, sec, title = v.split(':', 2)
                build(path, o + '.dc.html', (sec, title))
        else:
            build(path, name + '.dc.html')
