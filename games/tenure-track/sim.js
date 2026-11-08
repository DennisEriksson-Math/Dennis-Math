/* Balance simulation for Tenure Track: `node sim.js [runs]`.
   It plays the real rules (model.js) with a few strategies and prints how often each
   gets tenure. Re-run it after changing anything in CFG, PERKS, PROFILES or EVENTS. */
'use strict';
const M = require('./model.js');
const RUNS = Number(process.argv[2]) || 2000;
const { CFG, COLUMNS } = M;
if (process.env.CFG) { const o = JSON.parse(process.env.CFG); Object.keys(o).forEach((k) => { if (typeof o[k] === 'object') Object.assign(CFG[k], o[k]); else CFG[k] = o[k]; }); }   // e.g. CFG='{"HOURS":7}' node sim.js
const N = CFG.NEED;
const pick = (a) => a[(Math.random() * a.length) | 0];

// How much a change to a column is worth to a player who is paying attention.
function weights(S) {
  const w = {};
  COLUMNS.forEach((k) => { const gap = N[k] - S[k]; w[k] = gap > 0 ? 1 + gap / N[k] : 0.3; });
  w.energy = S.energy < 45 ? 1.0 : 0.35;
  return w;
}
function value(S, f) { const w = weights(S); return Object.keys(f).reduce((n, k) => n + f[k] * (w[k] || 0), 0); }

function allocAdaptive(S) {
  const a = { research: 0, teaching: 0, service: 0, standing: 0, rest: 0 };
  a.rest = S.energy < 30 ? 3 : S.energy < 50 ? 2 : 1;
  if (S.sem >= CFG.SEMESTERS - 1 && S.energy > 45) a.rest = 0;
  const proj = {}; COLUMNS.forEach((k) => { proj[k] = S[k]; });
  for (let h = a.rest; h < CFG.HOURS; h++) {
    let best = COLUMNS[0], bestR = Infinity;
    COLUMNS.forEach((k) => { const r = proj[k] / N[k]; if (r < bestR) { bestR = r; best = k; } });
    a[best]++; proj[best] += CFG.GAIN[best] * S.mods.gain[best];
  }
  return a;
}
function allocFixed(rest) {
  return () => {
    const a = { research: 0, teaching: 0, service: 0, standing: 0, rest: rest };
    const order = ['research', 'teaching', 'research', 'service', 'teaching', 'standing', 'research', 'service'];
    for (let h = 0; h < CFG.HOURS - rest; h++) a[order[h % order.length]]++;
    return a;
  };
}
function allocRandom() {
  const a = { research: 0, teaching: 0, service: 0, standing: 0, rest: 0 };
  const k = ['research', 'teaching', 'service', 'standing', 'rest'];
  for (let h = 0; h < CFG.HOURS; h++) a[pick(k)]++;
  return a;
}

const STRATS = {
  'Adaptive, reads the meters and the arrangements': { alloc: allocAdaptive, choice: 'smart', perk: 'smart' },
  'Adaptive hours, takes the first option every time': { alloc: allocAdaptive, choice: 'first', perk: 'first' },
  'Fixed 3/2/1/1/1 and rest 1': { alloc: allocFixed(1), choice: 'first', perk: 'first' },
  'Fixed, rests two hours': { alloc: allocFixed(2), choice: 'first', perk: 'first' },
  'Never rests': { alloc: allocFixed(0), choice: 'first', perk: 'first' },
  'Rests three hours a semester': { alloc: allocFixed(3), choice: 'first', perk: 'first' },
  'Random hours, random choices': { alloc: allocRandom, choice: 'random', perk: 'random' }
};

function perkScore(S, p) {
  const w = weights(S); let v = 0;
  Object.keys(p.passive || {}).forEach((k) => { v += p.passive[k] * (w[k] || 0); });
  Object.keys(p.gain || {}).forEach((k) => { v += (p.gain[k] - 1) * 8 * (w[k] || 0); });
  Object.keys(p.decay || {}).forEach((k) => { v += (1 - p.decay[k]) * 2.5 * (w[k] || 0); });
  if (p.rest) v += (p.rest - 1) * 3; if (p.work) v += (1 - p.work) * 5;
  return v;
}

function play(strat) {
  const S = M.newState(pick(M.PROFILES).id);
  for (; S.sem <= CFG.SEMESTERS; S.sem++) {
    if (M.yearStarts(S)) {
      const o = M.offers(S);
      const p = strat.perk === 'smart' ? o.slice().sort((x, y) => perkScore(S, y) - perkScore(S, x))[0] : strat.perk === 'random' ? pick(o) : o[0];
      M.takePerk(S, p.id);
    }
    M.fileSemester(S, strat.alloc(S));
    if (S.energy <= 0) return 'burnout';
    const ev = M.pickEvent(S);
    const ch = strat.choice === 'smart' ? ev.c.slice().sort((x, y) => value(S, y.f) - value(S, x.f))[0] : strat.choice === 'random' ? pick(ev.c) : ev.c[0];
    M.applyEffects(S, ch.f);
    if (S.energy <= 0) return 'burnout';
  }
  const v = M.verdict(S);
  return v.tenure ? 'tenure' : v.met >= 3 ? 'three' : 'less';
}

console.log('Runs per strategy: ' + RUNS + '\n');
console.log('Strategy'.padEnd(52) + 'Tenure  Three of four  Fewer  Burnout');
Object.keys(STRATS).forEach((name) => {
  const c = { tenure: 0, three: 0, less: 0, burnout: 0 };
  for (let i = 0; i < RUNS; i++) c[play(STRATS[name])]++;
  const pc = (n) => (Math.round(1000 * n / RUNS) / 10).toFixed(1).padStart(5) + '%';
  console.log(name.padEnd(52) + pc(c.tenure) + '  ' + pc(c.three).padStart(12) + '  ' + pc(c.less) + '  ' + pc(c.burnout));
});
