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
    deal()  { if (ready()) noise({ type: 'highpass', freq: 1800, gain: 0.13, decay: 0.13 }); },
    right() { if (ready()) [659.25, 987.77].forEach((f, i) => tone({ from: f, gain: 0.19, decay: 0.34, delay: i * 0.06 })); },
    wrong() { if (ready()) { tone({ type: 'sawtooth', from: 240, to: 92, gain: 0.17, decay: 0.34 });
                             noise({ type: 'lowpass', freq: 420, gain: 0.13, decay: 0.22 }); } },
    tick()  { if (ready()) tone({ type: 'square', from: 1250, gain: 0.045, decay: 0.035 }); },
    over()  { if (ready()) [392, 311, 262, 175].forEach((f, i) => tone({ type: 'triangle', from: f, to: f * 0.6, gain: 0.2, decay: 0.55, delay: i * 0.17 })); }
  };
})(window);
