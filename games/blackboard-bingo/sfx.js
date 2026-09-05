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
    /* The speaker says another thing. */
    say()  { if (ready()) noise({ type: 'bandpass', freq: 900, q: 0.8, gain: 0.07, decay: 0.11 }); },
    /* Pencil crossing off a square. */
    mark() { if (ready()) { noise({ freq: 2000, q: 1.2, gain: 0.16, decay: 0.06 });
                            tone({ type: 'triangle', from: 620, to: 380, gain: 0.12, decay: 0.09 }); } },
    /* It was on your card and you missed it. */
    miss() { if (ready()) tone({ type: 'sine', from: 190, to: 110, gain: 0.11, decay: 0.24 }); },
    line() { if (ready()) [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
               tone({ type: 'triangle', from: f, gain: 0.2, decay: 0.5, delay: i * 0.08 })); },
    doze() { if (ready()) [220, 165, 110].forEach((f, i) =>
               tone({ type: 'sine', from: f, to: f * 0.7, gain: 0.19, decay: 0.7, delay: i * 0.22 })); },
    applause() { if (ready()) { noise({ type: 'bandpass', freq: 2000, q: 0.4, gain: 0.22, decay: 1.4 });
                                noise({ type: 'bandpass', freq: 1200, q: 0.3, gain: 0.16, decay: 1.1 }); } }
  };
})(window);
