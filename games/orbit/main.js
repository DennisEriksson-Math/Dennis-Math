/* ═══════════════════════════════════════════════════════════
   MAIN — scene data, DOM construction, layout, panes, HUD.
   Everything you'd swap to make this yours lives in ORBS.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Data: the orbs and what they open ──────────────────
     Each orb: label, accent colour, relative size, and a pane
     that is either { kind:'links', items:[…] } or
     { kind:'prose', body:[…] }.
     ──────────────────────────────────────────────────────── */

  const ORBS = [
    {
      id: 'about',
      label: 'About',
      accent: '#7fa8ff',
      size: 158,
      pane: {
        title: 'About',
        subtitle: 'What this is and where it came from',
        kind: 'prose',
        body: [
          'This is a template for a personal landing page that behaves like a toy rather than a document. Everything you see is DOM elements and CSS — no canvas, no WebGL, no framework, no build step.',
          'The orbs are real physical bodies. They drift, collide elastically with each other and with the rocket, bounce off the edges of the window, and carry momentum when you throw them. <strong>Grab one and fling it.</strong>',
          'Replace the <code>ORBS</code> array in <code>main.js</code> with your own sections and you have your own version. Nothing else needs to change.'
        ]
      }
    },
    {
      id: 'work',
      label: 'Selected\nWork',
      accent: '#63e6be',
      size: 172,
      pane: {
        title: 'Selected Work',
        subtitle: 'Projects worth showing someone',
        kind: 'links',
        items: [
          { title: 'Project one — a short line about what it was', meta: '2026 · Case study' },
          { title: 'Project two — the problem, and what changed', meta: '2025 · Product' },
          { title: 'Project three — a thing built mostly for fun', meta: '2025 · Side project' },
          { title: 'Project four — collaboration with someone good', meta: '2024 · Team' },
          { title: 'Project five — the one that did not work', meta: '2024 · Postmortem' }
        ]
      }
    },
    {
      id: 'writing',
      label: 'Writing',
      accent: '#c9a7ff',
      size: 146,
      pane: {
        title: 'Writing',
        subtitle: 'Essays, notes, and half-finished arguments',
        kind: 'links',
        items: [
          { title: 'On making software that feels like a place', meta: 'Essay · 8 min' },
          { title: 'Notes toward a smaller toolchain', meta: 'Notes · 4 min' },
          { title: 'Why the best interfaces are slightly rude', meta: 'Essay · 11 min' },
          { title: 'A field guide to premature abstraction', meta: 'Essay · 6 min' }
        ]
      }
    },
    {
      id: 'experiments',
      label: 'Experiments',
      accent: '#ff9ec4',
      size: 150,
      pane: {
        title: 'Experiments',
        subtitle: 'Small things, built to find something out',
        kind: 'links',
        items: [
          { title: 'A physics engine in 300 lines', meta: 'JavaScript' },
          { title: 'Starfields without a single image', meta: 'CSS' },
          { title: 'Ambient sound from four oscillators', meta: 'WebAudio' },
          { title: 'Layout that survives any window size', meta: 'CSS' }
        ]
      }
    },
    {
      id: 'now',
      label: 'Now',
      accent: '#ffcf7a',
      size: 134,
      pane: {
        title: 'Now',
        subtitle: 'What has my attention this month',
        kind: 'prose',
        body: [
          'A <strong>now page</strong> is a snapshot rather than a résumé — what you are actually doing, dated, and honest about being out of date the moment you stop editing it.',
          'Reading something long and difficult. Building something small and finishable. Trying to do fewer things at once, with mixed results.',
          'Last updated: swap this line whenever you remember to.'
        ]
      }
    },
    {
      id: 'colophon',
      label: 'Colophon',
      accent: '#8fd8ff',
      size: 140,
      pane: {
        title: 'Colophon',
        subtitle: 'How this page is actually put together',
        kind: 'prose',
        body: [
          'Four files, no dependencies. <code>physics.js</code> is a ~250-line 2D engine: circle–circle elastic collisions with impulse resolution, positional correction so bodies never sink into each other, wall bounce with restitution, a spring tether holding the rocket near centre, and drag-release velocity computed from pointer history.',
          'The <strong>starfield</strong> is fourteen tiled <code>radial-gradient</code> dots at three background-sizes for parallax. The <strong>nebulae</strong> are three blurred gradients on slow alternating drifts. The <strong>grain</strong> is an inline SVG <code>feTurbulence</code>. The orbs are stacked gradients — specular highlight, warm rim light, and a counter-rotating conic gradient for the plasma.',
          'The ambient sound is four detuned oscillators through a slowly swept lowpass filter, plus a bandpassed noise bed. No audio files.',
          'Motion respects <code>prefers-reduced-motion</code>. The whole thing is about 1,400 lines.'
        ]
      }
    },
    {
      id: 'contact',
      label: 'Contact',
      accent: '#a0f0d0',
      size: 128,
      pane: {
        title: 'Contact',
        subtitle: 'Ways to reach a person',
        kind: 'links',
        items: [
          { title: 'Email', meta: 'you@example.com' },
          { title: 'GitHub', meta: '@yourhandle' },
          { title: 'Mastodon', meta: '@you@instance.social' },
          { title: 'RSS', meta: 'Subscribe to the writing' }
        ]
      }
    }
  ];

  /* ─── The rocket at the centre ──────────────────────────── */

  const ROCKET_SVG = `
<svg class="core-svg" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="body" x1="60" y1="20" x2="145" y2="150" gradientUnits="userSpaceOnUse">
      <stop offset="0"    stop-color="#ffffff"/>
      <stop offset="0.45" stop-color="#dfe6f5"/>
      <stop offset="1"    stop-color="#93a3c4"/>
    </linearGradient>
    <linearGradient id="fin" x1="40" y1="110" x2="70" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ff8f6b"/>
      <stop offset="1" stop-color="#d9455f"/>
    </linearGradient>
    <linearGradient id="glass" x1="86" y1="62" x2="116" y2="92" gradientUnits="userSpaceOnUse">
      <stop offset="0"   stop-color="#bfe4ff"/>
      <stop offset="0.5" stop-color="#5aa6e8"/>
      <stop offset="1"   stop-color="#1d3f78"/>
    </linearGradient>
    <linearGradient id="fire" x1="100" y1="150" x2="100" y2="205" gradientUnits="userSpaceOnUse">
      <stop offset="0"   stop-color="#fff2b0"/>
      <stop offset="0.4" stop-color="#ffb03a"/>
      <stop offset="1"   stop-color="#ff4d2e" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- exhaust -->
  <g class="flame">
    <path d="M74 155 C 82 200, 118 200, 126 155 Z" fill="url(#fire)"/>
    <path d="M86 155 C 91 184, 109 184, 114 155 Z" fill="#fff6cf" opacity="0.85"/>
  </g>

  <!-- fins -->
  <path d="M66 106 C 44 126, 37 152, 43 172 L 66 150 Z" fill="url(#fin)"/>
  <path d="M134 106 C 156 126, 163 152, 157 172 L 134 150 Z" fill="url(#fin)"/>

  <!-- body -->
  <path d="M100 12 C 129 46, 141 100, 135 150 L 65 150 C 59 100, 71 46, 100 12 Z" fill="url(#body)"/>
  <path d="M100 12 C 86 46, 79 100, 81 150 L 65 150 C 59 100, 71 46, 100 12 Z" fill="#ffffff" opacity="0.45"/>

  <!-- window -->
  <circle cx="100" cy="76" r="21" fill="#2a3358"/>
  <circle cx="100" cy="76" r="16" fill="url(#glass)"/>
  <path d="M90 68 a13 13 0 0 1 12 -5" stroke="#ffffff" stroke-opacity="0.75" stroke-width="3" stroke-linecap="round"/>

  <!-- skirt -->
  <path d="M65 150 L135 150 L129 167 L71 167 Z" fill="#8794b5"/>
  <path d="M65 150 L135 150 L133 156 L67 156 Z" fill="#e4eaf7"/>
</svg>`;

  /* ─── DOM helper ─────────────────────────────────────────── */

  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'className') el.className = attrs[k];
        else if (k === 'html') el.innerHTML = attrs[k];
        else if (k === 'style') el.setAttribute('style', attrs[k]);
        else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else el.setAttribute(k, attrs[k]);
      }
    }
    (children || []).forEach((c) => {
      if (c == null) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  /* ─── Construction ───────────────────────────────────────── */

  function makeOrb(spec, size) {
    const label = h('div', { className: 'orb-label' });
    spec.label.split('\n').forEach((line, i) => {
      if (i) label.appendChild(document.createElement('br'));
      label.appendChild(document.createTextNode(line));
    });

    return h('div', {
      className: 'orb',
      'data-id': spec.id,
      style: `--size:${size}px; --accent:${spec.accent};`
    }, [
      h('div', { className: 'orb-inner' }, [
        h('div', { className: 'orb-sphere' }, [
          h('div', { className: 'orb-plasma' }),
          h('div', { className: 'orb-plasma rev' })
        ]),
        h('div', { className: 'orb-ring orb-ring-1' }),
        h('div', { className: 'orb-ring orb-ring-2' }),
        label
      ])
    ]);
  }

  function makeCore(size) {
    return h('div', {
      className: 'core',
      style: `--size:${size}px;`
    }, [
      h('div', { className: 'core-inner' }, [
        h('div', { className: 'core-glow' }),
        h('div', { className: 'core-rocket', html: ROCKET_SVG })
      ])
    ]);
  }

  /* ─── Hologram pane ──────────────────────────────────────── */

  const host = document.getElementById('hologram-host');
  let openId = null;

  function openPane(spec) {
    if (openId === spec.id) return;
    openId = spec.id;

    const p = spec.pane;
    const body = h('div', { className: 'pane-body' });

    if (p.kind === 'prose') {
      const prose = h('div', { className: 'pane-prose' });
      p.body.forEach((para) => prose.appendChild(h('p', { html: para })));
      body.appendChild(prose);
    } else {
      body.appendChild(h('div', { className: 'pane-section-label' }, [p.label || 'Index']));
      p.items.forEach((item) => {
        const href = item.href || '#';
        const isPlaceholder = href === '#';
        body.appendChild(h('a', {
          className: 'pane-link' + (isPlaceholder ? ' is-placeholder' : ''),
          href: href,
          target: isPlaceholder ? null : '_blank',
          rel: isPlaceholder ? null : 'noopener',
          onClick: isPlaceholder ? (e) => e.preventDefault() : null
        }, [
          h('div', { className: 'pane-link-text' }, [
            h('div', { className: 'pane-link-title' }, [item.title]),
            item.meta ? h('div', { className: 'pane-link-meta' }, [item.meta]) : null
          ]),
          h('div', { className: 'pane-link-arrow' }, ['→'])
        ]));
      });
    }

    const pane = h('div', {
      className: 'pane' + (p.kind === 'prose' ? ' wide' : ''),
      style: `--accent:${spec.accent};`,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': p.title
    }, [
      h('div', { className: 'pane-corner tl' }), h('div', { className: 'pane-corner tr' }),
      h('div', { className: 'pane-corner bl' }), h('div', { className: 'pane-corner br' }),
      h('div', { className: 'pane-scan' }),
      h('div', { className: 'pane-head' }, [
        h('div', { className: 'pane-badge' }),
        h('div', { className: 'pane-head-text' }, [
          h('div', { className: 'pane-title' }, [p.title]),
          h('div', { className: 'pane-sub' }, [p.subtitle || ''])
        ]),
        h('button', { className: 'pane-close', type: 'button', 'aria-label': 'Close', onClick: closePane }, ['×'])
      ]),
      body
    ]);

    host.innerHTML = '';
    host.style.setProperty('--accent', spec.accent);
    host.appendChild(pane);
    host.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => host.classList.add('is-open'));
    document.addEventListener('keydown', escClose);
  }

  function closePane() {
    if (!openId) return;
    openId = null;
    host.classList.remove('is-open');
    host.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', escClose);
    setTimeout(() => { if (!openId) host.innerHTML = ''; }, 520);
  }

  function escClose(e) { if (e.key === 'Escape') closePane(); }

  host.addEventListener('pointerdown', (e) => { if (e.target === host) closePane(); });

  /* ─── HUD telemetry ──────────────────────────────────────── */

  function startHud() {
    const timeEl = document.getElementById('tele-time');
    const coordEl = document.getElementById('tele-coords');
    const lat0 = 34.1377, lon0 = -118.1253;   // drift around a fixed point
    const t0 = Date.now();

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const d = new Date();
      timeEl.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
      const s = (Date.now() - t0) / 1000;
      const lat = lat0 + Math.sin(s * 0.05) * 0.004;
      const lon = lon0 + Math.cos(s * 0.037) * 0.004;
      coordEl.textContent = 'LAT ' + lat.toFixed(3) + ' · LON ' + lon.toFixed(3);
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ─── Layout: seat the orbs on an ellipse around the core ──
     An ellipse rather than a circle, so tall phone viewports use
     their vertical space instead of crowding into a band.
     ──────────────────────────────────────────────────────── */

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  function layout(world, core, orbs) {
    const W = world.width, H = world.height;
    const cx = W / 2, cy = H / 2;
    const N = orbs.length;
    const offset = -Math.PI / 2 + 0.35;

    core.setPosition(cx, cy);
    core.vx = core.vy = 0;

    // Keep the ring clear of the core, then fill whatever space remains.
    const biggest = orbs.reduce((m, b) => Math.max(m, b.radius), 0);
    const floor = core.radius + biggest + 14;
    const rx = Math.max(floor, W * 0.33);
    const ry = Math.max(floor, H * 0.31);

    orbs.forEach((b, i) => {
      const a = offset + (i / N) * Math.PI * 2;
      // Slight radial jitter so the ring does not read as a perfect ellipse.
      const j = 0.92 + ((i * 37) % 11) / 60;
      b.setPosition(
        clamp(cx + Math.cos(a) * rx * j, b.radius + 8, W - b.radius - 8),
        clamp(cy + Math.sin(a) * ry * j, b.radius + 8, H - b.radius - 8)
      );
      b.vx = b.vy = 0;
    });
  }

  /* ─── Boot ───────────────────────────────────────────────── */

  function viewport() {
    const w = window.innerWidth  || document.documentElement.clientWidth  || 1024;
    const h = window.innerHeight || document.documentElement.clientHeight || 768;
    return { w: w, h: h, m: Math.min(w, h) };
  }

  function boot() {
    const scene = document.getElementById('scene');
    const world = new Physics.World({ margin: 8, wallRestitution: 0.88 });

    /* Core — the rocket. Sized in applyScale(), not here. */
    const coreEl = makeCore(200);
    scene.appendChild(coreEl);

    const core = world.add(new Physics.Body({
      el: coreEl,
      id: 'core',
      radius: 72,
      mass: 4.5,
      restitution: 0.9,
      damping: 0.99,
      idleAmp: 0.02,
      maxSpeed: 16,
      tether: { relX: 0, relY: 0, x: world.width / 2, y: world.height / 2 },
      tetherK: 0.0016
    }));
    world.bindDrag(core);

    /* Orbs */
    const orbBodies = ORBS.map((spec) => {
      const el = makeOrb(spec, 140);
      scene.appendChild(el);

      let hitTimer = null;
      const body = world.add(new Physics.Body({
        el: el,
        id: spec.id,
        radius: 70,
        mass: 1,
        restitution: 0.95,
        damping: 0.996,
        idleAmp: 0.05,
        onTap: () => openPane(spec),
        onHit: () => {
          el.classList.add('is-hit');
          clearTimeout(hitTimer);
          hitTimer = setTimeout(() => el.classList.remove('is-hit'), 260);
        }
      }));
      world.bindDrag(body);
      return body;
    });

    /* Sizes derive from the viewport, so the scene works at any dimension. */
    function applyScale() {
      const v = viewport();
      const scale = Math.max(0.55, Math.min(1.15, v.m / 880));

      const coreSize = Math.max(160, Math.round(v.m * 0.34));
      coreEl.style.setProperty('--size', coreSize + 'px');
      core.radius = coreSize * 0.36;      // the rocket does not fill its box

      orbBodies.forEach((body, i) => {
        const size = Math.max(76, Math.round(ORBS[i].size * scale));
        body.el.style.setProperty('--size', size + 'px');
        body.radius = size / 2;
        body.mass = size / 150;
      });
    }

    // Re-measure, re-size, re-seat. Cheap and idempotent — we call it a few
    // times during startup because some contexts report a 0×0 viewport on the
    // first frame.
    function settle() {
      world.measure();
      applyScale();
      layout(world, core, orbBodies);
    }

    settle();
    world.start();
    startHud();

    requestAnimationFrame(settle);
    window.addEventListener('load', settle);
    setTimeout(settle, 400);

    /* Rotation / window resize: rescale always, re-seat only on big changes. */
    let lastM = viewport().m, resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const m = viewport().m;
        applyScale();
        if (Math.abs(m - lastM) > 120) { lastM = m; layout(world, core, orbBodies); }
      }, 260);
    }, { passive: true });

    /* Sound toggle */
    const soundBtn = document.getElementById('sound-toggle');
    soundBtn.addEventListener('click', () => {
      const on = window.Ambient.toggle();
      soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      soundBtn.setAttribute('aria-label', on ? 'Turn ambient sound off' : 'Turn ambient sound on');
    });

    /* Lift the curtain */
    const intro = document.getElementById('intro');
    setTimeout(() => {
      intro.classList.add('is-done');
      setTimeout(() => intro.remove(), 1000);
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
