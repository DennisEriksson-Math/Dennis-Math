/* ═══════════════════════════════════════════════════════════
   SFX — every sound in the game, synthesised at runtime.
   No audio files. Built on the first user gesture.
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
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    // One second of white noise, reused by every percussive sound.
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

  /* A burst of filtered noise — the "paper" half of most sounds. */
  function noise(opts) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;

    const filt = ctx.createBiquadFilter();
    filt.type = opts.type || 'bandpass';
    filt.frequency.value = opts.freq || 1200;
    filt.Q.value = opts.q || 1.2;

    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(opts.gain || 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (opts.decay || 0.09));

    src.connect(filt).connect(g).connect(master);
    src.start(t);
    src.stop(t + (opts.decay || 0.09) + 0.02);
  }

  /* A pitched tone — the "body" half. */
  function tone(opts) {
    const osc = ctx.createOscillator();
    osc.type = opts.type || 'sine';

    const t = ctx.currentTime + (opts.delay || 0);
    osc.frequency.setValueAtTime(opts.from || 220, t);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + (opts.decay || 0.15));

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.gain || 0.25, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (opts.decay || 0.15));

    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + (opts.decay || 0.15) + 0.03);
  }

  global.SFX = {
    enabled() { return !muted; },

    mute(v) {
      muted = v;
      if (master) master.gain.value = v ? 0 : 0.9;
    },

    unlock() { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); },

    /* Crumpling a sticky note. */
    whack() {
      if (!ready()) return;
      noise({ freq: 1600, q: 0.9, gain: 0.34, decay: 0.085 });
      tone({ type: 'triangle', from: 320, to: 120, gain: 0.2, decay: 0.1 });
    },

    /* Landing a hit on the boss — lower, meatier. */
    thud() {
      if (!ready()) return;
      noise({ freq: 700, q: 0.7, gain: 0.4, decay: 0.13 });
      tone({ type: 'sine', from: 150, to: 55, gain: 0.42, decay: 0.2 });
    },

    /* Finishing the boss off. */
    defeat() {
      if (!ready()) return;
      noise({ freq: 500, q: 0.5, gain: 0.45, decay: 0.3 });
      [196, 262, 330, 392].forEach((f, i) =>
        tone({ type: 'triangle', from: f, gain: 0.2, decay: 0.34, delay: i * 0.06 }));
    },

    /* Collecting something good. */
    chime() {
      if (!ready()) return;
      [523.25, 783.99].forEach((f, i) =>
        tone({ type: 'sine', from: f, gain: 0.22, decay: 0.5, delay: i * 0.07 }));
    },

    /* Something slipped away unhandled. */
    miss() {
      if (!ready()) return;
      tone({ type: 'sawtooth', from: 160, to: 70, gain: 0.16, decay: 0.28 });
      noise({ type: 'lowpass', freq: 400, gain: 0.14, decay: 0.2 });
    },

    /* A new dread appearing. */
    pop() {
      if (!ready()) return;
      noise({ freq: 2400, q: 2, gain: 0.09, decay: 0.045 });
    },

    /* Burnout. */
    over() {
      if (!ready()) return;
      [330, 262, 196, 147].forEach((f, i) =>
        tone({ type: 'sawtooth', from: f, to: f * 0.6, gain: 0.2, decay: 0.5, delay: i * 0.16 }));
    }
  };

})(window);
