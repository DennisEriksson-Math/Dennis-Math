/* ═══════════════════════════════════════════════════════════
   PHYSICS — Tiny 2D circle physics: elastic collisions,
   wall bounce, drag-to-throw, spring tethers, idle drift.
   No dependencies. ~300 lines.
   ═══════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  const TAU = Math.PI * 2;

  class Body {
    constructor(opts) {
      this.el         = opts.el;
      this.id         = opts.id || Math.random().toString(36).slice(2);
      this.x          = opts.x || 0;
      this.y          = opts.y || 0;
      this.vx         = opts.vx || 0;
      this.vy         = opts.vy || 0;
      this.radius     = opts.radius || 60;
      this.mass       = opts.mass || 1;
      this.restitution= opts.restitution !== undefined ? opts.restitution : 0.94;
      this.damping    = opts.damping     !== undefined ? opts.damping     : 0.995;

      // Gentle sinusoidal forcing so nothing ever comes fully to rest.
      this.idleAmp    = opts.idleAmp  !== undefined ? opts.idleAmp  : 0.05;
      this.idleFreq   = opts.idleFreq !== undefined ? opts.idleFreq : 0.0009;
      this.phase      = Math.random() * TAU;

      // Optional spring back toward a point: {relX, relY} offsets from centre.
      this.tether     = opts.tether || null;
      this.tetherK    = opts.tetherK || 0;

      this.maxSpeed   = opts.maxSpeed || 20;
      this.onTap      = opts.onTap  || null;
      this.onHit      = opts.onHit  || null;

      this.dragging   = false;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
      this.dragHistory = [];
      this._tapX = 0; this._tapY = 0; this._tapT = 0; this._moved = false;
    }

    setPosition(x, y) { this.x = x; this.y = y; this.render(); }

    render() {
      // Element is sized 2r × 2r with its own top-left at 0,0 — we position by
      // subtracting the radius so (x, y) is the visual centre.
      this.el.style.transform =
        'translate3d(' + (this.x - this.radius) + 'px,' + (this.y - this.radius) + 'px,0)';
    }
  }

  // Some embedding contexts report 0 for innerWidth/innerHeight on the first
  // frame; fall back through documentElement before giving up on a default.
  function vw() { return window.innerWidth  || document.documentElement.clientWidth  || 1024; }
  function vh() { return window.innerHeight || document.documentElement.clientHeight || 768;  }

  class World {
    constructor(opts) {
      opts = opts || {};
      this.bodies          = [];
      this.margin          = opts.margin !== undefined ? opts.margin : 6;
      this.wallRestitution = opts.wallRestitution !== undefined ? opts.wallRestitution : 0.9;
      this.running = false;
      this.lastT = 0;
      this._t = 0;
      this._raf = null;
      this.width = vw();
      this.height = vh();

      window.addEventListener('resize', () => this.measure(), { passive: true });
      this.measure();
    }

    measure() {
      this.width  = vw();
      this.height = vh();
      for (const b of this.bodies) {
        b.x = clamp(b.x, b.radius + this.margin, this.width  - b.radius - this.margin);
        b.y = clamp(b.y, b.radius + this.margin, this.height - b.radius - this.margin);
        if (b.tether) {
          b.tether.x = this.width  / 2 + (b.tether.relX || 0);
          b.tether.y = this.height / 2 + (b.tether.relY || 0);
        }
        b.render();
      }
    }

    add(body) { this.bodies.push(body); body.render(); return body; }

    start() {
      if (this.running) return;
      this.running = true;
      this.lastT = performance.now();
      const loop = (t) => {
        if (!this.running) return;
        const dt = Math.min(33, t - this.lastT);   // cap for tab-switch stability
        this.lastT = t;
        this._t = t;
        this.step(dt / 16.67);                     // normalise to 60fps frame units
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }

    stop() {
      this.running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
    }

    step(f) {
      const W = this.width, H = this.height, M = this.margin;
      const bodies = this.bodies;

      /* ── Integrate ── */
      for (const b of bodies) {
        if (b.dragging) continue;

        if (b.tether && b.tetherK > 0) {
          b.vx += (b.tether.x - b.x) * b.tetherK * f;
          b.vy += (b.tether.y - b.y) * b.tetherK * f;
        }

        const ph = b.phase + this._t * b.idleFreq;
        b.vx += Math.sin(ph * 1.1) * b.idleAmp * f;
        b.vy += Math.cos(ph * 0.9) * b.idleAmp * f;

        const d = Math.pow(b.damping, f);
        b.vx *= d; b.vy *= d;

        const sp = Math.hypot(b.vx, b.vy);
        if (sp > b.maxSpeed) { b.vx = b.vx / sp * b.maxSpeed; b.vy = b.vy / sp * b.maxSpeed; }

        b.x += b.vx * f;
        b.y += b.vy * f;
      }

      /* ── Walls ── */
      for (const b of bodies) {
        if (b.dragging) continue;
        const r = b.radius;
        if (b.x < r + M)          { b.x = r + M;          b.vx =  Math.abs(b.vx) * this.wallRestitution; this._hit(b, Math.abs(b.vx)); }
        else if (b.x > W - r - M) { b.x = W - r - M;      b.vx = -Math.abs(b.vx) * this.wallRestitution; this._hit(b, Math.abs(b.vx)); }
        if (b.y < r + M)          { b.y = r + M;          b.vy =  Math.abs(b.vy) * this.wallRestitution; this._hit(b, Math.abs(b.vy)); }
        else if (b.y > H - r - M) { b.y = H - r - M;      b.vy = -Math.abs(b.vy) * this.wallRestitution; this._hit(b, Math.abs(b.vy)); }
      }

      /* ── Pairwise collisions (n is tiny; brute force is fine) ── */
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          this.collide(bodies[i], bodies[j]);
        }
      }

      /* ── Render ── */
      for (const b of bodies) if (!b.dragging) b.render();
    }

    collide(a, b) {
      const dx = b.x - a.x, dy = b.y - a.y;
      const min = a.radius + b.radius;
      let d = Math.hypot(dx, dy);
      if (d >= min) return;
      if (d === 0) { d = 0.01; }

      const nx = dx / d, ny = dy / d;

      // A dragged body behaves as if it had infinite mass.
      const ima = a.dragging ? 0 : 1 / a.mass;
      const imb = b.dragging ? 0 : 1 / b.mass;
      const imt = ima + imb;
      if (imt === 0) return;

      // Positional correction so bodies never sink into each other.
      const overlap = min - d;
      a.x -= nx * overlap * (ima / imt);
      a.y -= ny * overlap * (ima / imt);
      b.x += nx * overlap * (imb / imt);
      b.y += ny * overlap * (imb / imt);

      // Impulse along the collision normal.
      const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (vn > 0) return;                       // already separating

      const e = Math.min(a.restitution, b.restitution);
      const j = -(1 + e) * vn / imt;

      a.vx -= j * ima * nx; a.vy -= j * ima * ny;
      b.vx += j * imb * nx; b.vy += j * imb * ny;

      const strength = Math.min(1, Math.abs(vn) / 12);
      this._hit(a, Math.abs(vn), strength);
      this._hit(b, Math.abs(vn), strength);
    }

    _hit(body, speed, strength) {
      if (!body.onHit || speed < 1.2) return;
      body.onHit(strength !== undefined ? strength : Math.min(1, speed / 12));
    }

    /* ── Pointer drag-and-throw ── */
    bindDrag(body) {
      const el = body.el;
      el.style.touchAction = 'none';

      el.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
        body.dragging = true;
        body._moved = false;
        body._tapX = e.clientX; body._tapY = e.clientY;
        body._tapT = performance.now();
        body.dragOffsetX = e.clientX - body.x;
        body.dragOffsetY = e.clientY - body.y;
        body.dragHistory.length = 0;
        el.classList.add('is-dragging');
      });

      el.addEventListener('pointermove', (e) => {
        if (!body.dragging) return;
        if (Math.abs(e.clientX - body._tapX) > 4 || Math.abs(e.clientY - body._tapY) > 4) {
          body._moved = true;
        }
        body.x = clamp(e.clientX - body.dragOffsetX, body.radius, this.width  - body.radius);
        body.y = clamp(e.clientY - body.dragOffsetY, body.radius, this.height - body.radius);
        body.dragHistory.push({ x: body.x, y: body.y, t: performance.now() });
        if (body.dragHistory.length > 6) body.dragHistory.shift();
        body.render();
      });

      const end = (e) => {
        if (!body.dragging) return;
        body.dragging = false;
        el.classList.remove('is-dragging');
        try { el.releasePointerCapture(e.pointerId); } catch (_) {}

        // Throw velocity from the tail of the pointer history.
        const h = body.dragHistory;
        if (h.length >= 2) {
          const a = h[0], z = h[h.length - 1];
          const dt = Math.max(16, z.t - a.t);
          body.vx = (z.x - a.x) / dt * 16.67;
          body.vy = (z.y - a.y) / dt * 16.67;
        }

        const quick = performance.now() - body._tapT < 450;
        if (!body._moved && quick && body.onTap) body.onTap();
      };

      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    }
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  global.Physics = { Body, World };

})(window);
