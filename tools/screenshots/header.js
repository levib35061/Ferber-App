/**
 * App Store product-page header image: 3840 × 1646.
 *   node tools/screenshots/header.js  → docs/app-store-screenshots/header-3840x1646.png
 * Uses tools/screenshots/shots/1.png (night screen) and 2.png (lock screen).
 * Apple crops the edges on some devices, so the text and phones stay in the middle.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString('base64');
const FONT = (w) => `data:font/ttf;base64,${b64(`node_modules/@expo-google-fonts/plus-jakarta-sans/${w}/PlusJakartaSans_${w}.ttf`)}`;
const img = (p) => `data:image/png;base64,${b64(p)}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:J;font-weight:800;src:url('${FONT('800ExtraBold')}')}
@font-face{font-family:J;font-weight:500;src:url('${FONT('500Medium')}')}
*{margin:0;box-sizing:border-box}
body{width:3840px;height:1646px;overflow:hidden;font-family:J;position:relative;
  background:radial-gradient(60% 90% at 70% 40%,#3A2D63 0%,#1E1838 45%,#0A0918 100%)}
.stars i{position:absolute;width:6px;height:6px;border-radius:50%;background:#D2C6DE;opacity:.35}
.text{position:absolute;left:820px;top:430px;width:1250px}
.icon{width:210px;height:210px;border-radius:48px;box-shadow:0 30px 80px rgba(0,0,0,.45)}
h1{font-weight:800;font-size:150px;letter-spacing:-5px;color:#F1E9F7;margin-top:56px;line-height:1}
h2{font-weight:800;font-size:76px;letter-spacing:-2px;color:#F2A98B;margin-top:26px}
p{font-weight:500;font-size:50px;color:#B9AACF;margin-top:40px;line-height:1.35}
.phone{position:absolute;width:560px;height:1200px;border-radius:84px;padding:16px;background:#0B0A12;
  box-shadow:0 0 0 4px #2B2445,0 60px 140px rgba(0,0,0,.55)}
.phone img{width:100%;height:100%;border-radius:70px;object-fit:cover;object-position:top;display:block}
.p1{left:2160px;top:250px;transform:rotate(-5deg)}
.p2{left:2620px;top:200px;transform:rotate(4deg)}
</style></head><body>
<div class="stars">${Array.from({ length: 40 }, (_, i) => `<i style="left:${(i * 977) % 3840}px;top:${(i * 389) % 1646}px;opacity:${0.15 + (i % 5) * 0.08}"></i>`).join('')}</div>
<div class="text">
  <img class="icon" src="${img('assets/icon.png')}">
  <h1>Check In</h1>
  <h2>Ferber Method Sleep Training</h2>
  <p>A calm check-in timer for 2am.<br>Pay once. No ads, no tracking.</p>
</div>
<div class="phone p1"><img src="${img('tools/screenshots/shots/1.png')}"></div>
<div class="phone p2"><img src="${img('tools/screenshots/shots/2.png')}"></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 3840, height: 1646 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = path.join(ROOT, 'docs/app-store-screenshots/header-3840x1646.png');
  await page.screenshot({ path: out });
  console.log('wrote', path.relative(ROOT, out));
  await browser.close();
})();
