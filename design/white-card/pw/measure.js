// node measure.js <w> <h> [page ...]
const { chromium } = require('playwright-core');
const http = require('http'), fs = require('fs'), path = require('path');
const dir = process.argv[4] || '';
const ROOT = path.join(__dirname, '..', 'render');
const srv = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' });
  fs.createReadStream(f).pipe(res);
}).listen(8765);
const W = +process.argv[2], H = +process.argv[3];
const PAGES = { Main: [], Pointing: [], Lighting: [], Macros: [], Combos: [], Layers: [], Connect: [], Firmware: [] };
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  const measure = () => page.evaluate(() => {
    const d = document.documentElement;
    const m = document.querySelector('.mx-main') || document.querySelector('.cx-main');
    const out = { pageOverflowY: d.scrollHeight - d.clientHeight, pageOverflowX: d.scrollWidth - d.clientWidth };
    if (m) { out.mainOverflowY = m.scrollHeight - m.clientHeight; out.mainOverflowX = m.scrollWidth - m.clientWidth; out.mainH = m.clientHeight; }
    const foot = document.querySelector('footer');
    if (foot) { const r = foot.getBoundingClientRect(); out.footBottom = Math.round(r.bottom); }
    return out;
  });
  for (const [name, tabs] of Object.entries(PAGES)) {
    await page.goto(`http://localhost:8765/${name}.dc.html`, { waitUntil: 'load' });
    await page.waitForTimeout(1600);
    const runs = tabs.length ? tabs : [null];
    for (const t of runs) {
      if (t) { await page.locator('.mx-ptabs button', { hasText: t }).first().click(); await page.waitForTimeout(700); }
      const r = await measure();
      console.log(`${W}x${H} ${name}${t ? ' [' + t + ']' : ''}`, JSON.stringify(r));
      if (process.env.SHOT) await page.screenshot({ path: path.join(__dirname, '..', 'shots', `${W}x${H}-${name}${t ? '-' + t.replace(/\s/g, '') : ''}.png`) });
    }
  }
  console.log('errors', JSON.stringify(errs.slice(0, 5)));
  await browser.close(); srv.close();
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
