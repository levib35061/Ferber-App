// node render.js a1 [--preview t1,t2,...]
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { V1, V2, V3 } = require('./scenes.js');

const DIR = __dirname;
const vid = process.argv[2];
const preview = process.argv[3] === '--preview' ? process.argv[4].split(',').map(Number) : null;
const SCENES = { a1: V1, a2: V2, a3: V3 }[vid];
const TIMING = JSON.parse(fs.readFileSync(path.join(DIR, 'timing.json'), 'utf8'))[vid];
const AUDIO = path.join(DIR, vid + '.mp3');
const audioDur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', AUDIO]).toString());
const TAIL = 2.0;
const DUR = audioDur + TAIL;
const FPS = 30;
const NUN = '/home/user/Ferber-App/node_modules/@expo-google-fonts/nunito';
const face = (w, d) => `@font-face{font-family:N;font-weight:${w};src:url(file://${NUN}/${d}/Nunito_${d}.ttf)}`;

const css = `
${face(300, '300Light')}${face(400, '400Regular')}${face(600, '600SemiBold')}${face(700, '700Bold')}${face(800, '800ExtraBold')}
:root{--bg:#0A0918;--surface:#16122A;--btn:#1F1A36;--text:#D2C6DE;--dim:#9486AE;--faint:#8377A0;--primary:#A38DC2;--accent:#F2A98B;--accentText:#F7C9B6;--accentDim:#C99583;--dot:#4F4470;--border:#302848}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden;background:var(--bg);font-family:N;color:var(--text)}
#bg{position:absolute;inset:0;background:radial-gradient(1200px 800px at 70% 20%,#1d1638 0%,transparent 60%),radial-gradient(900px 700px at 15% 90%,#2a1a2c 0%,transparent 60%),var(--bg)}
#stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:90px 140px}
.center{display:flex;align-items:center;justify-content:center;text-align:center}
.col{display:flex;flex-direction:column;gap:30px;align-items:center}
.col.left{align-items:flex-start;text-align:left;max-width:720px}
.narrow{max-width:1300px}
.h1{font-weight:800;font-size:104px;line-height:1.08;letter-spacing:-1.5px}
.h2{font-weight:800;font-size:76px;line-height:1.12;letter-spacing:-1px}
.h3{font-weight:600;font-size:44px;line-height:1.3}
.dim{color:var(--dim)}
.small{font-size:30px;font-weight:600}
.pk{color:var(--accent)}
.pill{background:var(--btn);border:2px solid var(--border);color:var(--primary);font-weight:800;font-size:38px;padding:16px 36px;border-radius:999px}
.url{color:var(--accent);font-weight:800;font-size:58px}
.appicon{width:220px;height:220px;border-radius:50px;box-shadow:0 20px 80px rgba(163,141,194,.25)}
.quote{font-weight:800;font-size:84px;line-height:1.2;letter-spacing:-1px}
table.chart{border-collapse:separate;border-spacing:0;font-size:46px;background:var(--surface);border:2px solid var(--border);border-radius:28px;overflow:hidden;font-variant-numeric:tabular-nums}
table.chart th,table.chart td{padding:14px 56px;text-align:center;border-top:2px solid var(--border);transition:none}
table.chart thead th{border-top:0;color:var(--dim);font-size:30px;font-weight:700;background:var(--btn)}
table.chart tbody th{color:var(--dim);font-weight:700}
table.chart tr.on th,table.chart tr.on td{background:#251d40}
table.chart tr.on th{color:var(--text)}
table.chart td.on{color:#1C0D07;background:var(--accent)!important;font-weight:800}
.steps{display:flex;gap:34px;align-items:flex-start;margin-top:30px}
.step{display:flex;flex-direction:column;align-items:center;gap:18px;width:250px;font-size:64px;color:var(--primary);font-weight:800}
.step span{font-size:34px;color:var(--text);font-weight:700;line-height:1.25}
.track3{display:flex;flex-direction:column;gap:20px;width:1100px}
.seg{padding:26px 34px;border-radius:24px;font-size:42px;font-weight:700;text-align:left}
.seg.cry{background:#3a2230;color:var(--accentText)}
.seg.pause{background:var(--btn);color:var(--dim)}
.chips{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;max-width:1400px}
.chip{background:var(--surface);border:2px solid var(--border);font-size:44px;font-weight:700;padding:22px 40px;border-radius:999px}
.flow{display:flex;flex-direction:column;align-items:center;gap:14px}
.arrow{font-size:52px;color:var(--dim)}
.qmarks{display:flex;flex-direction:column;gap:30px;font-size:88px;font-weight:800}
.qmarks span:nth-child(2){color:var(--dim)}
.clock{font-weight:300;font-size:260px;letter-spacing:-4px;color:var(--accentText);text-shadow:0 0 80px rgba(242,169,139,.35)}
.clock small{font-size:90px;font-weight:600}
.bars{display:flex;gap:40px;align-items:flex-end;height:500px}
.barcol{display:flex;flex-direction:column;align-items:center;gap:12px}
.bar{width:110px;border-radius:22px;background:#b98d7f}
.bar.last{background:var(--accent)}
.bv{font-size:38px;font-weight:800}
.bl{font-size:32px;color:var(--dim);font-weight:700;white-space:nowrap}
.split{display:flex;align-items:center;justify-content:center;gap:110px;width:100%;position:relative}
.shot{width:auto;max-width:760px;max-height:820px;border-radius:24px;box-shadow:0 30px 90px rgba(0,0,0,.5)}
/* phone */
.phone{width:410px;height:840px;border-radius:64px;background:#000;padding:14px;box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 3px #2b2440;position:relative;flex:none}
.phone.big{transform:scale(1.12)}
.phone.small{transform:scale(.92)}
.notch{position:absolute;top:26px;left:50%;transform:translateX(-50%);width:110px;height:32px;border-radius:20px;background:#000;z-index:3}
.screen{width:100%;height:100%;border-radius:52px;background:var(--bg);overflow:hidden;position:relative;display:flex;flex-direction:column;padding:62px 22px 26px}
.layer{position:absolute;inset:0;display:flex;flex-direction:column;padding:62px 22px 26px}
.ph-head{display:flex;gap:8px;justify-content:center;align-items:center;color:var(--dim);font-weight:700;font-size:15px;letter-spacing:.6px}
.ph-mid{flex:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
.ph-bot{display:flex;flex-direction:column;gap:6px}
.prow{display:flex;gap:10px}.prow>*{flex:1}
.pbtn{height:74px;border-radius:999px;background:var(--primary);color:var(--bg);font-weight:800;font-size:22px;display:flex;align-items:center;justify-content:center}
.pbtn.sec{background:var(--btn);color:var(--text);font-weight:700;font-size:19px}
.pbtn.wide{flex:1.4}
.pbtn.alert{background:var(--accent);color:#1C0D07;height:82px;font-size:24px}
.pbtn.link{background:none;color:var(--dim);font-weight:700;font-size:16px;height:44px}
.ringwrap{position:relative;width:290px;height:290px;transform:scale(.92)}
.ringwrap.glow{filter:drop-shadow(0 0 28px rgba(242,169,139,.45))}
.ring{position:absolute;inset:0}
.ring .track{fill:none;stroke:var(--btn);stroke-width:10}
.ring .prog{fill:none;stroke-width:10;stroke-linecap:round;transform:rotate(-90deg);transform-origin:145px 145px}
.ringin{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0 30px;text-align:center}
.cap{color:var(--dim);font-weight:600;font-size:17px}
.count{font-weight:300;font-size:72px;line-height:1.1;font-variant-numeric:tabular-nums}
.big{font-weight:300;font-size:46px}
.sub{color:var(--dim);font-size:14px}
.peach{color:var(--accent);font-weight:700}.peachtext{color:var(--accentText)}.peachdim{color:var(--accentDim)}
.dots{display:flex;gap:9px;align-items:center}.dots i{width:10px;height:10px;border-radius:5px;background:var(--primary);display:block}.dots i.e{background:none;border:2px solid var(--dot)}.dots i.p{background:var(--accent)}.dots span{color:var(--dim);font-size:14px;margin-left:4px}
.hint{color:var(--faint);font-size:15px;text-align:center;padding:0 16px}
.duty{align-self:center;display:flex;gap:8px;align-items:center;background:var(--surface);border-radius:999px;padding:8px 14px;margin-top:10px;font-size:13px;color:var(--dim);font-weight:600}
.duty i{width:8px;height:8px;border-radius:4px;background:var(--dot)}.duty i.on{background:var(--primary)}.duty b{color:var(--primary)}
.day{position:absolute;inset:0;background:#FFE6DC;padding:66px 22px;color:#4F2843;font-family:N;display:flex;flex-direction:column;gap:12px}
.dk{color:#6E4560;font-weight:700;font-size:13px}.dh{color:#3B1631;font-weight:800;font-size:25px;line-height:1.15}
.dcard{background:#FFF7F3;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:8px}
.tl{display:flex;height:16px;border-radius:8px;overflow:hidden}.tl i{display:block}
.mo{font-size:14px}.mo b{color:#3B1631;display:inline-block;width:50px}
.dstats{display:flex;gap:8px}.ds{flex:1;background:#FFF7F3;border-radius:18px;padding:12px;display:flex;flex-direction:column}.ds.plum{background:#3B1631;color:#E8C4D6}.ds small{font-size:12px}.ds strong{font-size:26px;color:#3B1631;font-weight:800}.ds.plum strong{color:#fff}.ds em{font-size:11px;font-style:normal;font-weight:700;color:#FFB39F}.ds:not(.plum) em{color:#6E4560}
.ph-prog{padding:20px 6px;display:flex;flex-direction:column;gap:30px}.pt{font-size:22px;font-weight:700;line-height:1.3}
.bars.mini{height:330px;gap:14px}.bars.mini .bar{width:46px;border-radius:12px}.bars.mini .bv{font-size:16px}.bars.mini .bl{font-size:14px}
.tap{position:absolute;width:90px;height:90px;border-radius:50%;border:4px solid rgba(255,255,255,.75);left:calc(50% - 300px);top:68%;opacity:0;pointer-events:none}
.lock{width:410px;height:840px;border-radius:64px;background:linear-gradient(180deg,#1c1530,#0a0918);box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 3px #2b2440;padding:100px 18px;display:flex;flex-direction:column;align-items:center;gap:40px}
.ltime{font-size:96px;font-weight:600;color:#e9e3f2}
.note{width:100%;background:rgba(60,50,80,.85);border-radius:24px;padding:16px 18px;color:#f1ecf7}
.nhead{display:flex;align-items:center;gap:8px;font-size:13px;color:#cfc6dc}.nhead span{margin-left:auto}.nicon{width:22px;height:22px;border-radius:6px}
.nbody{font-size:17px;margin-top:8px;line-height:1.35}
.abs-lock{position:absolute;left:calc(50% - 560px)}
.phone.abs{position:absolute;left:calc(50% - 600px)}
#tag{position:absolute;right:46px;bottom:38px;display:flex;align-items:center;gap:12px;opacity:0;color:var(--dim);font-weight:800;font-size:28px}
#tag img{width:44px;height:44px;border-radius:11px}
`;

const runtime = `
const T = ${JSON.stringify(TIMING)};
const SC = ${JSON.stringify(SCENES)};
const DUR = ${DUR};
const TAG_FROM = ${vid === 'a3' ? 'T[1].start' : 'T[1].start + 1.5'};
const DIGIT = {three:'3',five:'5',ten:'10',twelve:'12',fifteen:'15',nine:'9',forty:'40',one:'1',two:'2'};
const missing = new Set();
function wordTime(line, w, nth) {
  let seen = 0;
  for (const x of line.words) {
    if (x.w === w || x.w === DIGIT[w] || (w.length > 3 && x.w.startsWith(w))) { seen++; if (seen === nth) return x.s; }
  }
  return null;
}
function resolve(spec, line) {
  if (!spec) return line.start;
  for (const part of spec.split(',')) {
    const [kind, a, b] = part.split(':');
    if (kind === 's') return line.start + Number(a);
    if (kind === 'f') return line.start + Number(a) * Math.max(1, line.end - line.start);
    if (kind === 'w') { const t = wordTime(line, a, Number(b || 1)); if (t != null) return t - 0.08; }
  }
  missing.add(spec + ' @' + line.n);
  return line.start + 0.3;
}
let cur = -1;
const stage = document.getElementById('stage');
const ease = (p) => 1 - Math.pow(1 - p, 3);
const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
window.setT = (t) => {
  let k = 0;
  for (let i = 0; i < T.length; i++) if (t >= T[i].start - 0.25) k = i;
  if (k !== cur) {
    cur = k;
    stage.innerHTML = SC[k];
    const line = T[k];
    stage.querySelectorAll('[data-at],[data-hl],[data-show],[data-hide],[data-tap]').forEach((el) => {
      if (el.dataset.at !== undefined) el._at = resolve(el.dataset.at, line);
      if (el.dataset.hl !== undefined) el._hl = resolve(el.dataset.hl, line);
      if (el.dataset.show !== undefined) el._show = resolve(el.dataset.show, line);
      if (el.dataset.hide !== undefined) el._hide = resolve(el.dataset.hide, line);
      if (el.dataset.tap !== undefined) el._tap = resolve(el.dataset.tap, line);
    });
  }
  const line = T[cur];
  const s0 = cur === 0 ? 0 : line.start - 0.25;
  const s1 = cur + 1 < T.length ? T[cur + 1].start - 0.25 : DUR + 10;
  const fin = Math.min(1, (t - s0) / 0.35) * Math.min(1, (s1 - t) / 0.25) * (cur === T.length - 1 ? Math.min(1, (DUR - t) / 0.6) : 1);
  stage.style.opacity = Math.max(0, fin);
  stage.querySelectorAll('[data-at]').forEach((el) => {
    if (el.dataset.count !== undefined || el.dataset.countup !== undefined || el.dataset.ring !== undefined) return;
    const p = ease(Math.max(0, Math.min(1, (t - el._at) / 0.55)));
    el.style.opacity = p;
    el.style.transform = (el.classList.contains('phone') && el.classList.contains('small') ? 'scale(.92) ' : '') + 'translateY(' + (1 - p) * 26 + 'px)';
  });
  stage.querySelectorAll('[data-hl]').forEach((el) => el.classList.toggle('on', t >= el._hl));
  stage.querySelectorAll('[data-show]').forEach((el) => (el.style.visibility = t >= el._show ? 'visible' : 'hidden'));
  stage.querySelectorAll('[data-hide]').forEach((el) => { if (t >= el._hide) el.style.visibility = 'hidden'; });
  stage.querySelectorAll('[data-count]').forEach((el) => (el.textContent = fmt(Math.max(0, Number(el.dataset.count) - Math.max(0, t - el._at)))));
  stage.querySelectorAll('[data-countup]').forEach((el) => (el.textContent = fmt(Math.max(0, t - el._at))));
  stage.querySelectorAll('[data-ring]').forEach((el) => {
    const p = Math.min(1, Math.max(0, t - el._at) / Number(el.dataset.ring));
    el.style.strokeDashoffset = ${2 * Math.PI * 128} * (1 - p);
  });
  stage.querySelectorAll('[data-tap]').forEach((el) => {
    const d = t - el._tap;
    el.style.opacity = d > 0 && d < 0.6 ? 1 - d / 0.6 : 0;
    el.style.transform = 'scale(' + (0.6 + Math.max(0, d) * 0.8) + ')';
  });
  const tag = document.getElementById('tag');
  tag.style.opacity = t > TAG_FROM && cur < T.length - 1 ? Math.min(1, (t - TAG_FROM) / 0.6) * Math.min(1, (s1 - t) / 0.25 + (cur < T.length - 2 ? 1 : 0)) : 0;
  window.__missing = [...missing];
};
`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div id="bg"></div><div id="stage"></div><div id="tag"><img src="icon.png">Check In</div><script>${runtime}</script></body></html>`;
fs.writeFileSync(path.join(DIR, vid + '.html'), html);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(DIR, vid + '.html'));
  await page.evaluate(() => document.fonts.ready);
  if (preview) {
    for (const t of preview) {
      await page.evaluate((x) => window.setT(x), t);
      await page.screenshot({ path: path.join(DIR, `prev-${vid}-${t}.png`) });
    }
    console.log('missing', await page.evaluate(() => window.__missing));
    await browser.close();
    return;
  }
  const out = path.join(DIR, vid + '.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', AUDIO, '-af', `apad=pad_dur=${TAIL}`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.ceil(DUR * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((x) => window.setT(x), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  console.log('missing', await page.evaluate(() => window.__missing));
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log('wrote', out);
})();
