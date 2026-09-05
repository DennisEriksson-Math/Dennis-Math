/* ═══════════════════════════════════════════════════════════
   SFX — chalk on slate, synthesised. No audio files.
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
    src.playbackRate.value = o.rate || 1;
    const f = ctx.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.frequency.value = o.freq || 1800;
    f.Q.value = o.q || 1;
    const g = ctx.createGain();
    const t = ctx.currentTime + (o.delay || 0);
    g.gain.setValueAtTime(o.gain || 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (o.decay || 0.08));
    src.connect(f).connect(g).connect(master);
    src.start(t);
    src.stop(t + (o.decay || 0.08) + 0.02);
  }

  function tone(o) {
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    const t = ctx.currentTime + (o.delay || 0);
    osc.frequency.setValueAtTime(o.from || 440, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.decay || 0.2));
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (o.decay || 0.2));
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + (o.decay || 0.2) + 0.03);
  }

  global.SFX = {
    enabled() { return !muted; },
    mute(v) { muted = v; if (master) master.gain.value = v ? 0 : 0.85; },
    unlock() { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); },

    /* A short chalk tap. */
    tap() {
      if (!ready()) return;
      noise({ freq: 2600, q: 1.4, gain: 0.16, decay: 0.05 });
    },

    /* Chalk circling the counterexample. */
    circle() {
      if (!ready()) return;
      noise({ freq: 1900, q: 0.8, gain: 0.2, decay: 0.34, rate: 0.85 });
      [523.25, 659.25, 783.99].forEach((f, i) =>
        tone({ type: 'sine', from: f, gain: 0.17, decay: 0.4, delay: i * 0.07 }));
    },

    /* Wrong: chalk squeaks. */
    squeak() {
      if (!ready()) return;
      tone({ type: 'sawtooth', from: 1100, to: 380, gain: 0.13, decay: 0.22 });
      noise({ freq: 3200, q: 3, gain: 0.18, decay: 0.16 });
    },

    /* The round ran out. */
    timeout() {
      if (!ready()) return;
      tone({ type: 'triangle', from: 300, to: 120, gain: 0.2, decay: 0.4 });
      noise({ type: 'lowpass', freq: 500, gain: 0.14, decay: 0.3 });
    },

    /* Out of errata. */
    over() {
      if (!ready()) return;
      [392, 311, 262, 196].forEach((f, i) =>
        tone({ type: 'triangle', from: f, to: f * 0.62, gain: 0.2, decay: 0.55, delay: i * 0.17 }));
    }
  };

})(window);
