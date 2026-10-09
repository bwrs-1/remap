// node studio.js <w> <h>  — walks every section/sub/inner tab of the unified studio and measures overflow
const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'render');
const srv = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' }); fs.createReadStream(f).pipe(res); }).listen(8767);
const W = +process.argv[2], H = +process.argv[3];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  const m = () => page.evaluate(() => {
    const d = document.documentElement, p = document.querySelector('.mx-wpane'), w = document.querySelector('.mx-win'), st = document.querySelector('.mx-stage');
    const r = { page: d.scrollHeight - d.clientHeight };
    if (p) r.pane = p.scrollHeight - p.clientHeight;
    if (w) { const b = w.getBoundingClientRect(), s = st.getBoundingClientRect(); r.win = Math.round(b.height); r.winOut = Math.round(b.bottom - s.bottom); }
    return r;
  });
  const shot = async (n) => { if (process.env.SHOT) await page.screenshot({ path: path.join(__dirname, '..', 'shots', `st-${W}x${H}-${n}.png`) }); };
  const sub = (t) => page.locator('.mx-subnav button', { hasText: t }).first().click();
  const inner = (t) => page.locator('.mx-win .mx-tabs button', { hasText: t }).first().click();
  await page.goto(`http://localhost:8767/Pointing.dc.html`); await page.waitForTimeout(1800);
  const plan = { 'Touchpad': ['Pointer', 'Tap', 'Scroll', 'Edges', 'Sensor', 'Device'], 'Mouse layer': ['Overview', 'Conditions'], 'Timing': ['Tap-hold', '3-finger swipe'], 'Knobs': [null] };
  for (const [s, tabs] of Object.entries(plan)) {
    await sub(s); await page.waitForTimeout(500);
    for (const t of tabs) { if (t) { await inner(t); } await page.waitForTimeout(1200); console.log(`${W}x${H} Pointing/${s}/${t || ''}`, JSON.stringify(await m())); await shot(`P-${s}-${t || ''}`.replace(/\s/g, '')); }
  }
  await page.goto(`http://localhost:8767/Lighting.dc.html`); await page.waitForTimeout(1800);
  for (const s of ['Effects', 'Layer colors', 'Key guide', 'Touch glow']) { await sub(s); await page.waitForTimeout(1200); console.log(`${W}x${H} Lighting/${s}`, JSON.stringify(await m())); await shot(`L-${s}`.replace(/\s/g, '')); }
  // hover the touchpad to light keys
  const pad = page.locator('.mx-pad'); const bb = await pad.boundingBox();
  await page.mouse.move(bb.x + bb.width * 0.3, bb.y + bb.height * 0.5); await page.waitForTimeout(700); await shot('L-touch');
  console.log('lit touch keys', await page.locator('.mx-cap.touch').count());
  await page.goto(`http://localhost:8767/Main.dc.html`); await page.waitForTimeout(1600);
  const cap = (t) => page.locator('.mx-cap', { hasText: new RegExp('^' + t + '$') }).first();
  for (const s of ['Macros', 'Combos', 'Layers']) {
    await sub(s); await page.waitForTimeout(1300); console.log(`${W}x${H} Keys/${s}`, JSON.stringify(await m())); await shot(`K-${s}`);
    if (s === 'Macros') { await cap('G').click(); await page.waitForTimeout(500); console.log('macro keys hl', await page.locator('.mx-cap.hl').count()); await page.locator('.mx-win button', { hasText: /^M1$/ }).first().click(); await page.waitForTimeout(600); console.log(`${W}x${H} Keys/Macros M1`, JSON.stringify(await m())); await shot('K-Macros-M1'); }
    if (s === 'Combos') { await page.locator('.mx-win .mx-row', { hasText: 'J + K' }).first().hover(); await page.waitForTimeout(400); console.log('combo hl2', await page.locator('.mx-cap.hl2').count()); await shot('K-Combos-hover'); await cap('Q').click(); await cap('W').click(); await page.waitForTimeout(500); console.log('combo sel', await page.locator('.mx-cap.sel').count()); console.log(`${W}x${H} Keys/Combos edit`, JSON.stringify(await m())); await shot('K-Combos-edit'); await page.locator('.mx-win button', { hasText: 'Cancel' }).click(); await page.waitForTimeout(300); }
    if (s === 'Layers') { await page.locator('.mx-win .mx-row', { hasText: 'Raise' }).first().click(); await page.waitForTimeout(900); await shot('K-Layers-Raise'); console.log('layer2 cap Q label', await page.locator('.mx-cap').nth(3).innerText()); await page.locator('.mx-win button', { hasText: 'Add layer' }).click(); await page.waitForTimeout(700); console.log(`${W}x${H} Keys/Layers +1`, JSON.stringify(await m())); }
  }
  await sub('Keymap'); await page.waitForTimeout(1200);
  console.log(`${W}x${H} Keys`, JSON.stringify(await m())); await shot('K');
  await page.locator('.mx-big button', { hasText: 'Pointing' }).click(); await page.waitForTimeout(450); await shot('K2P-mid'); await page.waitForTimeout(1000);
  console.log(`${W}x${H} Keys->Pointing`, JSON.stringify(await m())); await shot('K2P');
  await page.locator('.mx-big button', { hasText: 'Lighting' }).click(); await page.waitForTimeout(1500); await shot('P2L');
  console.log('errors', JSON.stringify(errs.slice(0, 6)));
  await browser.close(); srv.close();
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
