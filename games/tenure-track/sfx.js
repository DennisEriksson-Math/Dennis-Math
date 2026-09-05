/* ═══════════════════════════════════════════════════════════
   SFX — typewriter, rubber stamp, filing cabinet. Synthesised.
   ═══════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  let ctx = null, master = null, noiseBuf = null, muted = false;

  function init() {
    if (ctx) return true;
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);
    const len = ctx.sampleRate;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function ready() {
    if (!init()) return false;
    if (ctx.state === 'suspended') ctx.resume();
    return !muted;
  }

  function noise(o) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.value = o.freq || 1400;
    f.Q.value = o.q || 1;
    const g = ctx.createGain();
    const t = ctx.currentTime + (o.delay || 0);
    g.gain.setValueAtTime(o.gain || 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (o.decay || 0.07));
    src.connect(f).connect(g).connect(master);
    src.start(t); src.stop(t + (o.decay || 0.07) + 0.02);
  }

  function tone(o) {
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    const t = ctx.currentTime + (o.delay || 0);
    osc.frequency.setValueAtTime(o.from || 300, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.decay || 0.2));
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (o.decay || 0.2));
    osc.connect(g).connect(master);
    osc.start(t); osc.stop(t + (o.decay || 0.2) + 0.03);
  }

  global.SFX = {
    mute(v) { muted = v; if (master) master.gain.value = v ? 0 : 0.85; },
    unlock() { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); },

    /* Typewriter key. */
    key() {
      if (!ready()) return;
      noise({ freq: 2200, q: 1.6, gain: 0.13, decay: 0.035 });
      tone({ type: 'square', from: 180, to: 90, gain: 0.05, decay: 0.04 });
    },

    /* Rubber stamp coming down. */
    stamp() {
      if (!ready()) return;
      noise({ freq: 620, q: 0.6, gain: 0.34, decay: 0.11 });
      tone({ type: 'sine', from: 130, to: 48, gain: 0.4, decay: 0.19 });
    },

    /* A memo slides onto the desk. */
    slide() {
      if (!ready()) return;
      noise({ type: 'highpass', freq: 1500, gain: 0.12, decay: 0.2 });
    },

    good() {
      if (!ready()) return;
      [523.25, 659.25].forEach((f, i) => tone({ from: f, gain: 0.18, decay: 0.4, delay: i * 0.07 }));
    },

    bad() {
      if (!ready()) return;
      tone({ type: 'sawtooth', from: 220, to: 96, gain: 0.16, decay: 0.34 });
    },

    /* The vote. */
    granted() {
      if (!ready()) return;
      [392, 523.25, 659.25, 783.99].forEach((f, i) =>
        tone({ type: 'triangle', from: f, gain: 0.2, decay: 0.7, delay: i * 0.13 }));
    },

    denied() {
      if (!ready()) return;
      [330, 262, 196, 131].forEach((f, i) =>
        tone({ type: 'sawtooth', from: f, to: f * 0.6, gain: 0.19, decay: 0.6, delay: i * 0.19 }));
    }
  };

})(window);
