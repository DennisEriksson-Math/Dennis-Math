/* ═══════════════════════════════════════════════════════════
   AUDIO — A self-contained ambient drone via WebAudio.
   Two detuned saw pads through a slow filter sweep, plus a
   soft noise bed. No files, no external player.
   ═══════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  let ctx = null, master = null, started = false, on = false;

  function build() {
    const AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // ── Filtered pad: a stack of detuned oscillators ──
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 6;
    filter.connect(master);

    // Slow sweep of the cutoff, so the texture keeps moving.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.035;
    lfoGain.gain.value = 240;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    // A low, open voicing — root, fifth, octave, tenth.
    [55, 82.5, 110, 138.6].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? 'sawtooth' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (i - 1.5) * 7;          // gentle chorus

      const g = ctx.createGain();
      g.gain.value = 0.16 / (i + 1);

      // Independent slow tremolo per voice keeps it from sounding static.
      const trem = ctx.createOscillator();
      const tremGain = ctx.createGain();
      trem.frequency.value = 0.05 + i * 0.017;
      tremGain.gain.value = 0.05 / (i + 1);
      trem.connect(tremGain).connect(g.gain);
      trem.start();

      osc.connect(g).connect(filter);
      osc.start();
    });

    // ── Noise bed: shaped white noise, very quiet ──
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;

    const nFilter = ctx.createBiquadFilter();
    nFilter.type = 'bandpass';
    nFilter.frequency.value = 640;
    nFilter.Q.value = 0.7;

    const nGain = ctx.createGain();
    nGain.gain.value = 0.016;

    noise.connect(nFilter).connect(nGain).connect(master);
    noise.start();

    started = true;
    return true;
  }

  function fade(to, seconds) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(to, now + seconds);
  }

  global.Ambient = {
    isOn() { return on; },
    toggle() {
      if (!started && !build()) return false;
      if (ctx.state === 'suspended') ctx.resume();
      on = !on;
      fade(on ? 0.5 : 0, on ? 2.4 : 1.1);
      return on;
    }
  };

})(window);
