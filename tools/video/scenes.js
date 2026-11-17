// Scene builders for the three videos. Each scene is the HTML shown while one
// script line is spoken. Timing attributes are resolved by the page runtime:
//   data-at="w:three"     appear when the word "three" is spoken (w:three:2 = 2nd time)
//   data-at="f:0.5"       halfway through the line,  data-at="s:1.2"  1.2 s in
//   data-hl="..."         add class "on" from that moment
//   data-show / data-hide display from / until that moment (no animation)
//   data-count="180"      count down from 3:00 starting at its data-at time
//   data-countup          count up from 0:00
//   data-ring="300"       progress ring filling over that many seconds
const CHART = [[3, 5, 10], [5, 10, 12], [10, 12, 15], [12, 15, 17], [15, 17, 20], [17, 20, 25], [20, 25, 30]];
const NUMW = { 3: 'three', 5: 'five', 10: 'ten', 12: 'twelve', 15: 'fifteen', 17: 'seventeen', 20: 'twenty', 25: 'twentyfive', 30: 'thirty' };

const MOON = (size = 64, color = 'var(--primary)') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
const ICON = `<img class="appicon" src="icon.png">`;

const title = (big, small, at = 's:0.2') =>
  `<div class="center col"><div class="h1" data-at="${at}">${big}</div>${small ? `<div class="h3 dim" data-at="s:0.8">${small}</div>` : ''}</div>`;
const statement = (big, small, atSmall = 'f:0.45') =>
  `<div class="center col narrow"><div class="h2" data-at="s:0.15">${big}</div>${small ? `<div class="h3 dim" data-at="${atSmall}">${small}</div>` : ''}</div>`;
const madeBy = (line) =>
  `<div class="center col">${ICON.replace('<img', '<img data-at="s:0.1"')}<div class="pill" data-at="w:parent">Made by a parent</div><div class="h3 dim" data-at="w:check">${line}</div></div>`;

function chart({ highlight = [], show = 'all', firstCol = null } = {}) {
  const rows = CHART.map((r, i) => {
    const n = i + 1;
    const hl = highlight.find((h) => h.row === n);
    const rowAt = show === 'all' ? `s:${0.15 + i * 0.12}` : show[i] || 's:0';
    const cells = r
      .map((m, c) => {
        let attr = '';
        if (hl && hl.cells && hl.cells[c]) attr = ` data-hl="${hl.cells[c]}"`;
        if (firstCol && c === 0) attr = ` data-hl="${firstCol}"`;
        return `<td class="num"${attr}>${m}</td>`;
      })
      .join('');
    const rowHl = hl && hl.row ? ` data-hl="${hl.at || 's:0'}"` : '';
    return `<tr data-at="${rowAt}"${rowHl}><th>${n === 7 ? '7 +' : n}</th>${cells}</tr>`;
  });
  return `<table class="chart"><thead><tr><th>Night</th><th>1st wait</th><th>2nd wait</th><th>3rd + after</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

function bars(values, { labels, at = (i) => `s:${0.3 + i * 0.25}`, note = '', last = true, max, h = 380 } = {}) {
  const m = max || Math.max(...values);
  return `<div class="bars">${values
    .map(
      (v, i) =>
        `<div class="barcol" data-at="${at(i)}"><div class="bv">${v}</div><div class="bar${last && i === values.length - 1 ? ' last' : ''}" style="height:${Math.max(10, (v / m) * h)}px"></div><div class="bl">${labels ? labels[i] : i + 1}</div></div>`,
    )
    .join('')}</div>${note ? `<div class="small dim" data-at="f:0.5">${note}</div>` : ''}`;
}

// ---------- phone replicas of Check In ----------
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const C = 2 * Math.PI * 128;
const ring = (inner, { progress = 0, ringAttr = '', color = 'var(--primary)', glow = false } = {}) =>
  `<div class="ringwrap${glow ? ' glow' : ''}"><svg width="290" height="290" class="ring"><circle cx="145" cy="145" r="128" class="track" ${color === 'var(--accent)' ? 'style="stroke:var(--accent)"' : ''}/><circle cx="145" cy="145" r="128" class="prog" style="stroke:${color};stroke-dasharray:${C};stroke-dashoffset:${C * (1 - progress)}" ${ringAttr}/></svg><div class="ringin">${inner}</div></div>`;
const header = (txt = 'AVA · NIGHT 1') => `<div class="ph-head">${MOON(16, 'var(--dim)')}<span>${txt}</span></div>`;
const btn = (label, kind = '', attr = '') => `<div class="pbtn ${kind}" ${attr}>${label}</div>`;

const screens = {
  idle: () =>
    `${header()}<div class="ph-mid">${ring(`${MOON(52)}<div class="cap">Ready when you are</div>`)}</div><div class="ph-bot">${btn('Down for the night')}${btn('Night waking', 'link')}</div>`,
  quiet: () =>
    `${header()}<div class="ph-mid">${ring(`${MOON(38)}<div class="big">Settling</div><div class="sub">No timer until they cry</div>`)}<div class="dots"><i class="e"></i></div></div><div class="ph-bot">${btn('Night feed', 'link')}<div class="prow">${btn('Asleep', 'sec')}${btn('Crying', 'wide')}</div></div>`,
  waiting: (n, secs, at, night = 'AVA · NIGHT 1', done = 0) =>
    `${header(night)}<div class="ph-mid">${ring(`<div class="cap">Check-in #${n} in</div><div class="count" data-count="${secs}" data-at="${at}">${fmt(secs)}</div><div class="sub">of ${secs / 60} min</div>`, { ringAttr: `data-ring="${secs}" data-at="${at}"` })}<div class="dots">${'<i></i>'.repeat(done)}<i class="e"></i><span>crying ${done * 3} min</span></div></div><div class="ph-bot"><div class="prow">${btn('Stopped crying', 'link')}${btn('Night feed', 'link')}</div><div class="prow">${btn('Going in', 'sec')}${btn('Asleep', 'wide')}</div></div>`,
  due: (n) =>
    `${header()}<div class="ph-mid">${ring(`<div class="cap peach">Time to check in</div><div class="count peachtext">#${n}</div><div class="sub peachdim">due 0:04 ago</div>`, { progress: 1, color: 'var(--accent)', glow: true })}<div class="dots"><i class="p"></i><span>crying 3 min</span></div></div><div class="ph-bot">${btn("I'm going in", 'alert')}<div class="prow">${btn('Wait a little longer', 'link')}${btn('Asleep', 'link')}</div></div>`,
  inroom: (at) =>
    `${header()}<div class="ph-mid">${ring(`<div class="cap">In the room</div><div class="count" data-countup data-at="${at}">0:00</div><div class="sub">check-in #1</div>`, { ringAttr: `data-ring="120" data-at="${at}"` })}<div class="hint">A pat and a few soft words, then out.</div></div><div class="ph-bot">${btn('Back out')}${btn('Asleep', 'link')}</div>`,
  duty: (me) =>
    `${header('AVA · NIGHT 3')}<div class="duty"><i class="${me ? 'on' : ''}"></i><span>${me ? "You're on duty tonight" : 'Partner is on duty · alerts off here'}</span><b>${me ? 'Hand off' : 'Take over'}</b></div><div class="ph-mid">${ring(`<div class="cap">Check-in #2 in</div><div class="count">7:41</div><div class="sub">of 12 min</div>`, { progress: 0.36 })}</div><div class="ph-bot"><div class="prow">${btn('Going in', 'sec')}${btn('Asleep', 'wide')}</div></div>`,
  today: () =>
    `<div class="day"><div class="dk">Good morning · Night 5</div><div class="dh">Ava fell asleep after 8 minutes of crying, and slept through.</div><div class="dcard"><div class="tl"><i style="flex:.6;background:#FF5A3C"></i><i style="flex:.3;background:#EAD3DD"></i><i style="flex:9;background:#3B1631"></i></div><div class="mo"><b>7:02</b> Down for the night</div><div class="mo"><b>7:05</b> Started crying</div><div class="mo"><b>7:13</b> Asleep</div></div><div class="dstats"><div class="ds plum"><small>Total crying</small><strong>8 min</strong><em>10 less than night 4</em></div><div class="ds"><small>Tonight, night 6</small><strong>17 min</strong><em>first wait</em></div></div></div>`,
  progress: () =>
    `${header('PROGRESS')}<div class="ph-prog"><div class="pt">Crying time is down 81% since night 1.</div>${bars([43, 51, 30, 18, 8], { at: (i) => `s:${0.2 + i * 0.15}`, max: 51, h: 220 }).replace('class="bars"', 'class="bars mini"')}</div>`,
  woke: () =>
    `${header('AVA · NIGHT 2')}<div class="ph-mid">${ring(`<div class="cap">Check-in #1 in</div><div class="count">4:52</div><div class="sub">of 5 min</div>`, { progress: 0.03 })}<div class="hint">Middle-of-the-night wakings are the hardest part. Same plan as bedtime.</div></div><div class="ph-bot"><div class="prow">${btn('Going in', 'sec')}${btn('Asleep', 'wide')}</div></div>`,
};
const phone = (inner, cls = '', attr = '') => `<div class="phone ${cls}" ${attr}><div class="notch"></div><div class="screen">${inner}</div></div>`;
// Two states in one phone: `a` until the word, then `b`.
const phoneSwitch = (a, b, when, cls = '') =>
  `<div class="phone ${cls}"><div class="notch"></div><div class="screen"><div class="layer" data-hide="${when}">${a}</div><div class="layer" data-show="${when}">${b}</div></div></div>`;
const tap = (when) => `<div class="tap" data-tap="${when}"></div>`;
const lockNote = (at) =>
  `<div class="lock" data-at="${at}"><div class="ltime">7:43</div><div class="note"><div class="nhead">${ICON.replace('appicon', 'nicon')}<b>CHECK IN</b><span>now</span></div><div class="nbody"><b>Time to check in</b><br>Check-in #1, night 1</div></div></div>`;
const caption = (txt, at = 's:0.3') => `<div class="sidecap" data-at="${at}">${txt}</div>`;
const endCard = (line2) =>
  `<div class="center col">${ICON.replace('<img', '<img data-at="s:0.1"')}<div class="h2" data-at="s:0.4">Check In: Baby Sleep Timer</div><div class="h3 dim" data-at="s:0.7">${line2}</div><div class="url" data-at="s:1.0">ferbertimer.com</div></div>`;

const checkInCard = () =>
  `<div class="center col narrow"><div class="h2" data-at="s:0.1">A check-in is short</div><div class="chips"><div class="chip" data-at="w:one">1 to 2 minutes</div><div class="chip" data-at="w:pat">A pat</div><div class="chip" data-at="w:calm">Calm words</div><div class="chip" data-at="w:leave,w:out">Then leave</div></div></div>`;

const V1 = [
  title('How long do I wait<br>before I go in?', 'The Ferber chart, night by night'),
  madeBy('I built Check In, a timer for this'),
  `<div class="center col"><div class="h2" data-at="s:0.1">The idea</div><div class="steps"><div class="step" data-at="w:down">${MOON(54)}<span>Put them down awake</span></div><div class="step" data-at="w:leave"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6v18h8"/><path d="M14 12h7"/><path d="M18 9l3 3-3 3"/></svg><span>Leave the room</span></div><div class="step" data-at="w:wait"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M9 2h6"/></svg><span>If they cry, wait</span></div><div class="step" data-at="w:check"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg><span>Short check-in</span></div><div class="step" data-at="w:longer"><svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l6-6 4 4 6-8"/><path d="M15 8h5v5"/></svg><span>Waits grow</span></div></div></div>`,
  `<div class="center col">${chart({})}</div>`,
  `<div class="center col">${chart({ show: CHART.map(() => 's:0'), highlight: [{ row: 1, at: 's:0', cells: ['w:three', 'w:five', 'w:ten'] }] })}</div>`,
  `<div class="center col">${chart({ show: CHART.map(() => 's:0'), highlight: [{ row: 2, at: 's:0', cells: ['w:five', 'w:ten', 'w:twelve'] }] })}</div>`,
  `<div class="center col">${chart({ show: CHART.map(() => 's:0'), highlight: [{ row: 3, at: 's:0', cells: ['w:ten', 'w:twelve', 'w:fifteen'] }] })}</div>`,
  `<div class="center col">${chart({ show: CHART.map(() => 's:0'), highlight: [4, 5, 6, 7].map((row, i) => ({ row, at: `f:${0.1 + i * 0.12}` })) })}<div class="h3 dim" data-at="w:after">After night 7, keep using the last row</div></div>`,
  `<div class="center col narrow"><div class="h2" data-at="s:0.1">Only count crying</div><div class="track3"><div class="seg cry" data-at="w:crying">Crying · counting</div><div class="seg pause" data-at="w:stops">Quiet · paused</div><div class="seg cry" data-at="w:again">Crying again · same wait restarts</div></div></div>`,
  checkInCard(),
  `<div class="center col narrow"><div class="quote" data-at="s:0.2">“You're there to <span class="pk">reassure</span>,<br>not to stop the crying.”</div></div>`,
  `<div class="center col"><div class="h2" data-at="s:0.1">What to expect</div>${bars([45, 52, 36, 22, 15, 10, 8], { at: (i) => `f:${0.05 + i * 0.07}`, note: 'Illustration: night 2 or 3 is often the hardest' })}</div>`,
  `<div class="center col"><div class="h2" data-at="s:0.1">Minutes of crying</div>${bars([43, 9], { labels: ['Night 1', 'A week later'], at: (i) => (i ? 'w:nine' : 'w:forty'), max: 43 })}<div class="small dim" data-at="w:survey">One survey of 652 parents (Honaker et al., 2018)</div></div>`,
  statement('Consistency beats<br>perfect numbers', 'Shorter waits are fine. Grow them slowly.', 'w:matters'),
  `<div class="split"><img class="shot" src="chart-sheet.png" data-at="s:0.2"><div class="col left"><div class="h2" data-at="s:0.4">Free printable chart</div><div class="url" data-at="w:ferber">ferbertimer.com</div></div></div>`,
  `<div class="split">${phone(screens.waiting(2, 300, 's:0.3', 'AVA · NIGHT 1', 1), '', 'data-at="s:0.1"')}<div class="col left"><div class="h2" data-at="s:0.4">Check In</div><div class="h3 dim" data-at="w:alerts">Times every wait.<br>Alerts you on the lock screen.</div><div class="pill" data-at="f:0.7">On the App Store</div></div></div>`,
  endCard('Good luck tonight'),
];

const V2 = [
  `<div class="center col"><div class="clock" data-at="s:0.1">2:00 <small>AM</small></div><div class="h3 dim" data-at="w:crying">Crying again. What now?</div></div>`,
  madeBy('I built Check In, a timer for this'),
  statement('Treat it like bedtime', 'Same night, same chart', 'w:same'),
  `<div class="center col">${chart({ show: CHART.map(() => 's:0'), firstCol: 'w:first' })}<div class="h3 dim" data-at="w:first:2">Start again at the first wait</div></div>`,
  `<div class="center col">${chart({ show: CHART.map(() => 's:0'), highlight: [{ row: 2, at: 's:0', cells: ['w:five', 'w:ten', 'w:twelve'] }] })}</div>`,
  statement('Wait for real crying', 'A little fussing often settles on its own', 'w:settle'),
  checkInCard(),
  `<div class="center col"><div class="h3 dim" data-at="s:0.1">The hardest part at 2am: doubt</div><div class="qmarks"><span data-at="w:hungry">Hungry?</span><span data-at="w:wrong">Is something wrong?</span></div></div>`,
  `<div class="center col narrow"><div class="flow"><div class="chip" data-at="w:feed">Feed, if your pediatrician says so</div><div class="arrow" data-at="w:then">↓</div><div class="chip" data-at="w:awake">Back down awake</div><div class="arrow" data-at="w:cry">↓</div><div class="chip" data-at="w:first">Waits start again from the first</div></div></div>`,
  statement('Sick? Comfort first.', "Pick the plan back up when they're well", 'w:pick'),
  `<div class="split">${phone(screens.duty(true), 'small', 'data-at="w:partner"')}${phone(screens.duty(false), 'small', 'data-at="w:turn"')}<div class="col left"><div class="h2" data-at="w:daylight">Decide in daylight</div><div class="h3 dim" data-at="w:turn">Who's on duty tonight?</div></div></div>`,
  `<div class="center col narrow"><div class="quote" data-at="s:0.2">Crying after a check-in<br>is <span class="pk">normal</span>.</div></div>`,
  `<div class="center col"><div class="h2" data-at="s:0.1">Night wakings over a week</div>${bars([3, 4, 3, 2, 2, 1, 1], { at: (i) => `f:${0.05 + i * 0.08}`, note: 'Illustration', labels: ['1', '2', '3', '4', '5', '6', '7'] })}</div>`,
  `<div class="split"><img class="shot" src="web-timer.png" data-at="s:0.2" data-hide="w:app">${phone(screens.woke(), 'abs', 'data-show="w:app"')}<div class="col left"><div class="h2" data-at="s:0.4">Free web timer</div><div class="url" data-at="w:ferber">ferbertimer.com</div><div class="pill" data-at="w:app">Check In for iPhone</div></div></div>`,
  endCard('The nights do get shorter'),
];

const V3 = [
  `<div class="center col">${ICON.replace('<img', '<img data-at="s:0.1"')}<div class="pill" data-at="w:built">Made by a parent</div><div class="h3 dim" data-at="w:wanted">The timer I wanted at 2am</div></div>`,
  `<div class="center col"><div class="h1" data-at="s:0.1">Check In</div><div class="h3 dim" data-at="w:night">A night with it</div></div>`,
  `<div class="split">${phoneSwitch(screens.idle(), screens.quiet(), 'w:nothing')}${tap('w:tap')}<div class="col left"><div class="h2" data-at="w:down">Down for the night</div><div class="h3 dim" data-at="w:settle">No timer until they cry</div></div></div>`,
  `<div class="split">${phoneSwitch(screens.quiet(), screens.waiting(1, 180, 'w:now'), 'w:now')}${tap('w:crying')}<div class="col left"><div class="h2" data-at="w:crying">Crying</div><div class="h3 dim" data-at="w:chart">Counts down to your first check-in</div></div></div>`,
  `<div class="split">${phone(screens.waiting(1, 180, 's:-6'), 'big')}<div class="col left"><div class="h2" data-at="w:dark">Dark and dim</div><div class="h3 dim" data-at="w:buttons">Big buttons you can hit half-asleep</div></div></div>`,
  `<div class="split">${phone(screens.due(1), '', 'data-hide="w:locked"')}<div class="abs-lock" data-show="w:locked">${lockNote('w:locked')}</div><div class="col left"><div class="h2" data-at="s:0.2">Time to check in</div><div class="h3 dim" data-at="w:locked">Even with your phone locked</div><div class="h3 dim" data-at="w:soft">Soft sound, or vibrate only</div></div></div>`,
  `<div class="split">${phoneSwitch(screens.inroom('s:0'), screens.waiting(2, 300, 'w:next', 'AVA · NIGHT 1', 1), 'w:next')}${tap('w:back')}<div class="col left"><div class="h2" data-at="w:going">Going in · Back out</div><div class="h3 dim" data-at="w:longer">The next wait is a little longer</div></div></div>`,
  `<div class="center col narrow"><div class="chips"><div class="chip" data-at="w:stop">Stopped crying → timer pauses</div><div class="chip" data-at="w:wake">Woke up at 2am → first wait again</div></div></div>`,
  `<div class="split">${phone(screens.duty(true), 'small', 'data-at="w:both"')}${phone(screens.duty(false), 'small', 'data-at="w:duty"')}<div class="col left"><div class="h2" data-at="w:both">Both phones</div><div class="h3 dim" data-at="w:duty">Only the parent on duty gets alerts</div></div></div>`,
  `<div class="split">${phone(screens.today(), 'small', 'data-at="s:0.1"')}${phone(screens.progress(), 'small', 'data-at="w:chart"')}<div class="col left"><div class="h2" data-at="w:morning">See it working</div><div class="h3 dim" data-at="w:chart">Morning summary and progress</div></div></div>`,
  `<div class="center col"><div class="h3 dim" data-at="w:free">Free for your first 2 nights</div><div class="h1" data-at="f:0.25">$4.99 once</div><div class="h3" data-at="w:covers">One purchase covers both parents</div><div class="chips"><div class="chip" data-at="w:subscription">No subscription</div><div class="chip" data-at="w:ads">No ads</div><div class="chip" data-at="w:tracking">No tracking</div></div></div>`,
  endCard('On the App Store'),
];

module.exports = { V1, V2, V3 };
