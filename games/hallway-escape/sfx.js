/* ═══════════════════════════════════════════════════════════
   SFX — synthesised. No audio files.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  let ctx = null, master = null, nb = null, muted = false;

  function init() {
    if (ctx) return true;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.85; master.connect(ctx.destination);
    const len = ctx.sampleRate; nb = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  function ready() { if (!init()) return false; if (ctx.state === 'suspended') ctx.resume(); return !muted; }

  function tone(o) {
    const osc = ctx.createOscillator(); osc.type = o.type || 'sine';
    const t = ctx.currentTime + (o.delay || 0);
    osc.frequency.setValueAtTime(o.from || 440, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.decay || 0.2));
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (o.decay || 0.2));
    osc.connect(g).connect(master); osc.start(t); osc.stop(t + (o.decay || 0.2) + 0.03);
  }
  function noise(o) {
    const s = ctx.createBufferSource(); s.buffer = nb;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass';
    f.frequency.value = o.freq || 1400; f.Q.value = o.q || 1;
    const g = ctx.createGain(); const t = ctx.currentTime;
    g.gain.setValueAtTime(o.gain || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (o.decay || 0.08));
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + (o.decay || 0.08) + 0.02);
  }

  global.SFX = {
    mute(v) { muted = v; if (master) master.gain.value = v ? 0 : 0.85; },
    unlock() { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
    jump()  { if (ready()) tone({ type: 'square', from: 320, to: 620, gain: 0.07, decay: 0.16 }); },
    coin()  { if (ready()) { tone({ type: 'square', from: 988, gain: 0.07, decay: 0.07 });
                             tone({ type: 'square', from: 1319, gain: 0.07, decay: 0.16, delay: 0.07 }); } },
    biscuit() { if (ready()) [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', from: f, gain: 0.13, decay: 0.18, delay: i * 0.05 })); },
    hurt()  { if (ready()) { tone({ type: 'sawtooth', from: 330, to: 80, gain: 0.16, decay: 0.32 });
                             noise({ type: 'lowpass', freq: 500, gain: 0.12, decay: 0.2 }); } },
    trip()  { if (ready()) tone({ type: 'triangle', from: 260, to: 140, gain: 0.14, decay: 0.2 }); },
    power() { if (ready()) [392, 494, 587, 784, 988].forEach((f, i) => tone({ type: 'square', from: f, gain: 0.07, decay: 0.12, delay: i * 0.06 })); },
    fall()  { if (ready()) tone({ type: 'sine', from: 700, to: 90, gain: 0.16, decay: 0.55 }); },
    creak() { if (ready()) { tone({ type: 'sawtooth', from: 150, to: 90, gain: 0.05, decay: 0.3 });
                             noise({ type: 'bandpass', freq: 700, q: 6, gain: 0.05, decay: 0.28 }); } },
    slide() { if (ready()) noise({ type: 'highpass', freq: 1800, gain: 0.08, decay: 0.22 }); },
    dodge() { if (ready()) tone({ type: 'triangle', from: 880, to: 1175, gain: 0.07, decay: 0.12 }); },
    alert() { if (ready()) tone({ type: 'sine', from: 880, gain: 0.04, decay: 0.07 }); },
    win()   { if (ready()) [392, 494, 587, 784, 988, 1175].forEach((f, i) => tone({ from: f, gain: 0.16, decay: 0.45, delay: i * 0.1 })); },
    over()  { if (ready()) [392, 311, 262, 175].forEach((f, i) => tone({ type: 'triangle', from: f, to: f * 0.6, gain: 0.2, decay: 0.55, delay: i * 0.17 })); }
  };
})(window);
