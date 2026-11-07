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
    pick()  { if (ready()) tone({ type: 'triangle', from: 520, to: 640, gain: 0.14, decay: 0.12 }); },
    stamp() { if (ready()) { noise({ type: 'lowpass', freq: 380, gain: 0.3, decay: 0.16 });
                             tone({ type: 'sine', from: 140, to: 70, gain: 0.3, decay: 0.2 }); } },
    right() { if (ready()) [659.25, 830.61, 987.77].forEach((f, i) => tone({ from: f, gain: 0.17, decay: 0.4, delay: i * 0.07 })); },
    wrong() { if (ready()) { tone({ type: 'sawtooth', from: 230, to: 96, gain: 0.15, decay: 0.38 });
                             noise({ type: 'lowpass', freq: 420, gain: 0.1, decay: 0.2 }); } },
    win()   { if (ready()) [392, 494, 587, 784, 988].forEach((f, i) => tone({ from: f, gain: 0.16, decay: 0.5, delay: i * 0.11 })); },
    over()  { if (ready()) [392, 330, 262, 196].forEach((f, i) => tone({ type: 'triangle', from: f, to: f * 0.7, gain: 0.18, decay: 0.55, delay: i * 0.17 })); }
  };
})(window);
