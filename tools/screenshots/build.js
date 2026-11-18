/**
 * App Store screenshots: 1320 × 2868 (iPhone 6.9").
 *
 *   node tools/screenshots/build.js
 *
 * Put plain iPhone screenshots in tools/screenshots/shots/ named 1.png … 5.png
 * (see frames.json for which is which). Missing ones get a placeholder.
 * Output: tools/screenshots/out/01.png … 05.png
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const DIR = __dirname;
// Embedded as data URLs: a page set with setContent can't load file:// fonts.
const FONT = (w) =>
  'data:font/ttf;base64,' +
  fs
    .readFileSync(path.join(ROOT, `node_modules/@expo-google-fonts/plus-jakarta-sans/${w}/PlusJakartaSans_${w}.ttf`))
    .toString('base64');

const THEMES = {
  night: { bg: 'radial-gradient(120% 70% at 50% 0%, #2E2550 0%, #16122A 55%, #0A0918 100%)', title: '#F1E9F7', sub: '#B9AACF', edge: '#2B2445' },
  day: { bg: 'radial-gradient(120% 70% at 50% 0%, #FFF3EC 0%, #FFE6DC 55%, #FBD3C4 100%)', title: '#3B1631', sub: '#6E4560', edge: '#E9C7BA' },
};

function page(f) {
  const t = THEMES[f.theme];
  const shot = path.join(DIR, 'shots', f.shot);
  const img = fs.existsSync(shot)
    ? `<img src="data:image/png;base64,${fs.readFileSync(shot).toString('base64')}">`
    : `<div class="ph">${f.shot}<br><span>screenshot goes here</span></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:J;font-weight:800;src:url('${FONT('800ExtraBold')}')}
@font-face{font-family:J;font-weight:500;src:url('${FONT('500Medium')}')}
*{margin:0;box-sizing:border-box}
body{width:1320px;height:2868px;background:${t.bg};font-family:J;overflow:hidden;position:relative}
.cap{position:absolute;top:190px;left:90px;right:90px;text-align:center}
h1{font-weight:800;font-size:104px;line-height:1.06;letter-spacing:-3px;color:${t.title};text-wrap:balance}
p{font-weight:500;font-size:46px;line-height:1.3;color:${t.sub};margin-top:34px;text-wrap:balance}
.phone{position:absolute;left:50%;transform:translateX(-50%);top:690px;width:972px;height:2070px;border-radius:120px;
  padding:22px;background:#0B0A12;box-shadow:0 0 0 4px ${t.edge},0 60px 120px rgba(20,10,30,.35)}
.phone img,.ph{width:100%;height:100%;border-radius:100px;object-fit:cover;object-position:top;display:block}
.ph{background:#1d1830;color:#9486AE;font-size:60px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.ph span{font-size:40px;font-weight:500;margin-top:16px}
</style></head><body><div class="cap"><h1>${f.title}</h1><p>${f.sub}</p></div><div class="phone">${img}</div></body></html>`;
}

(async () => {
  const frames = JSON.parse(fs.readFileSync(path.join(DIR, 'frames.json'), 'utf8'));
  fs.mkdirSync(path.join(DIR, 'out'), { recursive: true });
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1320, height: 2868 }, deviceScaleFactor: 1 });
  for (const [i, f] of frames.entries()) {
    await p.setContent(page(f), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    const out = path.join(DIR, 'out', `${String(i + 1).padStart(2, '0')}.png`);
    await p.screenshot({ path: out });
    console.log('wrote', path.relative(ROOT, out));
  }
  await browser.close();
})();
